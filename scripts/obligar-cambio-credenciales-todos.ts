/**
 * Marca como obligatorio el cambio de correo y contraseña para todos los usuarios
 * que NO son ADMIN (p. ej. creados por script de importación).
 * Los ADMIN no se tocan.
 *
 * Uso: npx tsx scripts/obligar-cambio-credenciales-todos.ts
 */
import "dotenv/config";
import { db } from "../lib/db";
import { UserRole } from "../lib/generated/prisma/enums";

async function main() {
  const result = await db.user.updateMany({
    where: { role: { not: UserRole.ADMIN } },
    data: {
      requiresEmailChange: true,
      requiresPasswordChange: true,
    },
  });

  console.log(`Actualizados ${result.count} usuarios (todos excepto ADMIN).`);
  console.log("En el próximo inicio de sesión se les pedirá cambiar correo y contraseña.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
