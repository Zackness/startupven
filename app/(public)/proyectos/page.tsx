import Link from "next/link";
import { BRAND_NAME } from "@/components/marca/brand";
import { proyectos } from "@/data/proyectos";
import { ProyectoCard } from "@/components/proyecto-card";

export const metadata = {
  title: `Proyectos | ${BRAND_NAME}`,
  description:
    "Sistemas y plataformas en producción. Infraestructura digital que hemos diseñado y construido.",
};

export default function ProyectosPage() {
  const [destacado, ...resto] = proyectos;

  return (
    <div className="min-h-screen">
      {/* Hero de la página */}
      <section className="border-b border-[var(--border)] px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
            Proyectos
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl">
            Sistemas en producción
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--muted-foreground)] leading-relaxed">
            Plataformas y sistemas que hemos diseñado y construido. Infraestructura digital operativa.
          </p>
        </div>
      </section>

      {/* Proyecto destacado (el primero, más grande) */}
      {destacado && (
        <section className="border-b border-[var(--border)] px-4 py-14 sm:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
              Destacado
            </p>
            <div className="rounded-md border border-[var(--border)] bg-[var(--card)] transition-colors hover:border-[var(--foreground)]/15">
              <Link href="/contacto" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-md">
                <div className="grid overflow-hidden rounded-md sm:grid-cols-2">
                  <div className="relative h-52 min-h-[12rem] bg-[var(--muted)] sm:h-64">
                    {destacado.imagen ? (
                      <img
                        src={destacado.imagen}
                        alt={destacado.titulo}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[var(--muted)]" />
                    )}
                    <div className="absolute left-4 top-4 flex gap-1.5">
                      <span className="rounded bg-[var(--background)]/95 px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
                        {destacado.tipo}
                      </span>
                      <span className="rounded bg-[var(--background)]/95 px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                        {destacado.año}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-[var(--card-foreground)] sm:text-2xl">
                      {destacado.titulo}
                    </h2>
                    <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {destacado.descripcion}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-[var(--primary)]">
                      Contactar →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Grid del resto de proyectos */}
      <section className="px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          {resto.length > 0 && (
            <>
              <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
                Más proyectos
              </h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {resto.map((proyecto) => (
                  <ProyectoCard key={proyecto.id} proyecto={proyecto} variant="grid" />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-[var(--border)] bg-[var(--primary)] px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-bold tracking-tight text-[var(--primary-foreground)] sm:text-2xl">
            Iniciar conversación
          </h2>
          <p className="mt-3 text-[var(--primary-foreground)]/90">
            Para definir alcance, plazos y condiciones.
          </p>
          <Link
            href="/contacto"
            className="mt-6 inline-block rounded-md border border-[var(--primary-foreground)] bg-[var(--primary-foreground)] px-5 py-2.5 text-sm font-medium text-[var(--primary)] transition-colors hover:opacity-90"
          >
            Contactar
          </Link>
        </div>
      </section>
    </div>
  );
}
