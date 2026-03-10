/** Categorías de proyecto: 3 servicios principales (Launch, Build constructor, Scale web) y el resto. */
export const PROJECT_CATEGORY_VALUES = [
  "LAUNCH",
  "BUILD",
  "WEB",
  "MARKETING",
  "REDES_SOCIALES",
  "BRANDING",
] as const;
export const PROJECT_CATEGORY_LABELS: Record<(typeof PROJECT_CATEGORY_VALUES)[number], string> = {
  LAUNCH: "Launch (IA)",
  BUILD: "Build (constructor)",
  WEB: "Scale (web)",
  MARKETING: "Marketing",
  REDES_SOCIALES: "Redes sociales",
  BRANDING: "Branding",
};

/** Descripciones cortas para mostrar en onboarding (y donde haga falta). */
export const PROJECT_CATEGORY_DESCRIPTIONS: Record<(typeof PROJECT_CATEGORY_VALUES)[number], string> = {
  LAUNCH: "Validar ideas y arrancar presencia digital con IA. Página inicial con arquitectura definida.",
  BUILD: "Editor visual, CMS y ecommerce. Más control y autonomía dentro de la plataforma.",
  WEB: "Sitio web o presencia web a medida. Desarrollo web estándar.",
  MARKETING: "Estrategia de adquisición, campañas, analítica y posicionamiento.",
  REDES_SOCIALES: "Gestión de redes, contenido y comunidad.",
  BRANDING: "Naming, identidad visual, logotipo y guías de marca.",
};

/** Obtiene la etiqueta de una categoría; acepta "SCALE" legacy y lo muestra como Scale (web). */
export function getProjectCategoryLabel(value: string | null | undefined): string {
  if (!value) return "";
  if (value === "SCALE") return "Scale (web)";
  return PROJECT_CATEGORY_LABELS[value as (typeof PROJECT_CATEGORY_VALUES)[number]] ?? value;
}

export type ProjectCategory = (typeof PROJECT_CATEGORY_VALUES)[number];
