"use server";

import { db } from "@/lib/db";
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

export async function getMyTickets() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tickets = await db.ticket.findMany({
    where: { userId: session.user.id },
    include: { ticketType: true },
    orderBy: { mealDate: "desc" },
    take: 50,
  });
  return tickets.map((t) => ({
    id: t.id,
    ticketTypeName: t.ticketType.name,
    mealDate: t.mealDate,
    usedAt: t.usedAt,
    createdAt: t.createdAt,
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

  const [totalTickets, ticketsToday, ticketTypesCount] = await Promise.all([
    db.ticket.count(),
    db.ticket.count({
      where: {
        mealDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    db.ticketType.count({ where: { active: true } }),
  ]);

  return { totalTickets, ticketsToday, ticketTypesCount };
}

export async function getAdminTickets(page = 0, pageSize = 20) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const [tickets, total] = await Promise.all([
    db.ticket.findMany({
      include: { user: { select: { name: true, email: true } }, ticketType: true },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    db.ticket.count(),
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
  if (user.role !== "ADMIN") redirect("/escritorio");

  await db.ticket.update({
    where: { id: ticketId },
    data: { usedAt: new Date() },
  });
  revalidatePath("/admin/tickets");
}
