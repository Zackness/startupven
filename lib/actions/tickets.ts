"use server";

import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { TicketPaymentStatus, TicketCategory } from "@/lib/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTodayStartUTC } from "@/lib/utils";

/** Desactiva platos con fecha específica ya pasada (compara en UTC como la BD). */
async function deactivateExpiredTicketTypes() {
  const today = getTodayStartUTC();
  await db.ticketType.updateMany({
    where: {
      availableForDate: { lt: today },
      active: true,
    },
    data: { active: false },
  });
}

export async function getTicketTypes() {
  await deactivateExpiredTicketTypes();
  const types = await db.ticketType.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return types.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    lugar: t.lugar,
    price: Number(t.price),
    description: t.description,
    image: t.image,
    availableForDate: t.availableForDate,
  }));
}

async function ensureVendorOrAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "VENDEDOR") redirect("/escritorio");
  return session;
}

export async function getMyTickets() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tickets = await db.ticket.findMany({
    where: { userId: session.user.id },
    include: { ticketType: true },
    orderBy: { mealDate: "desc" },
    take: 50,
  });

  const todayStart = getTodayStartUTC();

  return tickets.map((t) => {
    let status: "CANJEADO" | "VENCIDO" | "DISPONIBLE" | "PENDIENTE_PAGO";

    if (t.paymentStatus === "PENDIENTE") {
      status = "PENDIENTE_PAGO";
    } else if (t.usedAt) {
      status = "CANJEADO";
    } else if (t.mealDate < todayStart) {
      status = "VENCIDO";
    } else {
      status = "DISPONIBLE";
    }

    return {
      id: t.id,
      ticketTypeName: t.ticketType.name,
      mealDate: t.mealDate,
      usedAt: t.usedAt,
      createdAt: t.createdAt,
      status,
      paymentStatus: t.paymentStatus,
    };
  });
}

export async function buyTicket(
  ticketTypeId: string,
  mealDate: Date,
  paymentMethod: string = "PAGO_MOVIL",
  paymentReference?: string,
  paymentBank?: string
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const type = await db.ticketType.findFirst({
    where: { id: ticketTypeId, active: true },
    select: { id: true, name: true, price: true, lugar: true, maxQuantity: true },
  });
  if (!type) throw new Error("Tipo de ticket no disponible");

  // Normalizar fecha (solo día) para coherencia con @db.Date
  const mealDateNorm = new Date(mealDate);
  mealDateNorm.setHours(0, 0, 0, 0);

  if (type.maxQuantity != null) {
    const sold = await db.ticket.count({
      where: {
        ticketTypeId: type.id,
        mealDate: mealDateNorm,
        paymentStatus: { not: "REEMBOLSADO" },
      },
    });
    if (sold >= type.maxQuantity) {
      throw new Error("No hay cupo disponible para este plato en la fecha seleccionada.");
    }
  }

  // Regla de negocio: por la página de cliente SOLO se permite
  // un ticket de COMEDOR por día. Si ya tiene uno, debe pedir
  // al vendedor que registre manualmente otro.
  if (type.lugar === "COMEDOR") {
    const existingForDay = await db.ticket.findFirst({
      where: {
        userId: session.user.id,
        mealDate: mealDateNorm,
        ticketType: { lugar: "COMEDOR" },
      },
    });
    if (existingForDay) {
      throw new Error(
        "Ya tienes un ticket de comedor para ese día. Si necesitas otra comida, pídele al vendedor que la registre manualmente."
      );
    }
  }

  if (paymentMethod === "WALLET") {
    return await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: session.user.id } });
      if (!user) throw new Error("Usuario no encontrado");

      const balanceNum = Number(user.balance);
      const priceNum = Number(type.price);
      if (balanceNum < priceNum) {
        throw new Error("Saldo insuficiente");
      }

      if (type.lugar === "COMEDOR") {
        const existingForDay = await tx.ticket.findFirst({
          where: {
            userId: session.user.id,
            mealDate: mealDateNorm,
            ticketType: { lugar: "COMEDOR" },
          },
        });
        if (existingForDay) {
          throw new Error(
            "Ya tienes un ticket de comedor para ese día. Si necesitas otra comida, pídele al vendedor que la registre manualmente."
          );
        }
      }

      if (type.maxQuantity != null) {
        const sold = await tx.ticket.count({
          where: {
            ticketTypeId: type.id,
            mealDate: mealDateNorm,
            paymentStatus: { not: "REEMBOLSADO" },
          },
        });
        if (sold >= type.maxQuantity) {
          throw new Error("No hay cupo disponible para este plato en la fecha seleccionada.");
        }
      }

      // Deduct balance
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: type.price } }
      });

      // Create Transaction
      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          amount: type.price.negated(),
          type: "COMPRA",
          reference: `Compra de ${type.name}`,
        }
      });

      // Create Ticket
      await tx.ticket.create({
        data: {
          userId: session.user.id,
          ticketTypeId: type.id,
          mealDate: mealDateNorm,
          paymentStatus: "PAGADO", // Wallet payments are instant
          paymentMethod,
        },
      });
    });
  }

  // Default / Manual Payment
  await db.ticket.create({
    data: {
      userId: session.user.id,
      ticketTypeId: type.id,
      mealDate: mealDateNorm,
      paymentStatus: "PENDIENTE",
      paymentMethod,
      paymentReference,
      paymentBank,
    },
  });

  revalidatePath("/escritorio");
  revalidatePath("/escritorio/mis-tickets");
}

