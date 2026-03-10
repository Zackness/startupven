"use server";

import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServicePackagesFromIdsFromDb, getTotalFromPackageIdsFromDb, getServicePackageByIdFromDb } from "@/lib/actions/service-packages-db";
import { PROJECT_CATEGORY_VALUES, type ProjectCategory } from "@/lib/project-categories";
import { addMonths } from "@/lib/utils";
import { getUsdToVesRate } from "@/lib/bcv";

export type EscritorioProject = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  año: string;
  categorias: string[] | null;
  createdAt: Date;
  suspended?: boolean;
};

export type EscritorioPaymentReport = {
  id: string;
  amount: number;
  method: string;
  reference: string;
  bank: string | null;
  status: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  createdAt: Date;
};

export type EscritorioPackage = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export type EscritorioExtraCharge = {
  id: string;
  label: string;
  description: string | null;
  amount: number;
  status: string;
  category: string;
  createdAt: Date;
};

export type EscritorioData = {
  projects: EscritorioProject[];
  paymentReports: EscritorioPaymentReport[];
  packagesAcquired: EscritorioPackage[];
  totalPagado: number;
  totalPendiente: number;
  projectsSuspendedCount: number;
  servicesAcquiredCount: number;
  servicesSuspendedCount: number;
  totalServiciosAdquiridos: number;
  supportTicketsCount: number;
  dominiosCount: number;
  extraCharges: EscritorioExtraCharge[];
};

/** Datos del escritorio para el usuario actual: proyectos, reportes de pago, paquetes adquiridos y totales. */
export async function getEscritorioData(): Promise<EscritorioData> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [assignments, reports, user, ticketsCount, servicesSuspendedCount, extraCharges] = await Promise.all([
    db.projectUser.findMany({
      where: { userId },
      include: { project: true },
      orderBy: { project: { createdAt: "desc" } },
    }),
    db.paymentReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        method: true,
        reference: true,
        bank: true,
        status: true,
        createdAt: true,
      },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { onboardingSelectedPackageIds: true },
    }),
    db.supportTicket.count({
      where: { userId, status: { in: ["ABIERTO", "EN_PROCESO", "ESPERANDO_CLIENTE"] } },
    }),
    db.projectPackage.count({
      where: {
        project: { assignedUsers: { some: { userId } } },
        suspended: true,
      },
    }),
    db.extraCharge.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const projectsSuspendedCount = assignments.filter((a) => a.project.suspended).length;

  const projects: EscritorioProject[] = assignments.map((a) => ({
    id: a.project.id,
    titulo: a.project.titulo,
    descripcion: a.project.descripcion,
    tipo: a.project.tipo,
    año: a.project.año,
    categorias: Array.isArray(a.project.categorias) ? (a.project.categorias as string[]) : null,
    createdAt: a.project.createdAt,
    suspended: a.project.suspended,
  }));

  const packageIds = (user?.onboardingSelectedPackageIds as string[] | null) ?? [];
  const packagesFromDb = await getServicePackagesFromIdsFromDb(packageIds);
  const packagesAcquired = packagesFromDb.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
  }));
  const totalServiciosAdquiridosBase = await getTotalFromPackageIdsFromDb(packageIds);
  const totalCargosExtra = extraCharges
    .filter((c) => c.status !== "CANCELADO")
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const totalServiciosAdquiridos = totalServiciosAdquiridosBase + totalCargosExtra;

  const totalPagado = reports
    .filter((r) => r.status === "APROBADO")
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const totalPendiente = reports
    .filter((r) => r.status === "PENDIENTE")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return {
    projects,
    paymentReports: reports.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      method: r.method,
      reference: r.reference,
      bank: r.bank,
      status: r.status,
      createdAt: r.createdAt,
    })),
    packagesAcquired,
    totalPagado,
    totalPendiente,
    projectsSuspendedCount,
    servicesAcquiredCount: packagesAcquired.length,
    servicesSuspendedCount,
    totalServiciosAdquiridos,
    supportTicketsCount: ticketsCount,
    dominiosCount: 0,
    extraCharges: extraCharges.map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description ?? null,
      amount: Number(c.amount),
      status: c.status,
      category: c.category,
      createdAt: c.createdAt,
    })),
  };
}

