"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/lib/generated/prisma/enums";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { sanitizeOnboardingInput } from "@/lib/sanitize";
import { PROJECT_CATEGORY_VALUES, type ProjectCategory } from "@/lib/project-categories";
import { getTotalFromPackageIdsFromDb } from "@/lib/actions/service-packages-db";
import { getUsdToVesRate } from "@/lib/bcv";
import { addMonths } from "@/lib/utils";

const stripeSecretKey = process.env.STRIPE_API_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");
}

export async function getAdminUsers(search?: string | null) {
  await ensureAdmin();
  const term = search?.trim();
  const where = term
    ? {
        OR: [
          { name: { contains: term } },
          { email: { contains: term } },
          { cedula: { contains: term } },
          { primerNombre: { contains: term } },
          { segundoNombre: { contains: term } },
          { primerApellido: { contains: term } },
          { segundoApellido: { contains: term } },
        ],
      }
    : undefined;

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      cedula: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      createdAt: true,
      onboardingCompletedAt: true,
      balance: true,
    },
  });
  return users;
}

/** Lista de usuarios (clientes) para asignar a proyectos del portafolio. Solo id, name, email. */
export async function getClientsForAssignment() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/escritorio");

  const users = await db.user.findMany({
    where: { role: "CLIENTE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
  return users;
}

export async function updateUser(
  userId: string,
  data: {
    role?: UserRole;
    cedula?: string | null;
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
      ...(data.cedula !== undefined && { cedula: data.cedula || null }),
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
  cedula?: string | null;
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

  // Crear usuario con correo y contraseña temporales: obligar a cambiarlos en el primer acceso
  const user = await db.user.create({
    data: {
      email,
      name: data.name.trim(),
      emailVerified: true,
      role: data.role,
      cedula: data.cedula ?? null,
      primerNombre: data.primerNombre ?? null,
      segundoNombre: data.segundoNombre ?? null,
      primerApellido: data.primerApellido ?? null,
      segundoApellido: data.segundoApellido ?? null,
      requiresEmailChange: true,
      requiresPasswordChange: true,
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

/** Permite al admin establecer una nueva contraseña para cualquier usuario (p. ej. si olvidó la suya). */
export async function setUserPasswordAsAdmin(userId: string, newPassword: string) {
  await ensureAdmin();

  const trimmed = newPassword?.trim() ?? "";
  if (trimmed.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) throw new Error("Usuario no encontrado");

  const passwordHash = await bcrypt.hash(trimmed, 10);

  const account = await db.account.findFirst({
    where: { userId, providerId: "credential" },
  });

  if (account) {
    await db.account.update({
      where: { id: account.id },
      data: { password: passwordHash },
    });
  } else {
    await db.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: passwordHash,
      },
    });
  }

  // La contraseña que pone el admin es temporal: el usuario debe cambiarla
  await db.user.update({
    where: { id: userId },
    data: { requiresPasswordChange: true },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
}

/** Marca que el usuario actual ya actualizó su correo (deja de obligar). */
export async function clearRequiresEmailChange() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await db.user.update({
    where: { id: session.user.id },
    data: { requiresEmailChange: false },
  });
  revalidatePath("/actualizar-credenciales");
  revalidatePath("/escritorio/cuenta");
}

/** Marca que el usuario actual ya actualizó su contraseña (deja de obligar). */
export async function clearRequiresPasswordChange() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await db.user.update({
    where: { id: session.user.id },
    data: { requiresPasswordChange: false },
  });
  revalidatePath("/actualizar-credenciales");
  revalidatePath("/escritorio/cuenta");
}

/** Completa el onboarding del usuario actual: guarda datos sanitizados, crea los proyectos del servicio y marca como completado. Solo para no-ADMIN. */
export async function completeOnboarding(data: {
  primerNombre?: string | null;
  segundoNombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  cedula?: string | null;
  telefono?: string | null;
  /** Proyectos que el usuario adquiere con el servicio; según esto se facturará. Al menos uno. */
  proyectos?: { titulo: string; descripcion?: string; categorias?: string[] }[];
  /** IDs de paquetes seleccionados en el combobox (opcional). */
  paqueteIds?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const currentUser = session.user as unknown as { role?: string };
  if (currentUser.role === "ADMIN") redirect("/admin");

  const sanitized = sanitizeOnboardingInput(data);
  if (!sanitized.primerNombre && !sanitized.primerApellido) {
    throw new Error("Indica al menos tu primer nombre y primer apellido.");
  }
  if (!sanitized.cedula) {
    throw new Error("La cédula es obligatoria.");
  }

  const proyectos = data.proyectos?.filter((p) => p?.titulo?.trim()) ?? [];
  if (proyectos.length === 0) {
    throw new Error("Debes crear al menos un proyecto. Según los proyectos que indiques se te facturará el servicio.");
  }

  const paqueteIds =
    Array.isArray(data.paqueteIds) && data.paqueteIds.length > 0
      ? data.paqueteIds.filter((id) => typeof id === "string" && id.trim().length > 0)
      : null;

  const name =
    [
      sanitized.primerNombre,
      sanitized.segundoNombre,
      sanitized.primerApellido,
      sanitized.segundoApellido,
    ]
      .filter(Boolean)
      .join(" ") || session.user.name || "";

  await db.user.update({
    where: { id: session.user.id },
    data: {
      primerNombre: sanitized.primerNombre || null,
      segundoNombre: sanitized.segundoNombre || null,
      primerApellido: sanitized.primerApellido || null,
      segundoApellido: sanitized.segundoApellido || null,
      cedula: sanitized.cedula || null,
      telefono: sanitized.telefono || null,
      name: name || undefined,
      onboardingCompletedAt: new Date(),
      onboardingSelectedPackageIds: paqueteIds ?? undefined,
    },
  });

  const año = new Date().getFullYear().toString();
  for (const p of proyectos) {
    const titulo = p.titulo.trim();
    const categoriasVal =
      Array.isArray(p.categorias) && p.categorias.length > 0
        ? p.categorias.filter((c) => PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory))
        : undefined;
    const project = await db.project.create({
      data: {
        titulo,
        descripcion: p.descripcion?.trim() || "",
        tipo: "Proyecto",
        año,
        public: false,
        orden: 999,
        categorias: categoriasVal,
      },
    });
    await db.$executeRaw`
      INSERT INTO \`ProjectUser\` (\`projectId\`, \`userId\`)
      VALUES (${project.id}, ${session.user.id})
    `;
    if (paqueteIds && paqueteIds.length > 0) {
      const now = new Date();
      const endsAt = addMonths(now, 1);
      await db.projectPackage.createMany({
        data: paqueteIds.map((packageId) => ({ projectId: project.id, packageId, durationMonths: 1, endsAt })),
      });
    }
  }

  revalidatePath("/onboarding");
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/calendario-editorial");
}

/** Completa onboarding con registro de pago (paso 3). Crea PaymentReport PENDIENTE y luego completa onboarding. */
export async function completeOnboardingWithPayment(data: {
  primerNombre?: string | null;
  segundoNombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  cedula?: string | null;
  telefono?: string | null;
  proyectos?: { titulo: string; descripcion?: string; categorias?: string[] }[];
  paqueteIds?: string[];
  /** Ignorado en servidor: el monto se calcula como suma de los paquetes en paqueteIds. */
  totalAmount?: number;
  paymentMethod: "PAGO_MOVIL" | "STRIPE";
  paymentBank: string;
  paymentReference: string;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const currentUser = session.user as unknown as { role?: string };
  if (currentUser.role === "ADMIN") redirect("/admin");

  const sanitized = sanitizeOnboardingInput(data);
  if (!sanitized.primerNombre && !sanitized.primerApellido) {
    throw new Error("Indica al menos tu primer nombre y primer apellido.");
  }
  if (!sanitized.cedula) {
    throw new Error("La cédula es obligatoria.");
  }

  const proyectos = data.proyectos?.filter((p) => p?.titulo?.trim()) ?? [];
  if (proyectos.length === 0) {
    throw new Error("Debes crear al menos un proyecto.");
  }

  const paqueteIds =
    Array.isArray(data.paqueteIds) && data.paqueteIds.length > 0
      ? data.paqueteIds.filter((id) => typeof id === "string" && id.trim().length > 0)
      : null;

  /** Total a cobrar = suma de todos los paquetes seleccionados (calculado en servidor). */
  const totalAmount =
    paqueteIds && paqueteIds.length > 0 ? await getTotalFromPackageIdsFromDb(paqueteIds) : 0;

  const paymentReference = (data.paymentReference ?? "").trim();
  const paymentBank = (data.paymentBank ?? "").trim();

  /** Para STRIPE: verificar con Stripe que el pago está efectivo antes de completar. */
  let stripePaymentSucceeded = false;
  if (data.paymentMethod === "STRIPE" && totalAmount > 0 && paymentReference) {
    if (!stripe) throw new Error("Stripe no está configurado. No se pudo verificar el pago.");
    const pi = await stripe.paymentIntents.retrieve(paymentReference);
    if (pi.status !== "succeeded") {
      throw new Error("El pago con tarjeta no se ha confirmado. Si ya te descontaron, contacta a soporte con el ID de pago.");
    }
    if (pi.metadata?.userId !== session.user!.id) {
      throw new Error("El pago no corresponde a tu sesión. Contacta a soporte.");
    }
    stripePaymentSucceeded = true;
  }

  if (totalAmount > 0) {
    if (!paymentReference) throw new Error("Indica la referencia de pago.");
    if (data.paymentMethod === "PAGO_MOVIL" && !paymentBank) {
      throw new Error("Indica el banco emisor del pago móvil.");
    }
  }

  const name =
    [
      sanitized.primerNombre,
      sanitized.segundoNombre,
      sanitized.primerApellido,
      sanitized.segundoApellido,
    ]
      .filter(Boolean)
      .join(" ") || session.user.name || "";

  /** Para PAGO_MOVIL: obtener tasa BCV al momento del pago y guardar monto en Bs + tasa para contabilidad. */
  let amountPaidBs: number | null = null;
  let exchangeRateUsdToVes: number | null = null;
  if (totalAmount > 0 && data.paymentMethod === "PAGO_MOVIL") {
    const rate = await getUsdToVesRate();
    if (rate != null && rate > 0) {
      exchangeRateUsdToVes = rate;
      amountPaidBs = totalAmount * rate;
    }
  }

  await db.$transaction(async (tx) => {
    if (totalAmount > 0) {
      const reportStatus = data.paymentMethod === "STRIPE" && stripePaymentSucceeded ? "APROBADO" : "PENDIENTE";
      await tx.paymentReport.create({
        data: {
          userId: session.user!.id,
          amount: totalAmount,
          method: data.paymentMethod,
          bank: data.paymentMethod === "PAGO_MOVIL" ? paymentBank : null,
          reference: paymentReference,
          status: reportStatus,
          amountPaidBs: amountPaidBs ?? undefined,
          exchangeRateUsdToVes: exchangeRateUsdToVes ?? undefined,
          exchangeRateFetchedAt: exchangeRateUsdToVes != null ? new Date() : undefined,
        },
      });
    }

    await tx.user.update({
      where: { id: session.user!.id },
      data: {
        primerNombre: sanitized.primerNombre || null,
        segundoNombre: sanitized.segundoNombre || null,
        primerApellido: sanitized.primerApellido || null,
        segundoApellido: sanitized.segundoApellido || null,
        cedula: sanitized.cedula || null,
        telefono: sanitized.telefono || null,
        name: name || undefined,
        onboardingCompletedAt: new Date(),
        onboardingSelectedPackageIds: paqueteIds ?? undefined,
      },
    });

    const año = new Date().getFullYear().toString();
    for (const p of proyectos) {
      const titulo = p.titulo.trim();
      const categoriasVal =
        Array.isArray(p.categorias) && p.categorias.length > 0
          ? p.categorias.filter((c) => PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory))
          : undefined;
      const project = await tx.project.create({
        data: {
          titulo,
          descripcion: p.descripcion?.trim() || "",
          tipo: "Proyecto",
          año,
          public: false,
          orden: 999,
          categorias: categoriasVal,
        },
      });
      await tx.$executeRaw`
        INSERT INTO \`ProjectUser\` (\`projectId\`, \`userId\`)
        VALUES (${project.id}, ${session.user!.id})
      `;
      if (paqueteIds && paqueteIds.length > 0) {
        const now = new Date();
        const endsAt = addMonths(now, 1);
        await tx.projectPackage.createMany({
          data: paqueteIds.map((packageId) => ({ projectId: project.id, packageId, durationMonths: 1, endsAt })),
        });
      }
    }
  });

  revalidatePath("/onboarding");
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/calendario-editorial");
  revalidatePath("/escritorio/billetera");
}

/** Lista de clientes para la zona Agency (EDITOR y ADMIN). Usado en /agency/clientes con botón "Trabajar". */
export async function getAgencyClients(search?: string | null) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role ?? null;
  if (role !== "EDITOR" && role !== "ADMIN") redirect("/escritorio");

  const term = search?.trim();
  const where = {
    role: "CLIENTE" as const,
    ...(term
      ? {
          OR: [
            { name: { contains: term } },
            { email: { contains: term } },
            { cedula: { contains: term } },
            { primerNombre: { contains: term } },
            { primerApellido: { contains: term } },
          ],
        }
      : {}),
  };

  const users = await db.user.findMany({
    where,
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      role: true,
    },
  });
  return users;
}

/** Elimina un usuario desde el panel de admin (no permite borrar al propio admin actual). */
export async function deleteUser(userId: string) {
  await ensureAdmin();
  const session = await auth();
  const currentId = (session?.user as unknown as { id?: string } | null)?.id ?? null;
  if (currentId && currentId === userId) {
    throw new Error("No puedes eliminar tu propio usuario desde aquí.");
  }

  await db.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
}
