"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export type ExtraChargeStatus = "PENDIENTE" | "FACTURADO" | "PAGADO" | "CANCELADO";

export type ExtraChargeRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  category: string;
  label: string;
  description: string | null;
  amount: number;
  status: ExtraChargeStatus;
  createdAt: Date;
};

function requireAdmin() {
  return auth().then((session) => {
    const role = (session?.user as unknown as { role?: string })?.role;
    if (!session?.user || role !== "ADMIN") redirect("/login");
    return session;
  });
}

/** Crea un cargo extra para un usuario concreto. Solo ADMIN. */
export async function createExtraCharge(params: {
  userId: string;
  category: string;
  label: string;
  description?: string;
  amount: number;
}) {
  await requireAdmin();

  const amount = Number(params.amount);
  if (!params.userId?.trim()) throw new Error("Usuario requerido.");
  if (!params.label?.trim()) throw new Error("Título del cargo requerido.");
  if (!params.category?.trim()) throw new Error("Categoría requerida.");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Monto inválido.");

  // Usamos SQL directo para evitar depender del cliente generado si aún no está recargado.
  await db.$executeRawUnsafe(
    "INSERT INTO `ExtraCharge` (`id`, `userId`, `category`, `label`, `description`, `amount`, `status`, `createdAt`, `updatedAt`) VALUES (UUID(), ?, ?, ?, ?, ?, 'PENDIENTE', NOW(3), NOW(3))",
    params.userId,
    params.category,
    params.label.trim().slice(0, 191),
    params.description?.trim() || null,
    amount,
  );
}

/** Lista de cargos extra para admin (opcionalmente filtrados por estado). */
export async function getAdminExtraCharges(status?: ExtraChargeStatus): Promise<ExtraChargeRow[]> {
  await requireAdmin();
  const whereStatus = status ? "WHERE ec.status = ?" : "";
  const rows = (await db.$queryRawUnsafe(
    `
      SELECT
        ec.id,
        ec.userId,
        ec.category,
        ec.label,
        ec.description,
        ec.amount,
        ec.status,
        ec.createdAt,
        u.name as userName,
        u.email as userEmail
      FROM \`ExtraCharge\` ec
      JOIN \`User\` u ON u.id = ec.userId
      ${whereStatus}
      ORDER BY ec.createdAt DESC
    `,
    ...(status ? [status] : []),
  )) as Array<{
    id: string;
    userId: string;
    category: string;
    label: string;
    description: string | null;
    amount: any;
    status: ExtraChargeStatus;
    createdAt: Date;
    userName: string | null;
    userEmail: string | null;
  }>;

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName ?? null,
    userEmail: r.userEmail ?? null,
    category: r.category,
    label: r.label,
    description: r.description ?? null,
    amount: Number(r.amount),
    status: r.status,
    createdAt: r.createdAt,
  }));
}

/** Actualiza el estado de un cargo extra. Solo ADMIN. */
export async function updateExtraChargeStatus(id: string, status: ExtraChargeStatus) {
  await requireAdmin();
  if (!id?.trim()) throw new Error("ID requerido.");
  await db.$executeRawUnsafe(
    "UPDATE `ExtraCharge` SET `status` = ?, `updatedAt` = NOW(3) WHERE `id` = ?",
    status,
    id,
  );
}

/** Cargos extra del usuario actual (para escritorio/pagos). */
export async function getCurrentUserExtraCharges(): Promise<ExtraChargeRow[]> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const rows = (await db.$queryRawUnsafe(
    `
      SELECT
        ec.id,
        ec.userId,
        ec.category,
        ec.label,
        ec.description,
        ec.amount,
        ec.status,
        ec.createdAt
      FROM \`ExtraCharge\` ec
      WHERE ec.userId = ?
      ORDER BY ec.createdAt DESC
    `,
    userId,
  )) as Array<{
    id: string;
    userId: string;
    category: string;
    label: string;
    description: string | null;
    amount: any;
    status: ExtraChargeStatus;
    createdAt: Date;
  }>;

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: null,
    userEmail: null,
    category: r.category,
    label: r.label,
    description: r.description ?? null,
    amount: Number(r.amount),
    status: r.status,
    createdAt: r.createdAt,
  }));
}

