"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ESCRITORIO_TICKETS = "/escritorio/tickets";
const ADMIN_SOPORTE = "/admin/soporte";

type SessionUser = { id: string; role?: string };

async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return { session, user: session.user as unknown as SessionUser };
}

async function requireAdminOrEditor() {
  const { user } = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "EDITOR") redirect("/escritorio");
  return { user };
}

async function requireAdmin() {
  const { user } = await requireAuth();
  if (user.role !== "ADMIN") redirect("/escritorio");
  return { user };
}

/** Lista los tickets de soporte del usuario actual (cliente). */
export async function getMySupportTickets() {
  const { user } = await requireAuth();
  const tickets = await db.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
    },
  });
  return tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    messageCount: t._count.messages,
  }));
}

/** Lista los tickets de un cliente (solo EDITOR o ADMIN, para escritorio "trabajar como"). */
export async function getSupportTicketsForClient(clientUserId: string) {
  await requireAdminOrEditor();
  const tickets = await db.supportTicket.findMany({
    where: { userId: clientUserId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
    },
  });
  return tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    messageCount: t._count.messages,
  }));
}

/** Obtiene un ticket con sus mensajes. El cliente solo puede ver los suyos. */
export async function getSupportTicketWithMessages(id: string) {
  const { user } = await requireAuth();
  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
  if (!ticket) return null;
  // Cliente solo ve sus propios tickets; admin/editor ve todos (se comprueba en la página admin)
  if (ticket.userId !== user.id && user.role !== "ADMIN" && user.role !== "EDITOR") return null;
  const authorLabel = (role: string | null) => {
    if (role === "ADMIN") return "Administrador";
    if (role === "EDITOR") return "Editor";
    return "Cliente";
  };

  return {
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    allowClientReply: ticket.allowClientReply,
    userId: ticket.userId,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    userName: ticket.user.name,
    userEmail: ticket.user.email,
    messages: ticket.messages.map((m) => {
      const role = m.authorRole ?? (m.userId === ticket.userId ? "CLIENTE" : null);
      return {
        id: m.id,
        body: m.body,
        userId: m.userId,
        userName: m.user.name,
        createdAt: m.createdAt,
        authorRole: role,
        authorLabel: role ? authorLabel(role) : "Soporte",
      };
    }),
  };
}

/** Crea un ticket de soporte con el primer mensaje. */
export async function createSupportTicket(formData: FormData) {
  const { user } = await requireAuth();
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  const sub = (subject ?? "").trim();
  const b = (body ?? "").trim();
  if (!sub || !b) return { error: "Asunto y mensaje son obligatorios." };

  const ticket = await db.supportTicket.create({
    data: {
      userId: user.id,
      subject: sub,
      status: "ABIERTO",
      messages: {
        create: { userId: user.id, body: b, authorRole: "CLIENTE" },
      },
    },
  });
  revalidatePath(ESCRITORIO_TICKETS);
  revalidatePath(ADMIN_SOPORTE);
  return { ok: true, ticketId: ticket.id };
}

/** Crea ticket y redirige al detalle. Para usar como form action. */
export async function createSupportTicketAndRedirect(formData: FormData) {
  const result = await createSupportTicket(formData);
  if (result.error) redirect(`/escritorio/tickets/nuevo?error=${encodeURIComponent(result.error)}`);
  redirect(`/escritorio/tickets/${result.ticketId}`);
}

