"use server";

import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getTicketTypes() {
  const types = await db.ticketType.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return types.map((t) => ({
    id: t.id,
    name: t.name,
    price: Number(t.price),
    description: t.description,
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return tickets.map((t) => ({
    id: t.id,
    ticketTypeName: t.ticketType.name,
    mealDate: t.mealDate,
    usedAt: t.usedAt,
    createdAt: t.createdAt,
    status: t.usedAt ? ("CANJEADO" as const) : t.mealDate < todayStart ? ("CANCELADO" as const) : ("PENDIENTE" as const),
  }));
}

export async function buyTicket(ticketTypeId: string, mealDate: Date) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const type = await db.ticketType.findFirst({
    where: { id: ticketTypeId, active: true },
  });
  if (!type) throw new Error("Tipo de ticket no disponible");

  await db.ticket.create({
    data: {
      userId: session.user.id,
      ticketTypeId: type.id,
      mealDate: new Date(mealDate),
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

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

  const last7Start = new Date(todayStart);
  last7Start.setDate(todayStart.getDate() - 6);

  const [
    totalTickets,
    ticketsToday,
    ticketTypesCount,
    totalUsers,
    usersByRoleRaw,
    ticketsPending,
    ticketsUsed,
    ticketsByDayRaw,
  ] = await Promise.all([
    db.ticket.count(),
    db.ticket.count({
      where: {
        mealDate: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    }),
    db.ticketType.count({ where: { active: true } }),
    db.user.count(),
    db.user.groupBy({
      by: ["role"],
      _count: { _all: true },
      orderBy: { role: "asc" },
    }),
    db.ticket.count({ where: { usedAt: null } }),
    db.ticket.count({ where: { usedAt: { not: null } } }),
    db.ticket.groupBy({
      by: ["mealDate"],
      where: { mealDate: { gte: last7Start, lt: todayEnd } },
      _count: { _all: true },
      orderBy: { mealDate: "asc" },
    }),
  ]);

  // Normalizar días (últimos 7) para que el gráfico no tenga huecos
  const ticketsByDayMap = new Map<string, number>(
    ticketsByDayRaw.map((r) => [r.mealDate.toISOString().slice(0, 10), r._count._all])
  );
  const ticketsLast7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(last7Start);
    d.setDate(last7Start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: ticketsByDayMap.get(key) ?? 0 };
  });

  return {
    totalTickets,
    ticketsToday,
    ticketTypesCount,
    totalUsers,
    usersByRole: usersByRoleRaw.map((r) => ({ role: r.role, count: r._count._all })),
    ticketsPending,
    ticketsUsed,
    ticketsLast7Days,
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
      userName: t.user.name,
      userEmail: t.user.email,
      ticketTypeName: t.ticketType.name,
      mealDate: t.mealDate,
      usedAt: t.usedAt,
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
      expediente: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 500,
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
    expediente: u.expediente ?? null,
  }));
}

export async function createManualSale(input: {
  userId: string;
  ticketTypeId: string;
  mealDateYmd: string;
  quantity: number;
  markUsed?: boolean;
}) {
  await ensureVendorOrAdmin();

  const quantity = Number.isFinite(input.quantity) ? Math.floor(input.quantity) : 1;
  if (quantity < 1 || quantity > 50) throw new Error("La cantidad debe estar entre 1 y 50");
  if (!input.userId) throw new Error("Selecciona un usuario");
  if (!input.ticketTypeId) throw new Error("Selecciona un tipo de ticket");

  const mealDate = parseLocalYmd(input.mealDateYmd);
  if (!mealDate) throw new Error("Fecha inválida");
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (mealDate < todayStart) throw new Error("No se pueden registrar ventas para fechas vencidas (ticket cancelado).");

  const type = await db.ticketType.findFirst({
    where: { id: input.ticketTypeId, active: true },
    select: { id: true },
  });
  if (!type) throw new Error("Tipo de ticket no disponible");

  const now = new Date();
  const usedAt = input.markUsed ? now : null;

  await db.ticket.createMany({
    data: Array.from({ length: quantity }).map(() => ({
      userId: input.userId,
      ticketTypeId: type.id,
      mealDate,
      usedAt,
    })),
  });

  revalidatePath("/vendedor");
  revalidatePath("/admin/tickets");
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
    expediente?: string | null;
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
  if (filters && (filters.cedula || filters.expediente)) {
    const userWhere: Prisma.UserWhereInput = {};
    if (filters.cedula) {
      userWhere.cedula = { contains: filters.cedula.trim() };
    }
    if (filters.expediente) {
      userWhere.expediente = { contains: filters.expediente.trim() };
    }
    where.user = userWhere;
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
      userName: t.user.name,
      userEmail: t.user.email,
      ticketTypeName: t.ticketType.name,
      mealDate: t.mealDate,
      usedAt: t.usedAt,
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

export async function getAdminTicketTypes() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  return db.ticketType.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createTicketType(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const description = (formData.get("description") as string) || null;
  if (!name || !price) throw new Error("Nombre y precio son requeridos");

  await db.ticketType.create({
    data: {
      name: name.trim(),
      price: parseFloat(price),
      description: description?.trim() || null,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/tipos");
}

export async function toggleTicketTypeActive(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const type = await db.ticketType.findUnique({ where: { id } });
  if (!type) throw new Error("Tipo no encontrado");

  await db.ticketType.update({
    where: { id },
    data: { active: !type.active },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/tipos");
}

export async function markTicketUsed(ticketId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "VENDEDOR") redirect("/escritorio");

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, usedAt: true, mealDate: true },
  });
  if (!ticket) throw new Error("Ticket no encontrado");
  if (ticket.usedAt) return;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (ticket.mealDate < todayStart) {
    throw new Error("Ticket cancelado: la fecha del menú ya venció.");
  }

  await db.ticket.update({
    where: { id: ticketId },
    data: { usedAt: new Date() },
  });
  revalidatePath("/admin/tickets");
}