/**
 * Crea un ticket de ejemplo (compra ficticia) para mostrar al cliente.
 * Usa el primer tipo activo y la fecha de hoy.
 */
export async function createDemoTicket() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const type = await db.ticketType.findFirst({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  if (!type) throw new Error("No hay tipos de ticket. Crea uno en el panel admin.");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.ticket.create({
    data: {
      userId: session.user.id,
      ticketTypeId: type.id,
      mealDate: today,
      paymentStatus: "PAGADO",
    },
  });
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/mis-tickets");
}

export async function getAdminStats() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const todayStart = getTodayStartUTC();
  const todayEnd = new Date(Date.UTC(
    todayStart.getUTCFullYear(),
    todayStart.getUTCMonth(),
    todayStart.getUTCDate(),
    23, 59, 59, 999
  ));
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const last7Start = new Date(todayStart);
  last7Start.setUTCDate(last7Start.getUTCDate() - 6);
  const monthStart = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth(), 1, 0, 0, 0, 0));
  const nextMonthStart = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth() + 1, 1, 0, 0, 0, 0));

  const [
    totalTickets,
    ticketsTodayMenu,
    salesToday,
    ticketTypesCount,
    totalUsers,
    usersByRoleRaw,
    ticketsPendingPayment,
    ticketsRedeemed,
    ticketsExpired,
    ticketsAvailable,
    ticketsByDayRaw,
    salesLast7Rows,
    salesMonthRows,
  ] = await Promise.all([
    db.ticket.count(),
    db.ticket.count({
      where: {
        mealDate: { gte: todayStart, lt: tomorrowStart },
      },
    }),
    db.ticket.count({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    db.ticketType.count({ where: { active: true } }),
    db.user.count(),
    db.user.groupBy({
      by: ["role"],
      _count: { _all: true },
      orderBy: { role: "asc" },
    }),
    db.ticket.count({ where: { paymentStatus: "PENDIENTE" } }),
    db.ticket.count({ where: { usedAt: { not: null } } }),
    db.ticket.count({
      where: {
        paymentStatus: "PAGADO",
        usedAt: null,
        mealDate: { lt: todayStart },
      },
    }),
    db.ticket.count({
      where: {
        paymentStatus: "PAGADO",
        usedAt: null,
        mealDate: { gte: todayStart },
      },
    }),
    db.ticket.groupBy({
      by: ["mealDate"],
      where: { mealDate: { gte: last7Start, lt: tomorrowStart } },
      _count: { _all: true },
      orderBy: { mealDate: "asc" },
    }),
    db.ticket.findMany({
      where: { createdAt: { gte: last7Start, lt: tomorrowStart } },
      select: { createdAt: true },
    }),
    db.ticket.findMany({
      where: { createdAt: { gte: monthStart, lt: nextMonthStart } },
      select: { createdAt: true },
    }),
  ]);

  function groupBySaleDate(rows: { createdAt: Date }[], start: Date, length: number): { date: string; count: number }[] {
    const map = new Map<string, number>();
    for (const r of rows) {
      const key = r.createdAt.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from({ length }, (_, i) => {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      return { date: key, count: map.get(key) ?? 0 };
    });
  }

  const daysInMonth = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth() + 1, 0)).getUTCDate();

  const ticketsLast7DaysBySale = groupBySaleDate(salesLast7Rows, last7Start, 7);
  const ticketsThisMonthBySale = groupBySaleDate(
    salesMonthRows,
    monthStart,
    daysInMonth
  );

  const ticketsByDayMap = new Map<string, number>(
    ticketsByDayRaw.map((r) => [r.mealDate.toISOString().slice(0, 10), r._count._all])
  );
  const ticketsLast7DaysByMenu = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(last7Start);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: ticketsByDayMap.get(key) ?? 0 };
  });

  return {
    totalTickets,
    ticketsTodayMenu,
    salesToday,
    ticketTypesCount,
    totalUsers,
    usersByRole: usersByRoleRaw.map((r) => ({ role: r.role, count: r._count._all })),
    ticketsPendingPayment,
    ticketsRedeemed,
    ticketsExpired,
    ticketsAvailable,
    ticketsLast7DaysByMenu,
    ticketsLast7DaysBySale,
    ticketsThisMonthBySale,
  };
}

