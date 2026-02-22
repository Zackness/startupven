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
    <div className="border-t border-[var(--border)] px-4 py-20 sm:px-6 md:py-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Servicios
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--muted-foreground)] leading-relaxed">
          Construimos plataformas SaaS, estructuramos ventures digitales y desarrollamos infraestructura tecnológica a largo plazo. Un único punto de contacto.
        </p>
        <div className="mt-14 space-y-6">
          {services.map((s) => (
            <section key={s.title} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-lg font-semibold text-[var(--card-foreground)]">{s.title}</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--muted-foreground)]">
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}