/**
 * Corrige usuarios con role vacío o NULL en la base de datos.
 * Prisma falla con "Value '' not found in enum 'UserRole'" al leer esos registros.
 * Uso: npx tsx scripts/fix-user-role-enum.ts
 */
import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  // Usar SQL crudo porque Prisma no puede leer filas con role = ''
  const result = await (db as { $executeRawUnsafe: (sql: string, ...values: unknown[]) => Promise<number> }).$executeRawUnsafe(
    "UPDATE User SET role = ? WHERE role = '' OR role IS NULL",
    "CLIENTE"
  );
  console.log(`Actualizados ${result} usuario(s) con role vacío o NULL → CLIENTE.`);
  if (result === 0) {
    console.log("No había registros que corregir. Si el error persiste, revisa que la tabla se llame 'User' y la columna 'role'.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
