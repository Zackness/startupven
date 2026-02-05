/**
 * Asigna rol ADMIN al usuario cuyo correo contiene "opsuale".
 * Uso: npx tsx scripts/set-admin-opsuale.ts
 */
import { db } from "../lib/db";
import { UserRole } from "../lib/generated/prisma/enums";

async function main() {
  const users = await db.user.findMany({
    where: {
      email: { contains: "opsuale" },
    },
  });

  if (users.length === 0) {
    console.log('No se encontró ningún usuario con correo que contenga "opsuale".');
    process.exit(1);
  }

  if (users.length > 1) {
    console.log(`Se encontraron ${users.length} usuarios. Se actualizará el primero: ${users[0].email}`);
  }

  await db.user.update({
    where: { id: users[0].id },
    data: { role: UserRole.ADMIN },
  });

  console.log(`Rol ADMIN asignado correctamente a: ${users[0].email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
