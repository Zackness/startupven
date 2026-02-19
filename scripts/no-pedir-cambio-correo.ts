/**
 * Marca un usuario por correo para que NO se le pida cambio de correo ni de contraseña:
 *   requiresEmailChange = false, emailVerified = true, requiresPasswordChange = false
 *
 * Uso: npx tsx scripts/no-pedir-cambio-correo.ts <correo>
 * Ejemplo: npx tsx scripts/no-pedir-cambio-correo.ts b.a.m.futuro@gmail.com
 */

import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const email = process.argv[2]?.trim()?.toLowerCase();
  if (!email) {
    console.error("Uso: npx tsx scripts/no-pedir-cambio-correo.ts <correo>");
    process.exit(1);
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, requiresEmailChange: true, emailVerified: true, requiresPasswordChange: true },
  });

  if (!user) {
    console.error(`No se encontró ningún usuario con correo: ${email}`);
    process.exit(1);
  }

  await db.user.update({
    where: { id: user.id },
    data: { requiresEmailChange: false, emailVerified: true, requiresPasswordChange: false },
  });

  console.log(`Usuario actualizado: ${user.name} (${user.email})`);
  console.log("  requiresEmailChange = false, emailVerified = true, requiresPasswordChange = false");
  console.log("Ya no se le pedirá cambio de correo ni de contraseña al iniciar sesión.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
