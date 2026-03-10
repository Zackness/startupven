import { BRAND_NAME } from "@/components/marca/brand";
import { Link } from "@/components/link";

export const metadata = {
  title: `Servicios | ${BRAND_NAME}`,
  description:
    "Plataformas SaaS, ventures digitales e infraestructura tecnológica a largo plazo. Complementos: marketing, diseño gráfico, redes sociales y branding.",
};

export default function ServiciosPage() {
  const services = [
    {
      title: "Plataformas SaaS",
      items: ["Sistemas corporativos", "Dashboards y paneles de control", "Portales de cliente", "APIs e integraciones"],
    },
    {
      title: "Ecosistemas y ventures digitales",
      items: ["Arquitectura de sistemas escalables", "Módulos integrados", "Infraestructura a largo plazo", "Ventures estructurados"],
    },
    {
      title: "Infraestructura y operación",
      items: ["Hosting y dominios", "Mantenimiento continuo", "Soporte técnico", "Un único punto de contacto"],
    },
  ];

  const extraServices = [
    {
      title: "Marketing",
      items: ["Estrategia de adquisición", "Mensajes y posicionamiento", "Campañas y optimización", "Analítica y reportes"],
    },
    {
      title: "Diseño gráfico",
      items: ["Identidad visual", "Piezas para campañas", "Creatividades para anuncios", "Sistemas y guías de marca"],
    },
    {
      title: "Manejo de redes sociales",
      items: ["Planificación y calendario", "Gestión de contenido", "Optimización por plataforma", "Seguimiento de métricas"],
    },
    {
      title: "Estrategias SEO",
      items: ["Estrategias SEO para blogs de clientes", "Palabras clave y temas", "Estructura y enlaces internos", "Seguimiento de posicionamiento"],
    },
    {
      title: "Branding",
      items: ["Naming y posicionamiento", "Diseño de logotipo", "Identidad de marca", "Manual y aplicaciones de marca"],
    },
  ];

  return (
    <div className="border-t border-[var(--border)] px-6 py-12 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Servicios
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Qué hacemos
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] text-[var(--muted-foreground)] leading-relaxed">
          Plataformas SaaS, ventures digitales e infraestructura tecnológica a largo plazo. Un único punto de contacto.
        </p>
        <div className="mt-12 space-y-6 sm:mt-14 sm:space-y-8">
          {services.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8"
            >
              <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
                {s.title}
              </h2>
              <ul className="mt-4 space-y-2 text-[15px] text-[var(--muted-foreground)] sm:mt-5">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[var(--foreground)]">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section id="complementarios" className="mt-14 sm:mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                Complementos
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                Servicios complementarios
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] text-[var(--muted-foreground)] leading-relaxed">
                Para potenciar tu presencia y crecimiento sobre la infraestructura digital: marketing, diseño, redes y branding.
              </p>
            </div>
            <Link
              href="/contacto"
              className="inline-flex w-fit items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Solicitar complemento →
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {extraServices.map((s) => (
              <div key={s.title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{s.title}</h3>
                <ul className="mt-4 space-y-2 text-[15px] text-[var(--muted-foreground)]">
                  {s.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-[var(--foreground)]">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}