export async function getAdminTickets(page = 0, pageSize = 20) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const where: Prisma.TicketWhereInput = {};

  const [tickets, total] = await Promise.all([
    db.ticket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        seller: { select: { name: true, email: true } },
        ticketType: true,
      },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    db.ticket.count({ where }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      id: t.id,
      userName: t.user?.name ?? t.guestName ?? "Invitado",
      userEmail: t.user?.email ?? (t.guestInstitution ? `(${t.guestInstitution})` : "-"),
      sellerName: t.seller?.name ?? null,
      sellerEmail: t.seller?.email ?? null,
      ticketTypeName: t.ticketType.name,
      mealDate: t.mealDate,
      usedAt: t.usedAt,
      paymentStatus: t.paymentStatus,
      paymentReference: t.paymentReference,
      paymentBank: t.paymentBank,
      createdAt: t.createdAt,
    })),
    total,
  };
}

function parseLocalYmd(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getUsersForManualSale() {
  await ensureVendorOrAdmin();
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      cedula: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const label = (u: (typeof users)[number]) => {
    const parts = [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido].filter(Boolean);
    return parts.join(" ") || u.name || u.email;
  };

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    label: label(u),
    cedula: u.cedula ?? null,
  }));
}

export type ManualSaleBuyer =
  | { userId: string }
  | { guestName: string; guestInstitution: string };

export async function createManualSale(input: {
  buyers: ManualSaleBuyer[];
  ticketTypeId: string;
  mealDateYmd: string;
  markUsed?: boolean;
  paymentReference?: string;
  paymentBank?: string;
}) {
  const session = await ensureVendorOrAdmin();
  const current = session.user as unknown as { id: string };

  if (!input.buyers?.length) throw new Error("Agrega al menos un comprador (usuario o invitado).");
  if (input.buyers.length > 50) throw new Error("Máximo 50 compradores por operación.");
  if (!input.ticketTypeId) throw new Error("Selecciona un tipo de ticket");

  for (let i = 0; i < input.buyers.length; i++) {
    const b = input.buyers[i];
    if ("userId" in b) {
      if (!b.userId?.trim()) throw new Error(`Comprador ${i + 1}: selecciona un usuario o indica invitado.`);
    } else {
      if (!b.guestName?.trim()) throw new Error(`Comprador ${i + 1}: indica el nombre del invitado.`);
      if (!b.guestInstitution?.trim()) throw new Error(`Comprador ${i + 1}: indica la institución del invitado.`);
    }
  }

  const mealDate = parseLocalYmd(input.mealDateYmd);
  if (!mealDate) throw new Error("Fecha inválida");
  const todayStart = getTodayStartUTC();
  if (mealDate < todayStart) throw new Error("No se pueden registrar ventas para fechas vencidas (ticket cancelado).");

  const type = await db.ticketType.findFirst({
    where: { id: input.ticketTypeId, active: true },
    select: { id: true, maxQuantity: true },
  });
  if (!type) throw new Error("Tipo de ticket no disponible");

  const quantity = input.buyers.length;
  if (type.maxQuantity != null) {
    const sold = await db.ticket.count({
      where: {
        ticketTypeId: type.id,
        mealDate,
        paymentStatus: { not: "REEMBOLSADO" },
      },
    });
    if (sold + quantity > type.maxQuantity) {
      throw new Error(
        `No hay cupo. Este plato tiene un límite de ${type.maxQuantity} comidas para esa fecha; ya se vendieron ${sold}.`
      );
    }
  }

  const now = new Date();
  const usedAt = input.markUsed ? now : null;
  const paymentReference = input.paymentReference?.trim() || null;
  const paymentBank = input.paymentBank?.trim() || null;

  const ticketsData = input.buyers.map((b) =>
    "userId" in b
      ? {
          userId: b.userId,
          guestName: null as string | null,
          guestInstitution: null as string | null,
          ticketTypeId: type.id,
          mealDate,
          usedAt,
          paymentStatus: "PENDIENTE" as const,
          sellerId: current.id,
          paymentReference,
          paymentBank,
        }
      : {
          userId: null as string | null,
          guestName: b.guestName.trim(),
          guestInstitution: b.guestInstitution.trim(),
          ticketTypeId: type.id,
          mealDate,
          usedAt,
          paymentStatus: "PENDIENTE" as const,
          sellerId: current.id,
          paymentReference,
          paymentBank,
        }
  );

  await db.ticket.createMany({ data: ticketsData });

  revalidatePath("/vendedor");
  revalidatePath("/admin/tickets");
  revalidatePath("/escritorio/mis-tickets");
}

