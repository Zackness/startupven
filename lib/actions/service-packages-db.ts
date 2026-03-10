"use server";

import { db } from "@/lib/db";
import type { ProjectCategory } from "@/lib/project-categories";
import { PROJECT_CATEGORY_VALUES } from "@/lib/project-categories";

export type ServicePackageRow = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
};

/** Lista todos los paquetes del catálogo (para admin y para app cuando usa BD). */
export async function getAllServicePackagesFromDb(): Promise<ServicePackageRow[]> {
  const rows = await db.servicePackageCatalog.findMany({
    orderBy: [{ category: "asc" }, { orden: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: Number(r.price),
    category: r.category,
    description: r.description,
  }));
}

/** Obtiene un paquete por ID desde la BD. */
export async function getServicePackageByIdFromDb(id: string | null | undefined): Promise<ServicePackageRow | null> {
  if (!id?.trim()) return null;
  const r = await db.servicePackageCatalog.findUnique({ where: { id: id.trim() } });
  if (!r) return null;
  return { id: r.id, name: r.name, price: Number(r.price), category: r.category, description: r.description };
}

/** Lista paquetes por IDs (solo los que existan). */
export async function getServicePackagesFromIdsFromDb(ids: string[]): Promise<ServicePackageRow[]> {
  if (ids.length === 0) return [];
  const rows = await db.servicePackageCatalog.findMany({
    where: { id: { in: ids } },
    orderBy: { category: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: Number(r.price),
    category: r.category,
    description: r.description,
  }));
}

/** Total en USD de una lista de IDs (desde BD). */
export async function getTotalFromPackageIdsFromDb(ids: string[]): Promise<number> {
  const list = await getServicePackagesFromIdsFromDb(ids);
  return list.reduce((sum, p) => sum + p.price, 0);
}

/** Paquetes de una o más categorías (acepta SCALE como WEB). */
export async function getPackagesByCategoriesFromDb(categories: string[]): Promise<ServicePackageRow[]> {
  const set = new Set(categories);
  if (set.has("SCALE")) set.add("WEB");
  const list = Array.from(set).filter((c) => PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory));
  if (list.length === 0) return [];
  const rows = await db.servicePackageCatalog.findMany({
    where: { category: { in: list } },
    orderBy: [{ category: "asc" }, { orden: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: Number(r.price),
    category: r.category,
    description: r.description,
  }));
}
