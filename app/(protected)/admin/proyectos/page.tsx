import { Link } from "@/components/link";
import { getProjectsFiltered } from "@/lib/actions/projects";
import { PROJECT_CATEGORY_VALUES, PROJECT_CATEGORY_LABELS, getProjectCategoryLabel } from "@/lib/project-categories";
import { ADMIN_PATH, ESCRITORIO_PROYECTO_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, ExternalLink, Briefcase } from "lucide-react";
import { DeleteProjectButton } from "./delete-project-button";

export default async function AdminProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q, categoria } = await searchParams;
  const projects = await getProjectsFiltered(q ?? null, categoria ?? null);
  const hasFilters = !!(q?.trim() || categoria?.trim());

  return (
    <div className="space-y-12 sm:space-y-14">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Portafolio
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Proyectos
          </h1>
          <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
            Los proyectos que crees aquí se muestran en la página pública /proyectos. Orden define el destacado en inicio.
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-[var(--primary-foreground)] hover:opacity-90">
          <Link href={`${ADMIN_PATH}/proyectos/nueva`}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo proyecto
          </Link>
        </Button>
      </section>

      <section>
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Buscar y filtrar
        </p>
        <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
          <form action={`${ADMIN_PATH}/proyectos`} method="GET" className="flex flex-wrap items-end gap-3">
            <label htmlFor="proyectos-q" className="sr-only">
              Buscar por título, descripción o tipo
            </label>
            <input
              id="proyectos-q"
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por título, descripción o tipo..."
              className="min-w-[200px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <label htmlFor="proyectos-categoria" className="sr-only">
              Categoría
            </label>
            <select
              id="proyectos-categoria"
              name="categoria"
              defaultValue={categoria ?? ""}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">Todas las categorías</option>
              {PROJECT_CATEGORY_VALUES.map((val) => (
                <option key={val} value={val}>
                  {PROJECT_CATEGORY_LABELS[val]}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary" size="sm" className="border-[var(--border)]">
              Buscar
            </Button>
            {hasFilters && (
              <Link
                href={`${ADMIN_PATH}/proyectos`}
                className="flex items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                Limpiar
              </Link>
            )}
          </form>
        </div>

        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Listado
        </p>
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <p className="text-[15px] text-[var(--muted-foreground)]">
              {hasFilters ? "No hay proyectos que coincidan con el filtro." : "No hay proyectos. Crea uno para que aparezca en la web."}
            </p>
            {hasFilters ? (
              <Button asChild variant="outline" className="mt-4 border-[var(--border)]">
                <Link href={`${ADMIN_PATH}/proyectos`}>Quitar filtros</Link>
              </Button>
            ) : (
              <Button asChild className="mt-4">
                <Link href={`${ADMIN_PATH}/proyectos/nueva`}>Crear proyecto</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
                      {p.tipo}
                    </span>
                    {p.categorias?.length ? (
                      p.categorias.map((c) => (
                        <span
                          key={c}
                          className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--foreground)]"
                        >
                          {getProjectCategoryLabel(c)}
                        </span>
                      ))
                    ) : null}
                    <span className="text-xs text-[var(--muted-foreground)]">{p.año}</span>
                    {p.orden < 3 && (
                      <span className="text-xs text-[var(--muted-foreground)]">· Orden {p.orden}</span>
                    )}
                    {p.public ? (
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Público
                      </span>
                    ) : (
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        Privado
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 font-semibold text-[var(--foreground)]">{p.titulo}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                    {p.descripcion}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" className="gap-1.5 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
                    <Link href={`${ESCRITORIO_PROYECTO_PATH}/${p.id}`}>
                      <Briefcase className="h-3.5 w-3.5" />
                      Trabajar
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="border-[var(--border)]">
                    <Link href={`/proyectos`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      Ver web
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="border-[var(--border)]">
                    <Link href={`${ADMIN_PATH}/proyectos/${p.id}/editar`}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Editar
                    </Link>
                  </Button>
                  <DeleteProjectButton projectId={p.id} projectTitle={p.titulo} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
