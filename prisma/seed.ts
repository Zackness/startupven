/**
 * Seed: tipos de ticket por defecto y opcionalmente asignar rol ADMIN.
 * Uso: ADMIN_EMAIL=admin@uni.edu npx tsx prisma/seed.ts
 * Requiere: DATABASE_URL con mysql:// y haber ejecutado prisma db push o migrate.
 */
import { db } from "../lib/db";
import { UserRole } from "../lib/generated/prisma/enums";

async function main() {
  const count = await db.ticketType.count();
  if (count === 0) {
    await db.ticketType.createMany({
      data: [
        { name: "Desayuno", price: 2.5, description: "Desayuno del comedor" },
        { name: "Comida", price: 5.0, description: "Menú del día" },
      ],
    });
    console.log("Tipos de ticket creados: Desayuno, Comida");
  } else {
    console.log("Ya existen tipos de ticket, no se crean de nuevo.");
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const updated = await db.user.updateMany({
      where: { email: adminEmail },
      data: { role: UserRole.ADMIN },
    });
    if (updated.count > 0) {
      console.log(`Rol ADMIN asignado a: ${adminEmail}`);
    } else {
      console.log(`No se encontró usuario con email: ${adminEmail}`);
    }
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
