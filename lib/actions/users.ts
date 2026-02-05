"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { UserRole, Gremio } from "@/lib/generated/prisma/enums";

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");
}

export async function getAdminUsers() {
  await ensureAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      gremio: true,
      cedula: true,
      expediente: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      createdAt: true,
    },
  });
  return users;
}

export async function updateUser(
  userId: string,
  data: {
    role?: UserRole;
    gremio?: Gremio | null;
    cedula?: string | null;
    expediente?: string | null;
    primerNombre?: string | null;
    segundoNombre?: string | null;
    primerApellido?: string | null;
    segundoApellido?: string | null;
    name?: string;
  }
) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const currentUser = session.user as unknown as { role?: string };
  if (currentUser.role !== "ADMIN") redirect("/escritorio");

  await db.user.update({
    where: { id: userId },
    data: {
      ...(data.role != null && { role: data.role }),
      ...(data.gremio !== undefined && { gremio: data.gremio }),
      ...(data.cedula !== undefined && { cedula: data.cedula || null }),
      ...(data.expediente !== undefined && { expediente: data.expediente || null }),
      ...(data.primerNombre !== undefined && { primerNombre: data.primerNombre || null }),
      ...(data.segundoNombre !== undefined && { segundoNombre: data.segundoNombre || null }),
      ...(data.primerApellido !== undefined && { primerApellido: data.primerApellido || null }),
      ...(data.segundoApellido !== undefined && { segundoApellido: data.segundoApellido || null }),
      ...(data.name != null && { name: data.name }),
    },
  });
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}
