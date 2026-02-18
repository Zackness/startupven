/**
 * Dominios de correo institucional UNEXPO.
 * Quienes tienen estos correos no deben verse obligados a cambiar email, solo contraseña si aplica.
 */
const INSTITUTIONAL_DOMAINS = ["@unexpo.edu.ve", "@unexpo.com.ve"] as const;

export function isInstitutionalEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const lower = email.trim().toLowerCase();
  return INSTITUTIONAL_DOMAINS.some((d) => lower.endsWith(d));
}
