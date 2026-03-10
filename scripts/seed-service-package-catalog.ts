/**
 * Inserta el catálogo inicial de paquetes en ServicePackageCatalog desde los datos estáticos.
 * Ejecutar una vez: npx tsx scripts/seed-service-package-catalog.ts
 */
import "dotenv/config";
import { db } from "../lib/db";

type Row = { id: string; name: string; price: number; category: string; description: string | null };

const PACKAGES: Row[] = [
  { id: "LAUNCH_BASICO", name: "Launch Básico", price: 199, category: "LAUNCH", description: "Página inicial con IA y arquitectura definida." },
  { id: "LAUNCH_PRO", name: "Launch Pro", price: 399, category: "LAUNCH", description: "Validación de idea + presencia digital + soporte." },
  { id: "LAUNCH_PREMIUM", name: "Launch Premium", price: 699, category: "LAUNCH", description: "Todo en Pro + branding y contenido inicial." },
  { id: "BUILD_BASICO", name: "Build Básico", price: 299, category: "BUILD", description: "Editor visual y CMS esencial." },
  { id: "BUILD_PRO", name: "Build Pro", price: 599, category: "BUILD", description: "CMS + ecommerce y plantillas avanzadas." },
  { id: "BUILD_PREMIUM", name: "Build Premium", price: 999, category: "BUILD", description: "Todo en Pro + integraciones y formación." },
  { id: "WEB_BASICO", name: "Scale Web Básico", price: 499, category: "WEB", description: "Sitio web a medida, hasta 5 páginas." },
  { id: "WEB_PRO", name: "Scale Web Pro", price: 999, category: "WEB", description: "Web completa con CMS y formularios." },
  { id: "WEB_PREMIUM", name: "Scale Web Premium", price: 1999, category: "WEB", description: "Desarrollo a medida, SEO y mantenimiento 3 meses." },
  { id: "MARKETING_BASICO", name: "Marketing Básico", price: 249, category: "MARKETING", description: "Estrategia y plan de canales." },
  { id: "MARKETING_PRO", name: "Marketing Pro", price: 549, category: "MARKETING", description: "Campañas, analítica y optimización." },
  { id: "MARKETING_PREMIUM", name: "Marketing Premium", price: 999, category: "MARKETING", description: "Todo en Pro + gestión de ads y reportes." },
  { id: "REDES_BASICO", name: "Redes Básico", price: 199, category: "REDES_SOCIALES", description: "Gestión de 2 redes y contenido mensual." },
  { id: "REDES_PRO", name: "Redes Pro", price: 449, category: "REDES_SOCIALES", description: "Hasta 4 redes, calendario y community." },
  { id: "REDES_PREMIUM", name: "Redes Premium", price: 799, category: "REDES_SOCIALES", description: "Todas las redes, creativos y métricas." },
  { id: "BRANDING_BASICO", name: "Branding Básico", price: 349, category: "BRANDING", description: "Naming y logotipo." },
  { id: "BRANDING_PRO", name: "Branding Pro", price: 699, category: "BRANDING", description: "Identidad visual y papelería básica." },
  { id: "BRANDING_PREMIUM", name: "Branding Premium", price: 1299, category: "BRANDING", description: "Guía de marca completa y aplicaciones." },
  // Paquetes de servidores (asociados a Scale). Mínimo 25 USD.
  { id: "SERVER_MINIMO", name: "Servidor Básico (incluido en Scale)", price: 25, category: "SERVIDORES", description: "Servidor gestionado básico para proyectos Scale." },
  { id: "SERVER_PRO", name: "Servidor Pro", price: 50, category: "SERVIDORES", description: "Mayor capacidad y recursos para Scale." },
  { id: "SERVER_PREMIUM", name: "Servidor Premium", price: 100, category: "SERVIDORES", description: "Infraestructura avanzada y alta disponibilidad para Scale." },
];

async function main() {
  const existing = await db.servicePackageCatalog.count();
  if (existing > 0) {
    console.log(`Ya existen ${existing} paquetes en el catálogo. Para rellenar desde cero, borra la tabla y vuelve a ejecutar.`);
    return;
  }
  for (let i = 0; i < PACKAGES.length; i++) {
    const p = PACKAGES[i];
    await db.servicePackageCatalog.create({
      data: {
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        orden: i + 1,
      },
    });
  }
  console.log(`Insertados ${PACKAGES.length} paquetes en ServicePackageCatalog.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
