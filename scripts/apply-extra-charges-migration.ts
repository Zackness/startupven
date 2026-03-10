import "dotenv/config";
import { db } from "@/lib/db";

async function main() {
  // Crea la tabla ExtraCharge si no existe (igual que el archivo SQL de migración).
  await db.$executeRawUnsafe(`
CREATE TABLE IF NOT EXISTS \`ExtraCharge\` (
  \`id\` varchar(191) NOT NULL,
  \`userId\` varchar(191) NOT NULL,
  \`category\` varchar(191) NOT NULL,
  \`label\` varchar(191) NOT NULL,
  \`description\` text NULL,
  \`amount\` decimal(10,2) NOT NULL,
  \`status\` enum('PENDIENTE','FACTURADO','PAGADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`id\`),
  INDEX \`ExtraCharge_userId_idx\` (\`userId\`),
  INDEX \`ExtraCharge_status_idx\` (\`status\`),
  CONSTRAINT \`ExtraCharge_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await (db as any).$disconnect?.();
  });

