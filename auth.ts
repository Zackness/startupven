import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

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
  },
});

