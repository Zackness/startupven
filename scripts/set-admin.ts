/**
 * Asigna rol ADMIN a un usuario.
 * Uso:
 *   npx tsx scripts/set-admin.ts              → asigna ADMIN al primer usuario de la BD
 *   ADMIN_EMAIL=tu@correo.com npx tsx scripts/set-admin.ts  → asigna al usuario con ese email
 */
import "dotenv/config";
import { db } from "../lib/db";
import { UserRole } from "../lib/generated/prisma/enums";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();

  if (email) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`No se encontró usuario con email: ${email}`);
      process.exit(1);
    }
    await db.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN },
    });
    console.log(`Rol ADMIN asignado a: ${user.email}`);
    return;
  }

  const first = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!first) {
    console.error("No hay usuarios en la base de datos.");
    process.exit(1);
  }
  await db.user.update({
    where: { id: first.id },
    data: { role: UserRole.ADMIN },
  });
  console.log(`Rol ADMIN asignado al primer usuario: ${first.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
