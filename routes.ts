/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */

export const publicRoutes = [
    "/",
    "/contacto",
    "/nosotros",
    "/promociones",
    "/servicios",
    "/division-medica",
    "/division-ambiental",
    "/division-utilitaria",
    "/unidades-especiales",  // Patrones dinámicos
    "/proyectos",
    "/clientes",
    "/unidades-especiales/division-ambiental",
    "/unidades-especiales/division-medica",
    "/unidades-especiales/division-utilitaria",
    "/blog",
    "/blog/.*",      // Patrones dinámicos
    "/politica-de-privacidad",
    "/terminos-de-servicio",
    "/cookies",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /escritorio
 * @type {string[]}
 */
export const authRoutes = [
    "/login",
    "/error",
    "/reset",
    "/new-password",
    "/escritorio-2",
    "/escritorio-2/comprar",
    "/escritorio-2/mis-tickets",
];

/**
 * The prefix for API authentication routes
 * Routes that star with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * Ruta del escritorio del cliente (usuario común logueado)
 */
export const ESCRITORIO_PATH = "/escritorio";

/**
 * Ruta del panel de administración (solo ADMIN)
 */
export const ADMIN_PATH = "/admin";

/**
 * Ruta del panel de vendedor (VENDEDOR y ADMIN)
 */
export const VENDEDOR_PATH = "/vendedor";

/**
 * Ruta del panel de editor (EDITOR y ADMIN)
 */
export const EDITOR_PATH = "/editor";

/**
 * Redirección por defecto tras login (usuario sin rol ADMIN)
 */
export const DEFAULT_LOGIN_REDIRECT = ESCRITORIO_PATH;

/** Ruta obligatoria para usuarios con correo/contraseña temporales */
export const ACTUALIZAR_CREDENCIALES_PATH = "/actualizar-credenciales";

/**
 * Rutas que requieren rol ADMIN (solo estas prefijan /admin)
 */
export const adminRoutesPrefix = ADMIN_PATH; // "/admin"

/**
 * Rutas que requieren rol VENDEDOR (y ADMIN)
 */
export const vendorRoutesPrefix = VENDEDOR_PATH; // "/vendedor"

/**
 * Rutas que requieren rol EDITOR (y ADMIN)
 */
export const editorRoutesPrefix = EDITOR_PATH; // "/editor"

/**
 * Rutas protegidas del cliente (cualquier usuario logueado)
 */
export const protectedClientPrefix = ESCRITORIO_PATH; // "/escritorio"

/**
 * Determina la redirección tras login según el rol
 */
export function getLoginRedirect(role?: string | null): string {
  if (role === "ADMIN") return ADMIN_PATH;
  if (role === "VENDEDOR") return VENDEDOR_PATH;
  if (role === "EDITOR") return EDITOR_PATH;
  return ESCRITORIO_PATH;
}

/** Enums de Prisma: única fuente de verdad para roles y gremios */
import { UserRole, Gremio } from "@/lib/generated/prisma/enums";

/** Roles: CLIENTE, VENDEDOR, EDITOR, ADMIN */
export const USER_ROLES = Object.values(UserRole);

/** Gremios: ESTUDIANTIL, OBRERO, PROFESORES */
export const USER_GREMIOS = Object.values(Gremio);

export type { UserRole, Gremio };