import { BRAND_NAME } from "@/components/marca/brand";

export const metadata = {
  title: `Servicios | ${BRAND_NAME}`,
  description: "Plataformas SaaS, ventures digitales e infraestructura tecnológica a largo plazo.",
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
      </div>
    </div>
  );
}