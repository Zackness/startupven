import type { ProjectCategory } from "@/lib/project-categories";
import { PROJECT_CATEGORY_VALUES, PROJECT_CATEGORY_LABELS } from "@/lib/project-categories";

export type ServicePackageId = string;

export interface ServicePackage {
  id: ServicePackageId;
  name: string;
  price: number;
  category: ProjectCategory;
  description?: string;
}

/** 3 paquetes por categoría con precios. IDs estables para persistir en onboarding. */
const PACKAGES_BY_CATEGORY: Record<ProjectCategory, ServicePackage[]> = {
  LAUNCH: [
    { id: "LAUNCH_BASICO", name: "Launch Básico", price: 199, category: "LAUNCH", description: "Página inicial con IA y arquitectura definida." },
    { id: "LAUNCH_PRO", name: "Launch Pro", price: 399, category: "LAUNCH", description: "Validación de idea + presencia digital + soporte." },
    { id: "LAUNCH_PREMIUM", name: "Launch Premium", price: 699, category: "LAUNCH", description: "Todo en Pro + branding y contenido inicial." },
  ],
  BUILD: [
    { id: "BUILD_BASICO", name: "Build Básico", price: 299, category: "BUILD", description: "Editor visual y CMS esencial." },
    { id: "BUILD_PRO", name: "Build Pro", price: 599, category: "BUILD", description: "CMS + ecommerce y plantillas avanzadas." },
    { id: "BUILD_PREMIUM", name: "Build Premium", price: 999, category: "BUILD", description: "Todo en Pro + integraciones y formación." },
  ],
  WEB: [
    { id: "WEB_BASICO", name: "Scale Web Básico", price: 499, category: "WEB", description: "Sitio web a medida, hasta 5 páginas." },
    { id: "WEB_PRO", name: "Scale Web Pro", price: 999, category: "WEB", description: "Web completa con CMS y formularios." },
    { id: "WEB_PREMIUM", name: "Scale Web Premium", price: 1999, category: "WEB", description: "Desarrollo a medida, SEO y mantenimiento 3 meses." },
  ],
  MARKETING: [
    { id: "MARKETING_BASICO", name: "Marketing Básico", price: 249, category: "MARKETING", description: "Estrategia y plan de canales." },
    { id: "MARKETING_PRO", name: "Marketing Pro", price: 549, category: "MARKETING", description: "Campañas, analítica y optimización." },
    { id: "MARKETING_PREMIUM", name: "Marketing Premium", price: 999, category: "MARKETING", description: "Todo en Pro + gestión de ads y reportes." },
  ],
  REDES_SOCIALES: [
    { id: "REDES_BASICO", name: "Redes Básico", price: 199, category: "REDES_SOCIALES", description: "Gestión de 2 redes y contenido mensual." },
    { id: "REDES_PRO", name: "Redes Pro", price: 449, category: "REDES_SOCIALES", description: "Hasta 4 redes, calendario y community." },
    { id: "REDES_PREMIUM", name: "Redes Premium", price: 799, category: "REDES_SOCIALES", description: "Todas las redes, creativos y métricas." },
  ],
  BRANDING: [
    { id: "BRANDING_BASICO", name: "Branding Básico", price: 349, category: "BRANDING", description: "Naming y logotipo." },
    { id: "BRANDING_PRO", name: "Branding Pro", price: 699, category: "BRANDING", description: "Identidad visual y papelería básica." },
    { id: "BRANDING_PREMIUM", name: "Branding Premium", price: 1299, category: "BRANDING", description: "Guía de marca completa y aplicaciones." },
  ],
};

/** Lista plana de todos los paquetes. */
export const ALL_SERVICE_PACKAGES: ServicePackage[] = PROJECT_CATEGORY_VALUES.flatMap(
  (cat) => PACKAGES_BY_CATEGORY[cat]
);

/** Paquetes de una o más categorías. Acepta "SCALE" como WEB. */
export function getPackagesByCategories(categories: string[]): ServicePackage[] {
  const set = new Set<string>(categories);
  if (set.has("SCALE")) set.add("WEB");
  const list = Array.from(set).filter((c): c is ProjectCategory =>
    PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory)
  );
  return list.flatMap((cat) => PACKAGES_BY_CATEGORY[cat]);
}

/** Obtiene un paquete por ID. */
export function getPackageById(id: string | null | undefined): ServicePackage | null {
  if (!id) return null;
  return ALL_SERVICE_PACKAGES.find((p) => p.id === id) ?? null;
}

/** Etiqueta de categoría para mostrar junto al paquete. */
export function getCategoryLabel(category: ProjectCategory): string {
  return PROJECT_CATEGORY_LABELS[category];
}

/** Total en USD de una lista de IDs de paquetes (ignora IDs no encontrados). */
export function getTotalFromPackageIds(ids: string[]): number {
  return ids.reduce((sum, id) => {
    const pkg = getPackageById(id);
    return sum + (pkg ? pkg.price : 0);
  }, 0);
}

/** Lista de paquetes a partir de IDs (solo los que existan). */
export function getPackagesFromIds(ids: string[]): ServicePackage[] {
  return ids.map(getPackageById).filter((p): p is ServicePackage => p != null);
}
