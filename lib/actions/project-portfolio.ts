"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PORTFOLIO_ITEM_TYPES, type PortfolioItemType } from "@/lib/portfolio-item-types";

async function requireAdminOrEditor() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/escritorio");
}

function isValidType(t: string): t is PortfolioItemType {
  return PORTFOLIO_ITEM_TYPES.includes(t as PortfolioItemType);
}

export async function getPortfolioItems(projectId: string) {
  await requireAdminOrEditor();
  const items = await db.projectPortfolioItem.findMany({
    where: { projectId },
    orderBy: { orden: "asc" },
  });
  return items.map((i) => ({
    id: i.id,
    type: i.type,
    url: i.url,
    orden: i.orden,
    caption: i.caption ?? undefined,
  }));
}

export async function addPortfolioItem(projectId: string, data: { type: string; url: string; caption?: string }) {
  await requireAdminOrEditor();
  const type = isValidType(data.type) ? data.type : "IMAGE";
  const url = data.url?.trim();
  if (!url) throw new Error("La URL es obligatoria.");

  const count = await db.projectPortfolioItem.count({ where: { projectId } });
  await db.projectPortfolioItem.create({
    data: {
      projectId,
      type,
      url,
      orden: count,
      caption: data.caption?.trim() || null,
    },
  });
  revalidatePath("/admin/proyectos");
  revalidatePath("/admin/proyectos/" + projectId);
  revalidatePath("/proyectos");
  revalidatePath("/proyectos/" + projectId);
}

export async function updatePortfolioItem(
  itemId: string,
  data: { type?: string; url?: string; caption?: string | null; orden?: number }
) {
  await requireAdminOrEditor();
  const item = await db.projectPortfolioItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Ítem no encontrado.");

  const update: { type?: string; url?: string; caption?: string | null; orden?: number } = {};
  if (data.type !== undefined && isValidType(data.type)) update.type = data.type;
  if (data.url !== undefined) update.url = data.url.trim();
  if (data.caption !== undefined) update.caption = data.caption?.trim() || null;
  if (data.orden !== undefined) update.orden = data.orden;

  await db.projectPortfolioItem.update({ where: { id: itemId }, data: update });
  revalidatePath("/admin/proyectos");
  revalidatePath("/admin/proyectos/" + item.projectId);
  revalidatePath("/proyectos");
  revalidatePath("/proyectos/" + item.projectId);
}

export async function deletePortfolioItem(itemId: string) {
  await requireAdminOrEditor();
  const item = await db.projectPortfolioItem.findUnique({ where: { id: itemId } });
  if (!item) return;
  await db.projectPortfolioItem.delete({ where: { id: itemId } });
  revalidatePath("/admin/proyectos");
  revalidatePath("/admin/proyectos/" + item.projectId);
  revalidatePath("/proyectos");
  revalidatePath("/proyectos/" + item.projectId);
}

export async function reorderPortfolioItems(projectId: string, orderedIds: string[]) {
  await requireAdminOrEditor();
  for (let i = 0; i < orderedIds.length; i++) {
    await db.projectPortfolioItem.updateMany({
      where: { id: orderedIds[i], projectId },
      data: { orden: i },
    });
  }
  revalidatePath("/admin/proyectos");
  revalidatePath("/admin/proyectos/" + projectId);
  revalidatePath("/proyectos");
  revalidatePath("/proyectos/" + projectId);
}
