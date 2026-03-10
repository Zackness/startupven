"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PROJECT_CATEGORY_VALUES, type ProjectCategory } from "@/lib/project-categories";
import { getServicePackagesFromIdsFromDb } from "@/lib/actions/service-packages-db";
import { addMonths } from "@/lib/utils";

function categoriasFromJson(json: unknown): string[] {
  if (!json) return [];
  if (Array.isArray(json)) return json.filter((x): x is string => typeof x === "string");
  return [];
}

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
    categorias: categoriasFromJson(p.categorias),
    public: p.public,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

type ProjectListItem = Awaited<ReturnType<typeof getProjects>>[number];

/** Lista proyectos con filtro por búsqueda de texto (título, descripción, tipo) y por categoría. */
export async function getProjectsFiltered(
  search?: string | null,
  categoria?: string | null
): Promise<ProjectListItem[]> {
  const all = await getProjects();
  const term = search?.trim().toLowerCase() ?? "";
  const cat = categoria?.trim() && PROJECT_CATEGORY_VALUES.includes(categoria.trim() as ProjectCategory) ? categoria.trim() : null;

  return all.filter((p) => {
    if (term) {
      const match =
        p.titulo.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term) ||
        p.tipo.toLowerCase().includes(term);
      if (!match) return false;
    }
    if (cat) {
      if (!p.categorias?.length || !p.categorias.includes(cat)) return false;
    }
    return true;
  });
}

/** Para la web pública: solo proyectos marcados como públicos. */
export async function getProjectsForPublic() {
  const rows = await db.project.findMany({
    where: { public: true },
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

/** Destacados: los primeros públicos por orden (para la home). Si la BD no responde, devuelve [] para que la home siga mostrándose. */
export async function getProyectosDestacados(limit = 3) {
  try {
    const rows = await db.project.findMany({
      where: { public: true },
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
  const p = await db.project.findUnique({
    where: { id },
    include: { portfolioItems: { orderBy: { orden: "asc" } } },
  });
  if (!p) return null;

  const assignmentRows = await db.$queryRaw<{ userId: string }[]>`
    SELECT \`userId\` FROM \`ProjectUser\` WHERE \`projectId\` = ${id}
  `;
  const userIds = assignmentRows.map((r) => r.userId);
  const assignedUsersList =
    userIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

  return {
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    tipo: p.tipo,
    año: p.año,
    imagen: p.imagen ?? undefined,
    url: p.url ?? undefined,
    orden: p.orden,
    categorias: categoriasFromJson(p.categorias),
    public: p.public,
    portfolioItems: p.portfolioItems.map((i) => ({
      id: i.id,
      type: i.type,
      url: i.url,
      orden: i.orden,
      caption: i.caption ?? undefined,
    })),
    assignedUserIds: assignedUsersList.map((u) => u.id),
    assignedUsers: assignedUsersList.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email ?? "",
    })),
  };
}

/** Proyecto por ID para la web pública; solo si es público. Incluye ítems de portafolio. */
export async function getProjectByIdForPublic(id: string) {
  const p = await db.project.findFirst({
    where: { id, public: true },
    include: { portfolioItems: { orderBy: { orden: "asc" } } },
  });
  if (!p) return null;
  return {
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    tipo: p.tipo,
    año: p.año,
    imagen: p.imagen ?? undefined,
    url: p.url ?? undefined,
    portfolioItems: p.portfolioItems.map((i) => ({
      id: i.id,
      type: i.type,
      url: i.url,
      orden: i.orden,
      caption: i.caption ?? undefined,
    })),
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
  categorias?: string[];
  public?: boolean;
  assignedUserIds?: string[];
  /** Paquetes (servicios) a asignar al proyecto con duración en meses. Solo al crear. */
  packages?: { packageId: string; durationMonths: number }[];
}) {
  await requireAdminOrEditor();
  const categoriasArr = data.categorias?.filter((c) => PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory)) ?? [];
  const project = await db.project.create({
    data: {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim(),
      tipo: data.tipo.trim(),
      año: data.año.trim(),
      imagen: data.imagen?.trim() || null,
      url: data.url?.trim() || null,
      orden: data.orden ?? 0,
      categorias: categoriasArr.length > 0 ? categoriasArr : undefined,
      public: data.public ?? true,
    },
  });
  const userIds = data.assignedUserIds?.filter(Boolean) ?? [];
  if (userIds.length > 0) {
    for (const userId of userIds) {
      await db.$executeRaw`
        INSERT INTO \`ProjectUser\` (\`projectId\`, \`userId\`)
        VALUES (${project.id}, ${userId})
        ON DUPLICATE KEY UPDATE \`projectId\` = \`projectId\`
      `;
    }
  }
  const packagesToCreate = data.packages?.filter((p) => p.packageId?.trim() && (p.durationMonths ?? 0) > 0) ?? [];
  if (packagesToCreate.length > 0) {
    const now = new Date();
    for (const p of packagesToCreate) {
      const durationMonths = Math.max(1, Math.floor(p.durationMonths));
      const endsAt = addMonths(now, durationMonths);
      await db.projectPackage.create({
        data: {
          projectId: project.id,
          packageId: p.packageId.trim(),
          durationMonths,
          endsAt,
        },
      });
    }
  }
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
    categorias?: string[] | null;
    public?: boolean;
    assignedUserIds?: string[] | null;
  }
) {
  await requireAdminOrEditor();
  const categoriasArr =
    data.categorias === null || data.categorias === undefined
      ? undefined
      : data.categorias.filter((c) => PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory));
  const categoriasValue =
    categoriasArr === undefined
      ? undefined
      : categoriasArr.length > 0
        ? categoriasArr
        : Prisma.JsonNull;

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
      ...(data.categorias !== undefined && { categorias: categoriasValue }),
      ...(data.public !== undefined && { public: data.public }),
    },
  });

  if (data.assignedUserIds !== undefined) {
    await db.$executeRaw`DELETE FROM \`ProjectUser\` WHERE \`projectId\` = ${id}`;
    const userIds = data.assignedUserIds?.filter(Boolean) ?? [];
    for (const userId of userIds) {
      await db.$executeRaw`
        INSERT INTO \`ProjectUser\` (\`projectId\`, \`userId\`)
        VALUES (${id}, ${userId})
      `;
    }
  }

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