/** Añade un mensaje al ticket. Cliente o staff. */
export async function addSupportTicketMessage(ticketId: string, formData: FormData) {
  const { user } = await requireAuth();
  const body = (formData.get("body") as string)?.trim();
  if (!body) return { error: "El mensaje no puede estar vacío." };

  const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { error: "Ticket no encontrado." };

  const isStaff = user.role === "ADMIN" || user.role === "EDITOR";
  const isOwner = ticket.userId === user.id;
  if (!isStaff && !isOwner) return { error: "No puedes escribir en este ticket." };
  // El cliente solo puede responder si el admin lo permite y el ticket no está cerrado
  if (!isStaff) {
    if (ticket.status === "CERRADO") return { error: "No puedes responder en un ticket cerrado." };
    if (!ticket.allowClientReply) return { error: "El equipo no permite nuevas respuestas por ahora. Te notificaremos cuando puedas responder." };
  }

  const authorRole = user.role === "ADMIN" ? "ADMIN" : user.role === "EDITOR" ? "EDITOR" : "CLIENTE";
  await db.supportTicketMessage.create({
    data: { supportTicketId: ticketId, userId: user.id, body, authorRole },
  });
  await db.supportTicket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });
  revalidatePath(ESCRITORIO_TICKETS);
  revalidatePath(`${ESCRITORIO_TICKETS}/${ticketId}`);
  revalidatePath(ADMIN_SOPORTE);
  revalidatePath(`${ADMIN_SOPORTE}/${ticketId}`);
  return { ok: true };
}

const VALID_STATUSES = ["ABIERTO", "EN_PROCESO", "ESPERANDO_CLIENTE", "RESUELTO", "CERRADO"] as const;

/** Cambia el estado del ticket. Solo admin/editor. Al cerrar se quita el permiso de respuesta al cliente. */
export async function updateSupportTicketStatus(ticketId: string, status: string) {
  await requireAdminOrEditor();
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) return { error: "Estado no válido." };

  const data: { status: (typeof VALID_STATUSES)[number]; allowClientReply?: boolean } = {
    status: status as (typeof VALID_STATUSES)[number],
  };
  if (status === "CERRADO") data.allowClientReply = false;

  await db.supportTicket.update({
    where: { id: ticketId },
    data,
  });
  revalidatePath(ESCRITORIO_TICKETS);
  revalidatePath(ADMIN_SOPORTE);
  revalidatePath(`${ADMIN_SOPORTE}/${ticketId}`);
  return { ok: true };
}

/** Permite o no que el cliente responda en el ticket. Solo admin/editor. */
export async function updateSupportTicketAllowClientReply(ticketId: string, allow: boolean) {
  await requireAdminOrEditor();
  await db.supportTicket.update({
    where: { id: ticketId },
    data: { allowClientReply: allow },
  });
  revalidatePath(ESCRITORIO_TICKETS);
  revalidatePath(`${ESCRITORIO_TICKETS}/${ticketId}`);
  revalidatePath(ADMIN_SOPORTE);
  revalidatePath(`${ADMIN_SOPORTE}/${ticketId}`);
  return { ok: true };
}

/** Filtros para la lista de tickets (admin/editor). */
export type SupportTicketsFilters = {
  status?: string | null;
  search?: string | null;
};

/** Lista todos los tickets de soporte para admin/editor, con filtros opcionales. */
export async function getSupportTicketsForAdmin(filters?: SupportTicketsFilters) {
  await requireAdminOrEditor();
  const conditions: any[] = [];
  if (filters?.status?.trim()) {
    const valid = VALID_STATUSES.includes(filters.status.trim() as (typeof VALID_STATUSES)[number]);
    if (valid) conditions.push({ status: filters.status.trim() as (typeof VALID_STATUSES)[number] });
  }
  if (filters?.search?.trim()) {
    const term = filters.search.trim();
    conditions.push({
      OR: [
        { subject: { contains: term } },
        { user: { name: { contains: term } } },
        { user: { email: { contains: term } } },
      ],
    });
  }
  const where = conditions.length > 0 ? { AND: conditions } : {};
  const tickets = await db.supportTicket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { messages: true } },
    },
  });
  return tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    messageCount: t._count.messages,
    userName: t.user.name,
    userEmail: t.user.email,
  }));
}

/** Elimina un ticket de soporte. Solo ADMIN. */
export async function deleteSupportTicket(ticketId: string) {
  await requireAdmin();
  await db.supportTicket.delete({ where: { id: ticketId } });
  revalidatePath(ESCRITORIO_TICKETS);
  revalidatePath(ADMIN_SOPORTE);
  redirect(ADMIN_SOPORTE);
}
