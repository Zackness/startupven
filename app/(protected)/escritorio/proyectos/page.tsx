import { getEscritorioData } from "@/lib/actions/escritorio";
import { getAllServicePackagesFromDb } from "@/lib/actions/service-packages-db";
import { getProjectCategoryLabel } from "@/lib/project-categories";
import { ProyectosPageClient } from "./_components/proyectos-page-client";

export default async function ProyectosPage() {
  const [data, catalogPackages] = await Promise.all([
    getEscritorioData(),
    getAllServicePackagesFromDb(),
  ]);
  const { projects } = data;
  const catalog = catalogPackages.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description,
  }));

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Proyectos
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Proyectos que registraste en el onboarding o creaste desde aquí. Los servicios se asignan al crear el proyecto y no son transferibles.
        </p>
        <ProyectosPageClient catalogPackages={catalog} />
      </section>

      <section className="space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <p className="text-[15px] text-[var(--muted-foreground)]">
              No hay proyectos registrados. Crea uno con el botón de arriba o completa el onboarding para ver tus proyectos aquí.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {projects.map((proyecto) => (
              <li
                key={proyecto.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-[var(--foreground)]">
                      {proyecto.titulo}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {proyecto.tipo}
                      {proyecto.año ? ` · ${proyecto.año}` : ""}
                    </p>
                    {proyecto.descripcion ? (
                      <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {proyecto.descripcion}
                      </p>
                    ) : null}
                    {proyecto.categorias && proyecto.categorias.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {proyecto.categorias.map((cat) => (
                          <span
                            key={cat}
                            className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]"
                          >
                            {getProjectCategoryLabel(cat)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