/** Solo ADMIN. Registra ventas sin restricción de fecha ni plato activo (para correcciones o ventas no registradas a tiempo). */
export async function createAdminManualSale(input: {
  buyers: ManualSaleBuyer[];
  ticketTypeId: string;
  mealDateYmd: string;
  paymentReference?: string;
  paymentBank?: string;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string; id: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  if (!input.buyers?.length) throw new Error("Agrega al menos un comprador (usuario o invitado).");
  if (input.buyers.length > 50) throw new Error("Máximo 50 compradores por operación.");
  if (!input.ticketTypeId) throw new Error("Selecciona un tipo de ticket");

  for (let i = 0; i < input.buyers.length; i++) {
    const b = input.buyers[i];
    if ("userId" in b) {
      if (!b.userId?.trim()) throw new Error(`Comprador ${i + 1}: selecciona un usuario o indica invitado.`);
    } else {
      if (!b.guestName?.trim()) throw new Error(`Comprador ${i + 1}: indica el nombre del invitado.`);
      if (!b.guestInstitution?.trim()) throw new Error(`Comprador ${i + 1}: indica la institución del invitado.`);
    }
  }

  const mealDate = parseLocalYmd(input.mealDateYmd);
  if (!mealDate) throw new Error("Fecha inválida");

  const type = await db.ticketType.findFirst({
    where: { id: input.ticketTypeId },
    select: { id: true },
  });
  if (!type) throw new Error("Tipo de ticket no encontrado");

  const paymentReference = input.paymentReference?.trim() || null;
  const paymentBank = input.paymentBank?.trim() || null;

  const ticketsData = input.buyers.map((b) =>
    "userId" in b
      ? {
          userId: b.userId,
          guestName: null as string | null,
          guestInstitution: null as string | null,
          ticketTypeId: type.id,
          mealDate,
          usedAt: null as Date | null,
          paymentStatus: "PENDIENTE" as const,
          sellerId: user.id,
          paymentReference,
          paymentBank,
        }
      : {
          userId: null as string | null,
          guestName: b.guestName.trim(),
          guestInstitution: b.guestInstitution.trim(),
          ticketTypeId: type.id,
          mealDate,
          usedAt: null as Date | null,
          paymentStatus: "PENDIENTE" as const,
          sellerId: user.id,
          paymentReference,
          paymentBank,
        }
  );

  await db.ticket.createMany({ data: ticketsData });

  revalidatePath("/vendedor");
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/ventas-pendientes");
  revalidatePath("/escritorio/mis-tickets");
}

export async function getAdminTicketsFiltered(
  page = 0,
  pageSize = 20,
  filters?: {
    tipo?: string | null;
    usuario?: string | null;
    fecha?: string | null;
    cedula?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const where: Prisma.TicketWhereInput = {};
  if (filters?.tipo) where.ticketTypeId = filters.tipo;
  if (filters?.usuario) where.userId = filters.usuario;
  if (filters?.fecha) {
    const day = parseLocalYmd(filters.fecha);
    if (day) {
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      where.mealDate = { gte: day, lt: next };
    }
  }
  if (filters?.cedula) {
    where.user = { cedula: { contains: filters.cedula.trim() } };
  }

  const [tickets, total] = await Promise.all([
    db.ticket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        seller: { select: { name: true, email: true } },
        ticketType: true,
      },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    db.ticket.count({ where }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      id: t.id,
      userName: t.user?.name ?? t.guestName ?? "Invitado",
      userEmail: t.user?.email ?? (t.guestInstitution ? `(${t.guestInstitution})` : "-"),
      sellerName: t.seller?.name ?? null,
      sellerEmail: t.seller?.email ?? null,
      ticketTypeName: t.ticketType.name,
      mealDate: t.mealDate,
      usedAt: t.usedAt,
      paymentStatus: t.paymentStatus,
      paymentReference: t.paymentReference,
      paymentBank: t.paymentBank,
      createdAt: t.createdAt,
    })),
    total,
  };
}

