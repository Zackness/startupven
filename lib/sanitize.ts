/**
 * Sanitización de inputs para evitar XSS, caracteres de control y datos malformados.
 * Todas las entradas de usuario deben pasar por estas funciones antes de guardar o mostrar.
 */

const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;
const MULTIPLE_SPACES = /\s{2,}/g;

/** Elimina caracteres de control y normaliza espacios internos a uno solo. */
function removeControlAndNormalizeSpaces(value: string): string {
  return value.replace(CONTROL_CHARS, "").replace(MULTIPLE_SPACES, " ").trim();
}

/** Longitudes máximas por tipo de campo (alineadas con DB y uso razonable). */
export const MAX_LENGTHS = {
  namePart: 64,
  cedula: 24,
  telefono: 32,
  nameFull: 256,
} as const;

/**
 * Sanitiza un texto genérico: trim, sin caracteres de control, longitud máxima.
 * No permite HTML; para mostrar en HTML hay que escapar en el punto de render.
 */
export function sanitizeText(
  value: string | null | undefined,
  maxLength: number = 500
): string {
  if (value == null || typeof value !== "string") return "";
  const normalized = removeControlAndNormalizeSpaces(value);
  return normalized.slice(0, maxLength);
}

/**
 * Sanitiza un nombre (primer/segundo nombre, apellidos).
 * Permite letras (incl. acentos), espacios, guiones y apóstrofes.
 */
export function sanitizeNamePart(
  value: string | null | undefined,
  maxLength: number = MAX_LENGTHS.namePart
): string {
  if (value == null || typeof value !== "string") return "";
  const normalized = removeControlAndNormalizeSpaces(value);
  const allowed = normalized.replace(/[^\p{L}\p{M}\s\-']/gu, "");
  return allowed.slice(0, maxLength);
}

/**
 * Sanitiza nombre completo (una sola cadena): mismo criterio que namePart pero mayor longitud.
 */
export function sanitizeFullName(
  value: string | null | undefined,
  maxLength: number = MAX_LENGTHS.nameFull
): string {
  if (value == null || typeof value !== "string") return "";
  const normalized = removeControlAndNormalizeSpaces(value);
  const allowed = normalized.replace(/[^\p{L}\p{M}\s\-']/gu, "");
  return allowed.slice(0, maxLength);
}

/**
 * Sanitiza cédula: solo dígitos y opcionalmente una letra al final (ej. algunos formatos).
 * Longitud máxima 24.
 */
export function sanitizeCedula(
  value: string | null | undefined,
  maxLength: number = MAX_LENGTHS.cedula
): string {
  if (value == null || typeof value !== "string") return "";
  const trimmed = value.trim().replace(CONTROL_CHARS, "");
  const alphanumeric = trimmed.replace(/[^0-9A-Za-z]/g, "");
  return alphanumeric.slice(0, maxLength);
}

/**
 * Sanitiza teléfono: dígitos, espacios, +, -, (), y longitud máxima.
 */
export function sanitizeTelefono(
  value: string | null | undefined,
  maxLength: number = MAX_LENGTHS.telefono
): string {
  if (value == null || typeof value !== "string") return "";
  const trimmed = value.trim().replace(CONTROL_CHARS, "");
  const allowed = trimmed.replace(/[^0-9+\-\s()]/g, "");
  return allowed.slice(0, maxLength);
}

/**
 * Sanitiza email: trim, caracteres de control, longitud razonable.
 * No valida formato completo (eso es para zod/validación); solo limpia.
 */
export function sanitizeEmail(
  value: string | null | undefined,
  maxLength: number = 255
): string {
  if (value == null || typeof value !== "string") return "";
  const trimmed = value.trim().replace(CONTROL_CHARS, "");
  return trimmed.slice(0, maxLength).toLowerCase();
}

/**
 * Aplica sanitización a un objeto de onboarding (nombres, cédula, teléfono).
 * Devuelve un objeto listo para guardar en BD.
 */
export function sanitizeOnboardingInput(data: {
  primerNombre?: string | null;
  segundoNombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  cedula?: string | null;
  telefono?: string | null;
}): {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  cedula: string;
  telefono: string;
  name: string;
} {
  const primerNombre = sanitizeNamePart(data.primerNombre);
  const segundoNombre = sanitizeNamePart(data.segundoNombre);
  const primerApellido = sanitizeNamePart(data.primerApellido);
  const segundoApellido = sanitizeNamePart(data.segundoApellido);
  const cedula = sanitizeCedula(data.cedula);
  const telefono = sanitizeTelefono(data.telefono);
  const name =
    [primerNombre, segundoNombre, primerApellido, segundoApellido].filter(Boolean).join(" ") ||
    "";
  return {
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    cedula,
    telefono,
    name,
  };
}
