/**
 * Asigna todos los servicios adquiridos (onboardingSelectedPackageIds) de un usuario
 * al proyecto indicado. Para usuarios que completaron onboarding antes de que existiera
 * la asignación automática de servicios a proyectos.
 *
 * Uso:
 *   npx tsx scripts/assign-user-packages-to-project.ts
 *
 * Variables de entorno:
 *   USER_EMAIL=i.am.zackness@gmail.com
 *   PROJECT_TITLE=FRANKY+
 */
import "dotenv/config";
import { db } from "../lib/db";
import { addMonths } from "../lib/utils";

const USER_EMAIL = process.env.USER_EMAIL?.trim() || "i.am.zackness@gmail.com";
const PROJECT_TITLE = process.env.PROJECT_TITLE?.trim() || "FRANKY+";

async function main() {
  const user = await db.user.findUnique({
    where: { email: USER_EMAIL },
    select: { id: true, name: true, email: true, onboardingSelectedPackageIds: true },
  });

  if (!user) {
    console.error(`No se encontró usuario con email: ${USER_EMAIL}`);
    process.exit(1);
  }

  const packageIds = (user.onboardingSelectedPackageIds as string[] | null) ?? [];
  if (packageIds.length === 0) {
    console.error(`El usuario ${user.email} no tiene servicios adquiridos (onboardingSelectedPackageIds vacío).`);
    process.exit(1);
  }

  const assignment = await db.projectUser.findFirst({
    where: {
      userId: user.id,
      project: {
        titulo: { contains: PROJECT_TITLE },
      },
    },
    include: { project: { select: { id: true, titulo: true } } },
  });

  if (!assignment) {
    console.error(`No se encontró ningún proyecto asignado al usuario que contenga el título "${PROJECT_TITLE}".`);
    const projects = await db.projectUser.findMany({
      where: { userId: user.id },
      include: { project: { select: { titulo: true } } },
    });
    if (projects.length > 0) {
      console.error("Proyectos del usuario:", projects.map((p) => p.project.titulo).join(", "));
    }
    process.exit(1);
  }

  const projectId = assignment.project.id;
  const projectTitulo = assignment.project.titulo;

  const existing = await db.projectPackage.findMany({
    where: { projectId },
    select: { packageId: true },
  });
  const existingIds = new Set(existing.map((e) => e.packageId));
  const toAdd = packageIds.filter((id) => !existingIds.has(id));

  if (toAdd.length === 0) {
    console.log(`El proyecto "${projectTitulo}" ya tiene asignados todos los servicios del usuario. Nada que hacer.`);
    return;
  }

  const now = new Date();
  const endsAt = addMonths(now, 1);
  await db.projectPackage.createMany({
    data: toAdd.map((packageId) => ({
      projectId,
      packageId,
      durationMonths: 1,
      endsAt,
    })),
  });

  console.log(`Usuario: ${user.name ?? user.email}`);
  console.log(`Proyecto: ${projectTitulo} (${projectId})`);
  console.log(`Servicios asignados: ${toAdd.length}`);
  toAdd.forEach((id) => console.log(`  - ${id}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
