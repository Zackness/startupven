import { BRAND_NAME } from "@/components/marca/brand";

export const metadata = {
  title: "Configuración | STVN",
  description: "Configuración de la plataforma y la marca.",
};

export default function AdminConfiguracionPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || BRAND_NAME;
  const siteDescription =
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Infraestructura digital. Construimos ecosistemas escalables.";

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Ajustes
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Configuración
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Identidad y datos expuestos en la web pública. Los valores críticos se gestionan por entorno.
        </p>
      </section>

      <section>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Marca y sitio
          </h2>
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                Nombre del sitio
              </dt>
              <dd className="mt-1 text-[var(--foreground)]">{siteName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                Descripción / tagline
              </dt>
              <dd className="mt-1 text-[var(--muted-foreground)]">{siteDescription}</dd>
            </div>
          </dl>
          <p className="mt-6 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted-foreground)]">
            Para cambiar estos valores, edita las variables de entorno{" "}
            <code className="rounded bg-[var(--muted)] px-1.5 py-0.5">NEXT_PUBLIC_SITE_NAME</code> y{" "}
            <code className="rounded bg-[var(--muted)] px-1.5 py-0.5">NEXT_PUBLIC_SITE_DESCRIPTION</code> en el servidor.
          </p>
        </div>
      </section>
    </div>
  );
}