export async function getVendorTicketsFiltered(
  page = 0,
  pageSize = 20,
  filters?: {
    fecha?: string | null;
    cedula?: string | null;
  }
) {
  const session = await ensureVendorOrAdmin();
  const current = session.user as unknown as { id: string };

  const where: Prisma.TicketWhereInput = {
    OR: [{ sellerId: current.id }, { sellerId: null }],
  };

  if (filters?.fecha) {
    const day = parseLocalYmd(filters.fecha);
    if (day) {
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      where.mealDate = { gte: day, lt: next };
    }
  }

  if (filters?.cedula) {
    where.user = { cedula: { contains: filters.cedula.trim() } };
  }

  const [tickets, total] = await Promise.all([
    db.ticket.findMany({
      where,
      include: { user: { select: { name: true, email: true, cedula: true } }, ticketType: true },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    db.ticket.count({ where }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      id: t.id,
      userName: t.user?.name ?? t.guestName ?? "Invitado",
      userEmail: t.user?.email ?? (t.guestInstitution ? `(${t.guestInstitution})` : "-"),
      userCedula: t.user?.cedula ?? null,
      ticketTypeName: t.ticketType.name,
      mealDate: t.mealDate,
      usedAt: t.usedAt,
      paymentStatus: t.paymentStatus,
      paymentReference: t.paymentReference,
      paymentBank: t.paymentBank,
      isWebPurchase: t.sellerId === null,
    })),
    total,
  };
}

export async function getEditorTicketsFiltered(
  page = 0,
  pageSize = 20,
  filters?: { cedula?: string | null; fecha?: string | null }
) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/escritorio");

  const where: Prisma.TicketWhereInput = {};
  if (filters?.fecha) {
    const day = parseLocalYmd(filters.fecha);
    if (day) {
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      where.mealDate = { gte: day, lt: next };
    }
  }
  if (filters?.cedula?.trim()) {
    where.user = { cedula: { contains: filters.cedula.trim() } };
  }

  const [tickets, total] = await Promise.all([
    db.ticket.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, ticketType: true },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    db.ticket.count({ where }),
  ]);

  return {
    tickets: tickets.map((t) => ({
      id: t.id,
      userName: t.user?.name ?? t.guestName ?? "Invitado",
      userEmail: t.user?.email ?? (t.guestInstitution ? `(${t.guestInstitution})` : "-"),
      ticketTypeName: t.ticketType.name,
      mealDate: t.mealDate,
      usedAt: t.usedAt,
      paymentStatus: t.paymentStatus,
      paymentReference: t.paymentReference,
      paymentBank: t.paymentBank,
      createdAt: t.createdAt,
    })),
    total,
  };
}

export async function getAdminUsersForTicketsFilter() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      primerNombre: true,
      primerApellido: true,
      segundoNombre: true,
      segundoApellido: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  function label(u: (typeof users)[number]) {
    const parts = [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido].filter(Boolean);
    return parts.join(" ") || u.name || u.email;
  }

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    label: label(u),
  }));
}

