"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Role = string | undefined | null;

async function requireAdminOrEditor() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/escritorio");
  }
  return { session, role };
}

/** Lista todos los proyectos del portafolio (orden, luego fecha). */
export async function getProjects() {
  const rows = await db.project.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    tipo: p.tipo,
    año: p.año,
    imagen: p.imagen ?? undefined,
    url: p.url ?? undefined,
    orden: p.orden,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

/** Para la web pública: mismos campos que el tipo Proyecto de data/proyectos. */
export async function getProjectsForPublic() {
  const rows = await db.project.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    tipo: p.tipo,
    año: p.año,
    imagen: p.imagen ?? undefined,
    url: p.url ?? undefined,
  }));
}

/** Destacados: los primeros por orden (para la home). Si la BD no responde, devuelve [] para que la home siga mostrándose. */
export async function getProyectosDestacados(limit = 3) {
  try {
    const rows = await db.project.findMany({
      orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
      take: limit,
    });
    return rows.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      tipo: p.tipo,
      año: p.año,
      imagen: p.imagen ?? undefined,
      url: p.url ?? undefined,
    }));
  } catch {
    return [];
  }
}

export async function getProjectById(id: string) {
  const p = await db.project.findUnique({ where: { id } });
  if (!p) return null;
  return {
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    tipo: p.tipo,
    año: p.año,
    imagen: p.imagen ?? undefined,
    url: p.url ?? undefined,
    orden: p.orden,
  };
}

export async function createProject(data: {
  titulo: string;
  descripcion: string;
  tipo: string;
  año: string;
  imagen?: string;
  url?: string;
  orden?: number;
}) {
  await requireAdminOrEditor();
  await db.project.create({
    data: {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim(),
      tipo: data.tipo.trim(),
      año: data.año.trim(),
      imagen: data.imagen?.trim() || null,
      url: data.url?.trim() || null,
      orden: data.orden ?? 0,
    },
  });
  revalidatePath("/admin/proyectos");
  revalidatePath("/proyectos");
  revalidatePath("/");
}

export async function updateProject(
  id: string,
  data: {
    titulo?: string;
    descripcion?: string;
    tipo?: string;
    año?: string;
    imagen?: string | null;
    url?: string | null;
    orden?: number;
  }
) {
  await requireAdminOrEditor();
  await db.project.update({
    where: { id },
    data: {
      ...(data.titulo !== undefined && { titulo: data.titulo.trim() }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion.trim() }),
      ...(data.tipo !== undefined && { tipo: data.tipo.trim() }),
      ...(data.año !== undefined && { año: data.año.trim() }),
      ...(data.imagen !== undefined && { imagen: data.imagen?.trim() || null }),
      ...(data.url !== undefined && { url: data.url?.trim() || null }),
      ...(data.orden !== undefined && { orden: data.orden }),
    },
  });
  revalidatePath("/admin/proyectos");
  revalidatePath("/admin/proyectos/" + id);
  revalidatePath("/proyectos");
  revalidatePath("/");
}

export async function deleteProject(id: string) {
  await requireAdminOrEditor();
  await db.project.delete({ where: { id } });
  revalidatePath("/admin/proyectos");
  revalidatePath("/proyectos");
  revalidatePath("/");
}