/** Servicios (paquetes) asignados a un proyecto, con nombre del catálogo. Solo admin/editor. */
export type ProjectPackageForAdmin = {
  id: string;
  packageId: string;
  packageName: string;
  category: string;
  price: number;
  suspended: boolean;
  cancelledAt: Date | null;
  endsAt: Date | null;
  durationMonths: number;
  createdAt: Date;
};

export async function getProjectPackagesForAdmin(projectId: string): Promise<ProjectPackageForAdmin[]> {
  await requireAdminOrEditor();
  const list = await db.projectPackage.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
  if (list.length === 0) return [];
  const catalog = await getServicePackagesFromIdsFromDb(list.map((p) => p.packageId));
  const byId = new Map(catalog.map((c) => [c.id, c]));
  return list.map((p) => {
    const c = byId.get(p.packageId);
    return {
      id: p.id,
      packageId: p.packageId,
      packageName: c?.name ?? p.packageId,
      category: c?.category ?? "",
      price: c?.price ?? 0,
      suspended: p.suspended,
      cancelledAt: p.cancelledAt,
      endsAt: p.endsAt,
      durationMonths: p.durationMonths,
      createdAt: p.createdAt,
    };
  });
}

/** Proyectos asignados al usuario actual (cliente). Para el selector del calendario editorial en escritorio. */
export async function getAssignedProjectsForCurrentUser(): Promise<{ id: string; titulo: string }[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = (session.user as { id: string }).id;
  const rows = await db.$queryRaw<{ projectId: string }[]>`
    SELECT \`projectId\` FROM \`ProjectUser\` WHERE \`userId\` = ${userId}
  `;
  const projectIds = rows.map((r) => r.projectId).filter(Boolean);
  if (projectIds.length === 0) return [];
  const projects = await db.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, titulo: true },
    orderBy: { titulo: "asc" },
  });
  return projects.map((p) => ({ id: p.id, titulo: p.titulo }));
}

/** Crear un proyecto y asignarse como cliente (desde el escritorio, calendario editorial). Solo para clientes. */
export async function createProjectAsClient(data: {
  titulo: string;
  descripcion?: string;
  categoria?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const user = session.user as { id: string; role?: string };
  const role = user.role ?? null;
  if (role === "ADMIN" || role === "EDITOR") {
    throw new Error("Los administradores y editores crean proyectos desde el panel de administración.");
  }

  const titulo = data.titulo?.trim();
  if (!titulo) throw new Error("El nombre del proyecto es obligatorio.");

  const año = new Date().getFullYear().toString();
  const categoriasVal =
    data.categoria && PROJECT_CATEGORY_VALUES.includes(data.categoria as ProjectCategory)
      ? [data.categoria]
      : undefined;

  const project = await db.project.create({
    data: {
      titulo,
      descripcion: data.descripcion?.trim() || "",
      tipo: "Proyecto",
      año,
      public: false,
      orden: 999,
      categorias: categoriasVal,
    },
  });

  await db.$executeRaw`
    INSERT INTO \`ProjectUser\` (\`projectId\`, \`userId\`)
    VALUES (${project.id}, ${user.id})
  `;

  revalidatePath("/escritorio");
  revalidatePath("/escritorio/calendario-editorial");
  return { id: project.id, titulo: project.titulo };
}
