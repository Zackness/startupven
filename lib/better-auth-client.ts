import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /**
   * Si defines NEXT_PUBLIC_BETTER_AUTH_URL, úsalo (útil en multi-dominio).
   * Si no, Better Auth funciona con baseURL relativo.
   */
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "",
});

