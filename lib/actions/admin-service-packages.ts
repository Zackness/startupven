"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PROJECT_CATEGORY_VALUES, type ProjectCategory } from "@/lib/project-categories";

const ADMIN_SERVICIOS_PATH = "/admin/servicios";

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");
}

export type AdminServicePackage = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  orden: number;
};

/** Lista todos los paquetes del catálogo para admin. */
export async function getAdminServicePackages(): Promise<AdminServicePackage[]> {
  await ensureAdmin();
  const rows = await db.servicePackageCatalog.findMany({
    orderBy: [{ category: "asc" }, { orden: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: Number(r.price),
    category: r.category,
    description: r.description,
    orden: r.orden,
  }));
}

/** Crea un paquete en el catálogo. */
export async function createServicePackage(data: {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
}) {
  await ensureAdmin();
  const id = data.id.trim().toUpperCase().replace(/\s+/g, "_");
  if (!id) throw new Error("El ID es obligatorio.");
  if (!data.name?.trim()) throw new Error("El nombre es obligatorio.");
  const category = data.category?.trim();
  if (!category || !PROJECT_CATEGORY_VALUES.includes(category as ProjectCategory)) {
    throw new Error("Categoría no válida.");
  }
  const price = Number(data.price);
  if (Number.isNaN(price) || price < 0) throw new Error("Precio no válido.");

  const maxOrden = await db.servicePackageCatalog.aggregate({
    where: { category },
    _max: { orden: true },
  });
  const orden = (maxOrden._max.orden ?? 0) + 1;

  await db.servicePackageCatalog.create({
    data: {
      id,
      name: data.name.trim(),
      price,
      category,
      description: data.description?.trim() || null,
      orden,
    },
  });
  revalidatePath(ADMIN_SERVICIOS_PATH);
  revalidatePath("/onboarding");
  revalidatePath("/escritorio");
}

/** Actualiza un paquete. */
export async function updateServicePackage(
  id: string,
  data: { name?: string; price?: number; category?: string; description?: string | null }
) {
  await ensureAdmin();
  const existing = await db.servicePackageCatalog.findUnique({ where: { id } });
  if (!existing) throw new Error("Paquete no encontrado.");

  const update: { name?: string; price?: number; category?: string; description?: string | null } = {};
  if (data.name !== undefined) update.name = data.name.trim();
  if (data.price !== undefined) {
    const price = Number(data.price);
    if (Number.isNaN(price) || price < 0) throw new Error("Precio no válido.");
    update.price = price;
  }
  if (data.category !== undefined) {
    const category = data.category.trim();
    if (!category || !PROJECT_CATEGORY_VALUES.includes(category as ProjectCategory)) {
      throw new Error("Categoría no válida.");
    }
    update.category = category;
  }
  if (data.description !== undefined) update.description = data.description?.trim() || null;

  await db.servicePackageCatalog.update({
    where: { id },
    data: update,
  });
  revalidatePath(ADMIN_SERVICIOS_PATH);
  revalidatePath("/admin/servicios/[id]");
  revalidatePath("/onboarding");
  revalidatePath("/escritorio");
}

/** Elimina un paquete. Si hay ProjectPackage o usuarios con ese ID en onboardingSelectedPackageIds, puede fallar o dejarse referencias huérfanas. */
export async function deleteServicePackage(id: string) {
  await ensureAdmin();
  const existing = await db.servicePackageCatalog.findUnique({ where: { id } });
  if (!existing) throw new Error("Paquete no encontrado.");

  await db.servicePackageCatalog.delete({ where: { id } });
  revalidatePath(ADMIN_SERVICIOS_PATH);
  revalidatePath("/onboarding");
  revalidatePath("/escritorio");
}
