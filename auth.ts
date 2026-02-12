import { betterAuth } from "better-auth";
import { verifyPassword as authVerifyPassword } from "better-auth/crypto";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

function isBcryptHash(hash: string) {
  return hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$");
}

/**
 * Better Auth (reemplazo de Auth.js/NextAuth).
 *
 * Variables de entorno recomendadas:
 * - BETTER_AUTH_URL (ej: http://localhost:3000)
 * - BETTER_AUTH_SECRET (en prod es obligatorio)
 * - DATABASE_URL (MySQL)
 */
export const auth = betterAuth({
  plugins: [nextCookies()],
  database: prismaAdapter(db, { provider: "mysql" }),
  // Sesiones más largas (sliding sessions): se renuevan mientras el usuario use la app.
  // Unidades en segundos.
  session: {
    // 30 días
    expiresIn: 60 * 60 * 24 * 30,
    // Renovar expiración como mínimo cada 24h de uso
    updateAge: 60 * 60 * 24,
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "CLIENTE",
        input: false,
      },
      gremio: {
        type: "string",
        required: false,
        input: false,
      },
      cedula: {
        type: "string",
        required: false,
        input: false,
      },
      expediente: {
        type: "string",
        required: false,
        input: false,
      },
      primerNombre: {
        type: "string",
        required: false,
        input: false,
      },
      segundoNombre: {
        type: "string",
        required: false,
        input: false,
      },
      primerApellido: {
        type: "string",
        required: false,
        input: false,
      },
      segundoApellido: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // Bcrypt: admin y createAdminUser. Scrypt: usuarios creados con el flujo normal de Better Auth.
    password: {
      hash: async (password) => bcrypt.hash(password, 10),
      verify: async ({ hash, password }) => {
        if (isBcryptHash(hash)) return bcrypt.compare(password, hash);
        return authVerifyPassword({ hash, password });
      },
    },
  },
});

