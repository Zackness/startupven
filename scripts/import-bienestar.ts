/**
 * Importación de personal obrero y docentes desde base_datos_bienestar_estudiantil.md
 *
 * - Solo importa GREMIO "Obrero", "Obrera" o "Docente" (Administrativo se omite).
 * - No inserta duplicados: omite por nombre completo o nombre + apellido.
 * - Email: se usa CORREO INSTITUCIONAL si viene en el archivo; si no, nombreapellido@gmail.com
 * - Contraseña: 123456
 * - Rol: CLIENTE. Gremio: OBRERO o PROFESORES según la columna GREMIO.
 *
 * Ejecutar: npx tsx scripts/import-bienestar.ts
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { isInstitutionalEmail } from "../lib/email";
import { UserRole } from "../lib/generated/prisma/enums";

const MD_PATH = join(process.cwd(), "base_datos_bienestar_estudiantil.md");
const PASSWORD_PLAIN = "123456";

function normalizeForCompare(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function slugForEmail(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "");
}

function parseRow(
  line: string
): { cedula: string; nombres: string; apellidos: string; gremioRaw: string; correo: string } | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  const cells = trimmed.split("|").map((c) => c.trim());
  if (cells.length < 9) return null;
  const cedula = cells[2];
  const nombres = cells[3];
  const apellidos = cells[4];
  const gremioRaw = (cells[5] ?? "").trim();
  const correo = (cells[8] ?? "").trim();
  if (!cedula || !nombres || !apellidos) return null;
  if (!/^\d+$/.test(cedula.replace(/\s/g, ""))) return null;
  return {
    cedula: cedula.replace(/\s/g, ""),
    nombres: nombres.trim(),
    apellidos: apellidos.trim(),
    gremioRaw,
    correo: correo.replace(/[,]/g, "."),
  };
}

function mapGremio(gremioRaw: string): "OBRERO" | "PROFESORES" | null {
  const g = gremioRaw.toLowerCase();
  if (g === "obrero" || g === "obrera") return "OBRERO";
  if (g === "docente") return "PROFESORES";
  return null;
}

function nameToParts(nombres: string, apellidos: string) {
  const nom = nombres.trim().split(/\s+/).filter(Boolean);
  const ape = apellidos.trim().split(/\s+/).filter(Boolean);
  const primerNombre = nom[0] ?? "";
  const segundoNombre = nom.slice(1).join(" ") || null;
  const primerApellido = ape[0] ?? "";
  const segundoApellido = ape.slice(1).join(" ") || null;
  const fullName = [nombres, apellidos].filter(Boolean).join(" ");
  return { primerNombre, segundoNombre, primerApellido, segundoApellido, fullName };
}

function buildFallbackEmail(primerNombre: string, primerApellido: string, cedula: string): string {
  const base = slugForEmail(primerNombre + primerApellido);
  if (!base) return `personal${cedula}@gmail.com`;
  return `${base}@gmail.com`;
}

async function main() {
  const content = readFileSync(MD_PATH, "utf-8");
  const lines = content.split("\n");

  const rows: {
    cedula: string;
    nombres: string;
    apellidos: string;
    gremioRaw: string;
    correo: string;
  }[] = [];
  for (const line of lines) {
    const row = parseRow(line);
    if (row && mapGremio(row.gremioRaw)) rows.push(row);
  }

  console.log(`Filas parseadas (solo Obrero/Obrera y Docente): ${rows.length}`);

  const existingUsers = await db.user.findMany({
    select: {
      name: true,
      primerNombre: true,
      primerApellido: true,
      email: true,
    },
  });

  const existingKeys = new Set<string>();
  for (const u of existingUsers) {
    existingKeys.add(normalizeForCompare(u.name));
    const short = [u.primerNombre, u.primerApellido].filter(Boolean).join(" ");
    if (short) existingKeys.add(normalizeForCompare(short));
  }
  const usedEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()));

  const toInsert: {
    cedula: string;
    primerNombre: string;
    segundoNombre: string | null;
    primerApellido: string;
    segundoApellido: string | null;
    name: string;
    email: string;
  }[] = [];

  for (const r of rows) {
    const { primerNombre, segundoNombre, primerApellido, segundoApellido, fullName } = nameToParts(
      r.nombres,
      r.apellidos
    );
    const keyFull = normalizeForCompare(fullName);
    const keyShort = normalizeForCompare(primerNombre + " " + primerApellido);

    if (existingKeys.has(keyFull) || existingKeys.has(keyShort)) continue;

    let email = "";
    const correoClean = r.correo.replace(/\s/g, "").toLowerCase();
    if (correoClean && correoClean.includes("@")) {
      email = correoClean;
    }
    if (!email) {
      email = buildFallbackEmail(primerNombre, primerApellido, r.cedula);
    }
    if (usedEmails.has(email)) {
      email = `${slugForEmail(primerNombre + primerApellido)}${r.cedula}@gmail.com`;
    }
    usedEmails.add(email);

    toInsert.push({
      cedula: r.cedula,
      primerNombre,
      segundoNombre: segundoNombre || null,
      primerApellido,
      segundoApellido: segundoApellido || null,
      name: fullName,
      email,
    });
  }

  console.log(`Personas a insertar (sin duplicados): ${toInsert.length}`);

  const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10);
  let inserted = 0;
  let errors = 0;

  for (const u of toInsert) {
    try {
      const institutional = isInstitutionalEmail(u.email);
      const user = await db.user.create({
        data: {
          email: u.email,
          name: u.name,
          emailVerified: institutional,
          role: UserRole.CLIENTE,
          cedula: u.cedula,
          primerNombre: u.primerNombre,
          segundoNombre: u.segundoNombre,
          primerApellido: u.primerApellido,
          segundoApellido: u.segundoApellido,
          requiresEmailChange: !institutional,
          requiresPasswordChange: true,
        },
        select: { id: true, email: true },
      });

      await db.account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: user.id,
          password: passwordHash,
        },
      });

      inserted++;
      if (inserted % 20 === 0) console.log(`  Insertados: ${inserted}`);
    } catch (e) {
      errors++;
      console.error(`Error insertando ${u.email}:`, e);
    }
  }

  console.log(
    `Listo. Insertados: ${inserted}, errores: ${errors}, omitidos (duplicados o no Obrero/Docente): ${rows.length - toInsert.length}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