export async function getAdminTicketTypes(): Promise<Prisma.TicketTypeGetPayload<object>[]> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/escritorio");

  await deactivateExpiredTicketTypes();
  return db.ticketType.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTicketType(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/escritorio");

  const name = formData.get("name") as string;
  const category = (formData.get("category") as "DESAYUNO" | "ALMUERZO" | "CENA") || "ALMUERZO";
  const lugar = (formData.get("lugar") as "CANTINA" | "COMEDOR") || "COMEDOR";
  const price = formData.get("price") as string;
  const description = (formData.get("description") as string) || null;
  const image = (formData.get("image") as string) || null;
  const availableForDateStr = formData.get("availableForDate") as string;
  const maxQuantityStr = (formData.get("maxQuantity") as string)?.trim();

  if (!name || !price) throw new Error("Nombre y precio son requeridos");

  let availableForDate: Date | null = null;
  if (availableForDateStr) {
    const d = new Date(availableForDateStr);
    d.setHours(0, 0, 0, 0);
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(availableForDateStr);
    if (m) {
      availableForDate = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      availableForDate.setHours(0, 0, 0, 0);
    }
  }

  const maxQuantity = maxQuantityStr && /^\d+$/.test(maxQuantityStr) ? Math.max(1, parseInt(maxQuantityStr, 10)) : null;

  await db.ticketType.create({
    data: {
      name: name.trim(),
      category,
      lugar,
      price: parseFloat(price),
      description: description?.trim() || null,
      image,
      availableForDate,
      maxQuantity,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/almuerzos");
}

export async function updateTicketType(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/escritorio");

  const existing = await db.ticketType.findUnique({ where: { id } });
  if (!existing) throw new Error("Plato no encontrado");

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as "DESAYUNO" | "ALMUERZO" | "CENA") || existing.category;
  const lugar = (formData.get("lugar") as "CANTINA" | "COMEDOR") ?? existing.lugar;
  const priceStr = formData.get("price") as string;
  const description = (formData.get("description") as string)?.trim() || null;
  const image = (formData.get("image") as string) || null;
  const availableForDateStr = formData.get("availableForDate") as string;
  const active = formData.get("active") === "true";
  const maxQuantityStr = (formData.get("maxQuantity") as string)?.trim();

  if (!name) throw new Error("El nombre es requerido");

  let availableForDate: Date | null = null;
  if (availableForDateStr) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(availableForDateStr);
    if (m) {
      availableForDate = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      availableForDate.setHours(0, 0, 0, 0);
    }
  }

  const price = priceStr ? parseFloat(priceStr) : Number(existing.price);
  const maxQuantity = maxQuantityStr && /^\d+$/.test(maxQuantityStr) ? Math.max(1, parseInt(maxQuantityStr, 10)) : null;

  await db.ticketType.update({
    where: { id },
    data: {
      name,
      category,
      lugar,
      price,
      description,
      image,
      availableForDate,
      maxQuantity,
      active,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/almuerzos");
}

export async function toggleTicketTypeActive(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/escritorio");

  const type = await db.ticketType.findUnique({ where: { id } });
  if (!type) throw new Error("Tipo no encontrado");

  await db.ticketType.update({
    where: { id },
    data: { active: !type.active },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/almuerzos");
}

/** Para el lector QR: devuelve datos del ticket (solo ADMIN/EDITOR). */
export async function getTicketByIdForScan(ticketId: string) {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "EDITOR") return null;

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      mealDate: true,
      usedAt: true,
      paymentStatus: true,
      guestName: true,
      guestInstitution: true,
      user: { select: { name: true, email: true } },
      ticketType: { select: { name: true } },
    },
  });
  if (!ticket) return null;
  return {
    id: ticket.id,
    userName: ticket.user?.name ?? ticket.guestName ?? "Invitado",
    userEmail: ticket.user?.email ?? (ticket.guestInstitution ? `(${ticket.guestInstitution})` : "-"),
    ticketTypeName: ticket.ticketType.name,
    mealDate: ticket.mealDate,
    usedAt: ticket.usedAt,
    paymentStatus: ticket.paymentStatus,
  };
}

export async function getTicketForAdminEdit(ticketId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const current = session.user as unknown as { role?: string };
  if (current.role !== "ADMIN") redirect("/escritorio");

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      ticketType: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!ticket) return null;

  return {
    id: ticket.id,
    userName: ticket.user?.name ?? ticket.guestName ?? "Invitado",
    userEmail: ticket.user?.email ?? (ticket.guestInstitution ? `(${ticket.guestInstitution})` : "-"),
    ticketTypeId: ticket.ticketTypeId,
    ticketTypeName: ticket.ticketType.name,
    mealDateYmd: ticket.mealDate.toISOString().slice(0, 10),
    paymentStatus: ticket.paymentStatus as TicketPaymentStatus,
    paymentReference: ticket.paymentReference ?? "",
    paymentBank: ticket.paymentBank ?? "",
  };
}

export async function updateTicketAdmin(input: {
  id: string;
  ticketTypeId: string;
  mealDateYmd: string;
  paymentStatus: TicketPaymentStatus;
  paymentReference?: string;
  paymentBank?: string;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const current = session.user as unknown as { role?: string };
  if (current.role !== "ADMIN") redirect("/escritorio");

  const mealDate = parseLocalYmd(input.mealDateYmd);
  if (!mealDate) throw new Error("Fecha inválida");

  await db.ticket.update({
    where: { id: input.id },
    data: {
      ticketTypeId: input.ticketTypeId,
      mealDate,
      paymentStatus: input.paymentStatus,
      paymentReference: input.paymentReference?.trim() || null,
      paymentBank: input.paymentBank?.trim() || null,
    },
  });

  revalidatePath("/admin/tickets");
  revalidatePath("/escritorio/mis-tickets");
}

export async function markTicketUsed(ticketId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/escritorio");

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, usedAt: true, mealDate: true, paymentStatus: true },
  });
  if (!ticket) throw new Error("Ticket no encontrado");
  if (ticket.paymentStatus !== "PAGADO") throw new Error("Ticket pendiente de pago");
  if (ticket.usedAt) return;

  const todayStart = getTodayStartUTC();
  if (ticket.mealDate < todayStart) {
    throw new Error("Ticket cancelado: la fecha del menú ya venció.");
  }

  await db.ticket.update({
    where: { id: ticketId },
    data: { usedAt: new Date() },
  });
  revalidatePath("/admin/tickets");
  revalidatePath("/editor");
}

