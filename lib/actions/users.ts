"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { UserRole, Gremio } from "@/lib/generated/prisma/enums";
import bcrypt from "bcryptjs";

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

export async function createAdminUser(data: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  gremio?: Gremio | null;
  cedula?: string | null;
  expediente?: string | null;
  primerNombre?: string | null;
  segundoNombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
}) {
  await ensureAdmin();

  const email = data.email.trim().toLowerCase();
  if (!email) throw new Error("Email requerido");
  if (!data.password || data.password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
  if (!data.name.trim()) throw new Error("Nombre requerido");

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) throw new Error("Ya existe un usuario con ese email");

  const passwordHash = await bcrypt.hash(data.password, 10);

  // Crear usuario y vincular cuenta "credential" (formato esperado por Better Auth)
  const user = await db.user.create({
    data: {
      email,
      name: data.name.trim(),
      emailVerified: true,
      role: data.role,
      gremio: data.gremio ?? null,
      cedula: data.cedula ?? null,
      expediente: data.expediente ?? null,
      primerNombre: data.primerNombre ?? null,
      segundoNombre: data.segundoNombre ?? null,
      primerApellido: data.primerApellido ?? null,
      segundoApellido: data.segundoApellido ?? null,
    },
    select: { id: true, email: true },
  });

  try {
    await db.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: passwordHash,
      },
    });
  } catch (e) {
    // Si falla la cuenta, no dejamos un user "huérfano" sin credenciales
    await db.user.delete({ where: { id: user.id } });
    throw e;
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  return { id: user.id, email: user.email };
}