export type ServicioEstado = "ACTIVO" | "SUSPENDIDO" | "CANCELADO" | "VENCIDO" | "POR_RENOVAR";

export type ServicioConProyecto = {
  projectPackageId: string;
  projectId: string;
  projectTitulo: string;
  packageId: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  durationMonths: number;
  createdAt: Date;
  endsAt: Date | null;
  cancelledAt: Date | null;
  suspended: boolean;
  status: ServicioEstado;
};

/** Deriva el estado de un servicio a partir de sus fechas y flags. */
function servicioStatus(pp: { suspended: boolean; cancelledAt: Date | null; endsAt: Date | null }): ServicioEstado {
  if (pp.cancelledAt) return "CANCELADO";
  if (pp.suspended) return "SUSPENDIDO";
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (pp.endsAt) {
    if (pp.endsAt < now) return "VENCIDO";
    if (pp.endsAt <= in30Days) return "POR_RENOVAR";
  }
  return "ACTIVO";
}

/** Datos para la página de servicios: una fila por asignación (ProjectPackage) con fechas y estado. */
export async function getServiciosData(projectIdFilter?: string | null): Promise<{
  projects: { id: string; titulo: string }[];
  packages: EscritorioPackage[];
  servicios: ServicioConProyecto[];
}> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [assignments, user, projectPackages] = await Promise.all([
    db.projectUser.findMany({
      where: { userId },
      include: { project: { select: { id: true, titulo: true } } },
      orderBy: { project: { titulo: "asc" } },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { onboardingSelectedPackageIds: true },
    }),
    db.projectPackage.findMany({
      where: {
        project: { assignedUsers: { some: { userId } } },
        ...(projectIdFilter ? { projectId: projectIdFilter } : {}),
      },
      include: { project: { select: { id: true, titulo: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const projects = assignments.map((a) => ({ id: a.project.id, titulo: a.project.titulo }));
  const packageIds = (user?.onboardingSelectedPackageIds as string[] | null) ?? [];
  const packages = (await getServicePackagesFromIdsFromDb(packageIds)).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
  }));

  const servicios: ServicioConProyecto[] = await Promise.all(
    projectPackages.map(async (pp) => {
      const pkg = await getServicePackageByIdFromDb(pp.packageId);
      const status = servicioStatus(pp);
      return {
        projectPackageId: pp.id,
        projectId: pp.project.id,
        projectTitulo: pp.project.titulo,
        packageId: pp.packageId,
        name: pkg?.name ?? pp.packageId,
        price: pkg?.price ?? 0,
        category: pkg?.category ?? "",
        description: pkg?.description ?? null,
        durationMonths: pp.durationMonths,
        createdAt: pp.createdAt,
        endsAt: pp.endsAt,
        cancelledAt: pp.cancelledAt,
        suspended: pp.suspended,
        status,
      };
    })
  );

  return { projects, packages, servicios };
}

/** Asigna un paquete (servicio) a un proyecto. Solo si el usuario tiene ese proyecto. */
export async function assignServiceToProject(projectId: string, packageId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const exists = await db.projectUser.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!exists) throw new Error("No tienes acceso a este proyecto.");

  await db.projectPackage.upsert({
    where: {
      projectId_packageId: { projectId, packageId },
    },
    create: {
      projectId,
      packageId,
      durationMonths: 1,
      endsAt: addMonths(new Date(), 1),
    },
    update: {},
  });
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/servicios");
}

/** Quita un servicio del proyecto (elimina la asignación). */
export async function removeServiceFromProject(projectPackageId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pp = await db.projectPackage.findUnique({
    where: { id: projectPackageId },
    include: { project: { include: { assignedUsers: { where: { userId: session.user.id } } } } },
  });
  if (!pp || pp.project.assignedUsers.length === 0) throw new Error("No encontrado o sin acceso.");

  await db.projectPackage.delete({ where: { id: projectPackageId } });
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/servicios");
}

/** Cancela un servicio: ya no se renueva. */
export async function cancelService(projectPackageId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pp = await db.projectPackage.findUnique({
    where: { id: projectPackageId },
    include: { project: { include: { assignedUsers: { where: { userId: session.user.id } } } } },
  });
  if (!pp || pp.project.assignedUsers.length === 0) throw new Error("No encontrado o sin acceso.");
  if (pp.cancelledAt) throw new Error("Este servicio ya está cancelado.");

  await db.projectPackage.update({
    where: { id: projectPackageId },
    data: { cancelledAt: new Date() },
  });
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/servicios");
}

/** Suspende o reactiva un servicio asignado a un proyecto. */
export async function setServiceSuspended(projectPackageId: string, suspended: boolean) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pp = await db.projectPackage.findUnique({
    where: { id: projectPackageId },
    include: { project: { include: { assignedUsers: { where: { userId: session.user.id } } } } },
  });
  if (!pp || pp.project.assignedUsers.length === 0) throw new Error("No encontrado o sin acceso.");

  await db.projectPackage.update({
    where: { id: projectPackageId },
    data: { suspended },
  });
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/servicios");
}

/** Crea un proyecto desde el escritorio y asigna los servicios indicados. Los servicios no son transferibles después. */
export async function createProjectFromEscritorio(data: {
  titulo: string;
  descripcion?: string;
  categorias?: string[];
  packageIds: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const titulo = data.titulo?.trim();
  if (!titulo) throw new Error("El título del proyecto es obligatorio.");

  const packageIds = Array.isArray(data.packageIds) ? data.packageIds.filter((id) => typeof id === "string" && id.trim().length > 0) : [];
  if (packageIds.length === 0) throw new Error("Debes asignar al menos un servicio al proyecto.");

  const catalogRows = await db.servicePackageCatalog.findMany({
    where: { id: { in: packageIds } },
    select: { id: true },
  });
  const catalogIds = new Set(catalogRows.map((r) => r.id));
  const validPackageIds = packageIds.filter((id) => catalogIds.has(id));
  if (validPackageIds.length === 0) throw new Error("Ninguno de los servicios seleccionados existe en el catálogo.");

  const año = new Date().getFullYear().toString();
  const categoriasVal =
    Array.isArray(data.categorias) && data.categorias.length > 0
      ? data.categorias.filter((c) => PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory))
      : undefined;

  const project = await db.project.create({
    data: {
      titulo,
      descripcion: (data.descripcion ?? "").trim().slice(0, 65535) || "",
      tipo: "Proyecto",
      año,
      public: false,
      orden: 999,
      categorias: categoriasVal,
    },
  });

  await db.projectUser.create({
    data: { projectId: project.id, userId: session.user.id },
  });

  await db.projectPackage.createMany({
    data: validPackageIds.map((packageId) => {
      const now = new Date();
      return { projectId: project.id, packageId, durationMonths: 1, endsAt: addMonths(now, 1) };
    }),
  });

  revalidatePath("/escritorio");
  revalidatePath("/escritorio/proyectos");
  revalidatePath("/escritorio/servicios");
  return { projectId: project.id };
}

/** Crea proyecto desde escritorio y opcionalmente registra el pago (paso 2 del dialog). */
export async function createProjectFromEscritorioWithPayment(data: {
  titulo: string;
  descripcion?: string;
  categorias?: string[];
  packageIds: string[];
  paymentMethod?: "PAGO_MOVIL" | "STRIPE";
  paymentBank?: string;
  paymentReference?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const titulo = data.titulo?.trim();
  if (!titulo) throw new Error("El título del proyecto es obligatorio.");

  const packageIds = Array.isArray(data.packageIds) ? data.packageIds.filter((id) => typeof id === "string" && id.trim().length > 0) : [];
  if (packageIds.length === 0) throw new Error("Debes asignar al menos un servicio al proyecto.");

  const catalogRows = await db.servicePackageCatalog.findMany({
    where: { id: { in: packageIds } },
    select: { id: true },
  });
  const catalogIds = new Set(catalogRows.map((r) => r.id));
  const validPackageIds = packageIds.filter((id) => catalogIds.has(id));
  if (validPackageIds.length === 0) throw new Error("Ninguno de los servicios seleccionados existe en el catálogo.");

  const totalAmount = await getTotalFromPackageIdsFromDb(validPackageIds);
  const paymentReference = (data.paymentReference ?? "").trim();
  const paymentBank = (data.paymentBank ?? "").trim();

  if (totalAmount > 0) {
    if (!paymentReference) throw new Error("Indica la referencia de pago.");
    if (data.paymentMethod === "PAGO_MOVIL" && !paymentBank) throw new Error("Indica el banco emisor del pago móvil.");
  }

  let stripePaymentSucceeded = false;
  if (totalAmount > 0 && data.paymentMethod === "STRIPE" && paymentReference) {
    const stripeSecretKey = process.env.STRIPE_API_KEY;
    if (!stripeSecretKey) throw new Error("Stripe no está configurado. No se pudo verificar el pago.");
    const stripe = new Stripe(stripeSecretKey);
    const pi = await stripe.paymentIntents.retrieve(paymentReference);
    if (pi.status !== "succeeded") {
      throw new Error("El pago con tarjeta no se ha confirmado. Si ya te descontaron, contacta a soporte con el ID de pago.");
    }
    if (pi.metadata?.userId !== session.user.id) {
      throw new Error("El pago no corresponde a tu sesión. Contacta a soporte.");
    }
    stripePaymentSucceeded = true;
  }

  let amountPaidBs: number | null = null;
  let exchangeRateUsdToVes: number | null = null;
  if (totalAmount > 0 && data.paymentMethod === "PAGO_MOVIL") {
    const rate = await getUsdToVesRate();
    if (rate != null && rate > 0) {
      exchangeRateUsdToVes = rate;
      amountPaidBs = totalAmount * rate;
    }
  }

  const año = new Date().getFullYear().toString();
  const categoriasVal =
    Array.isArray(data.categorias) && data.categorias.length > 0
      ? data.categorias.filter((c) => PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory))
      : undefined;

  await db.$transaction(async (tx) => {
    if (totalAmount > 0 && paymentReference) {
      const reportStatus = data.paymentMethod === "STRIPE" && stripePaymentSucceeded ? "APROBADO" : "PENDIENTE";
      await tx.paymentReport.create({
        data: {
          userId: session.user!.id,
          amount: totalAmount,
          method: data.paymentMethod ?? "PAGO_MOVIL",
          bank: data.paymentMethod === "PAGO_MOVIL" ? paymentBank : null,
          reference: paymentReference,
          status: reportStatus,
          amountPaidBs: amountPaidBs ?? undefined,
          exchangeRateUsdToVes: exchangeRateUsdToVes ?? undefined,
          exchangeRateFetchedAt: exchangeRateUsdToVes != null ? new Date() : undefined,
        },
      });
    }
    const project = await tx.project.create({
      data: {
        titulo,
        descripcion: (data.descripcion ?? "").trim().slice(0, 65535) || "",
        tipo: "Proyecto",
        año,
        public: false,
        orden: 999,
        categorias: categoriasVal,
      },
    });
    await tx.projectUser.create({
      data: { projectId: project.id, userId: session.user.id },
    });
    const now = new Date();
    await tx.projectPackage.createMany({
      data: validPackageIds.map((packageId) => ({
        projectId: project.id,
        packageId,
        durationMonths: 1,
        endsAt: addMonths(now, 1),
      })),
    });
  });

  revalidatePath("/escritorio");
  revalidatePath("/escritorio/proyectos");
  revalidatePath("/escritorio/servicios");
}