export async function approveTicket(ticketId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/escritorio");

  await db.ticket.update({
    where: { id: ticketId },
    data: { paymentStatus: "PAGADO" },
  });
  revalidatePath("/admin/tickets");
  revalidatePath("/editor");
}

export async function deleteTicketAdmin(ticketId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  await db.ticket.delete({
    where: { id: ticketId },
  });

  revalidatePath("/admin/tickets");
  revalidatePath("/escritorio/mis-tickets");
}

export async function processExpiredTickets() {
  const session = await auth();
  if (!session?.user) return; // Should probably be a cron or triggered by admin/system, but works on access for now

  // Only run for the current user to avoid massive global queries on every request, 
  // OR run globally if this is an admin action. 
  // For the user dashboard, let's just process THEIR expired tickets to keep it snappy/safe.

  const todayStart = getTodayStartUTC();

  const expiredTickets = await db.ticket.findMany({
    where: {
      userId: session.user.id,
      usedAt: null,
      mealDate: { lt: todayStart },
      paymentStatus: "PAGADO", // Only refund paid tickets
    },
    include: { ticketType: true }
  });

  if (expiredTickets.length === 0) return;

  for (const ticket of expiredTickets) {
    await db.$transaction(async (tx) => {
      // Double check inside transaction
      const t = await tx.ticket.findUnique({ where: { id: ticket.id } });
      if (!t || t.paymentStatus !== "PAGADO") return;

      // Refund
      await tx.ticket.update({
        where: { id: ticket.id },
        data: { paymentStatus: "REEMBOLSADO" }
      });

      // Solo reembolsar balance y crear transacción si el ticket es de un usuario registrado (no invitado)
      if (ticket.userId) {
        await tx.user.update({
          where: { id: ticket.userId },
          data: { balance: { increment: ticket.ticketType.price } }
        });

        await tx.walletTransaction.create({
          data: {
            userId: ticket.userId,
            amount: ticket.ticketType.price,
            type: "REEMBOLSO",
            reference: `Reembolso por vencimiento: ${ticket.ticketType.name} (${ticket.mealDate.toISOString().slice(0, 10)})`
          }
        });
      }
    });
  }

  if (expiredTickets.length > 0) {
    revalidatePath("/escritorio");
  }
}
