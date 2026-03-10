"use server";

import { db } from "@/lib/db";

function slugifyBase(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "proyecto";
}

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = slugifyBase(base);
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.clientProject.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${slug}-${suffix++}`;
  }
}

/** Crea el primer proyecto de un cliente si aún no tiene ninguno (se usa en el onboarding). */
export async function ensureInitialClientProjectForUser(opts: {
  userId: string;
  clientName: string;
  createdById?: string | null;
}) {
  const existing = await db.clientProject.findFirst({
    where: { userId: opts.userId },
    select: { id: true },
  });
  if (existing) return existing;

  const baseName = opts.clientName?.trim() || "Proyecto principal";
  const slug = await generateUniqueSlug(baseName);

  const created = await db.clientProject.create({
    data: {
      userId: opts.userId,
      createdById: opts.createdById ?? opts.userId,
      name: baseName,
      slug,
      tipo: "WEB",
      status: "EN_PLANEACION",
    },
    select: { id: true },
  });

  return created;
}

