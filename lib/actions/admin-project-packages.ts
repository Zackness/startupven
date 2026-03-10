"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addMonths } from "@/lib/utils";

async function requireAdminOrEditor() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/escritorio");
  return { session };
}

/** Asigna un paquete/servicio a un proyecto. Solo admin/editor. */
export async function assignServiceToProjectAdmin(projectId: string, packageId: string) {
  await requireAdminOrEditor();
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Proyecto no encontrado.");
  const catalog = await db.servicePackageCatalog.findUnique({ where: { id: packageId } });
  if (!catalog) throw new Error("Paquete no encontrado en el catálogo.");
  const now = new Date();
  const endsAt = addMonths(now, 1);
  await db.projectPackage.upsert({
    where: { projectId_packageId: { projectId, packageId } },
    create: { projectId, packageId, durationMonths: 1, endsAt },
    update: {},
  });
  revalidatePath("/admin/proyectos");
  revalidatePath(`/admin/proyectos/${projectId}`);
  revalidatePath("/admin/proyectos/[id]/editar");
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/servicios");
}

/** Suspende o reactiva un servicio del proyecto. Solo admin/editor. */
export async function setServiceSuspendedAdmin(projectPackageId: string, suspended: boolean) {
  await requireAdminOrEditor();
  const pp = await db.projectPackage.findUnique({ where: { id: projectPackageId } });
  if (!pp) throw new Error("Servicio no encontrado.");
  await db.projectPackage.update({
    where: { id: projectPackageId },
    data: { suspended },
  });
  revalidatePath("/admin/proyectos");
  revalidatePath(`/admin/proyectos/${pp.projectId}`);
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/servicios");
}

/** Marca el servicio como cancelado (no se renueva). Solo admin/editor. */
export async function cancelServiceAdmin(projectPackageId: string) {
  await requireAdminOrEditor();
  const pp = await db.projectPackage.findUnique({ where: { id: projectPackageId } });
  if (!pp) throw new Error("Servicio no encontrado.");
  if (pp.cancelledAt) throw new Error("Este servicio ya está cancelado.");
  await db.projectPackage.update({
    where: { id: projectPackageId },
    data: { cancelledAt: new Date() },
  });
  revalidatePath("/admin/proyectos");
  revalidatePath(`/admin/proyectos/${pp.projectId}`);
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/servicios");
}

/** Quita el servicio del proyecto (elimina la asignación). Solo admin/editor. */
export async function removeServiceFromProjectAdmin(projectPackageId: string) {
  await requireAdminOrEditor();
  const pp = await db.projectPackage.findUnique({ where: { id: projectPackageId } });
  if (!pp) throw new Error("Servicio no encontrado.");
  await db.projectPackage.delete({ where: { id: projectPackageId } });
  revalidatePath("/admin/proyectos");
  revalidatePath(`/admin/proyectos/${pp.projectId}`);
  revalidatePath("/escritorio");
  revalidatePath("/escritorio/servicios");
}
