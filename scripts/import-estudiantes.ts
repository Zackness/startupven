/**
 * Importación masiva de estudiantes desde estudiantes_matricula_20252.md
 *
 * - No inserta duplicados: omite quienes coincidan por nombre completo o nombre + apellido.
 * - Email: nombreapellido@gmail.com (normalizado; si repite, se agrega expediente).
 * - Contraseña: 123456
 * - Rol: CLIENTE, Gremio: ESTUDIANTIL
 *
 * Ejecutar: npx tsx scripts/import-estudiantes.ts
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { UserRole, Gremio } from "../lib/generated/prisma/enums";

const MD_PATH = join(process.cwd(), "estudiantes_matricula_20252.md");
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

function parseRow(line: string): { cedula: string; expediente: string; nombres: string; apellidos: string } | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  const cells = trimmed.split("|").map((c) => c.trim());
  if (cells.length < 5) return null;
  const cedula = cells[1];
  const expediente = cells[2];
  const nombres = cells[3];
  const apellidos = cells[4];
  if (!cedula || !nombres || !apellidos) return null;
  if (!/^\d+$/.test(cedula.replace(/\s/g, ""))) return null;
  return {
    cedula: cedula.replace(/\s/g, ""),
    expediente: expediente || "",
    nombres: nombres.trim(),
    apellidos: apellidos.trim(),
  };
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

function buildEmail(primerNombre: string, primerApellido: string, expediente: string): string {
  const base = slugForEmail(primerNombre + primerApellido);
  if (!base) return `estudiante${expediente.replace(/-/g, "")}@gmail.com`;
  return `${base}@gmail.com`;
}

async function main() {
  const content = readFileSync(MD_PATH, "utf-8");
  const lines = content.split("\n");

  const rows: { cedula: string; expediente: string; nombres: string; apellidos: string }[] = [];
  for (const line of lines) {
    const row = parseRow(line);
    if (row) rows.push(row);
  }

  console.log(`Filas parseadas: ${rows.length}`);

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
    expediente: string;
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

    if (existingKeys.has(keyFull) || existingKeys.has(keyShort)) {
      continue;
    }

    let email = buildEmail(primerNombre, primerApellido, r.expediente);
    if (usedEmails.has(email.toLowerCase())) {
      const suf = slugForEmail(r.expediente) || r.cedula;
      email = `${slugForEmail(primerNombre + primerApellido)}${suf}@gmail.com`;
    }
    usedEmails.add(email.toLowerCase());

    toInsert.push({
      cedula: r.cedula,
      expediente: r.expediente,
      primerNombre,
      segundoNombre: segundoNombre || null,
      primerApellido,
      segundoApellido: segundoApellido || null,
      name: fullName,
      email: email.toLowerCase(),
    });
  }

  console.log(`Estudiantes a insertar (sin duplicados): ${toInsert.length}`);

  const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10);
  let inserted = 0;
  let errors = 0;

  for (const u of toInsert) {
    try {
      const user = await db.user.create({
        data: {
          email: u.email,
          name: u.name,
          emailVerified: true,
          role: UserRole.CLIENTE,
          gremio: Gremio.ESTUDIANTIL,
          cedula: u.cedula,
          expediente: u.expediente,
          primerNombre: u.primerNombre,
          segundoNombre: u.segundoNombre,
          primerApellido: u.primerApellido,
          segundoApellido: u.segundoApellido,
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
      if (inserted % 50 === 0) console.log(`  Insertados: ${inserted}`);
    } catch (e) {
      errors++;
      console.error(`Error insertando ${u.email}:`, e);
    }
  }

  console.log(`Listo. Insertados: ${inserted}, errores: ${errors}, omitidos (duplicados): ${rows.length - toInsert.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
