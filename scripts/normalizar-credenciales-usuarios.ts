/**
 * Normaliza credenciales de TODOS los usuarios para que:
 *
 * - Correo @unexpo.edu.ve o @unexpo.com.ve (institucional):
 *   → emailVerified = true, requiresEmailChange = false
 *   (solo se les pide cambio de contraseña si tienen requiresPasswordChange)
 *
 * - Cualquier otro correo (temporal):
 *   → emailVerified = false, requiresEmailChange = true
 *   (así Better Auth permite cambiar el correo sin envío de verificación)
 *
 * Ejecutar: npx tsx scripts/normalizar-credenciales-usuarios.ts
 */

import "dotenv/config";
import { db } from "../lib/db";
import { isInstitutionalEmail } from "../lib/email";

const BATCH_SIZE = 500;

async function main() {
  let processed = 0;
  let updatedInstitutional = 0;
  let updatedNonInstitutional = 0;
  let cursor: string | undefined;

  console.log("Leyendo usuarios en lotes...\n");

  do {
    const batch = await db.user.findMany({
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true, email: true },
    });

    if (batch.length === 0) break;

    const institutionalIds: string[] = [];
    const nonInstitutionalIds: string[] = [];

    for (const u of batch) {
      if (isInstitutionalEmail(u.email)) {
        institutionalIds.push(u.id);
      } else {
        nonInstitutionalIds.push(u.id);
      }
    }

    if (institutionalIds.length > 0) {
      const r = await db.user.updateMany({
        where: { id: { in: institutionalIds } },
        data: { emailVerified: true, requiresEmailChange: false },
      });
      updatedInstitutional += r.count;
    }
    if (nonInstitutionalIds.length > 0) {
      const r = await db.user.updateMany({
        where: { id: { in: nonInstitutionalIds } },
        data: { emailVerified: false, requiresEmailChange: true },
      });
      updatedNonInstitutional += r.count;
    }

    processed += batch.length;
    cursor = batch[batch.length - 1]?.id;
    if (batch.length === BATCH_SIZE) {
      console.log(`  Procesados ${processed} usuarios...`);
    }
  } while (cursor);

  console.log("\n--- Resultado ---");
  console.log(`Usuarios procesados: ${processed}`);
  console.log(`Institucionales (@unexpo.edu.ve / @unexpo.com.ve): emailVerified=true, requiresEmailChange=false → ${updatedInstitutional}`);
  console.log(`No institucionales (temporal): emailVerified=false, requiresEmailChange=true → ${updatedNonInstitutional}`);
  console.log("\nLos usuarios con correo temporal podrán cambiar su correo al iniciar sesión sin verificación por email.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
