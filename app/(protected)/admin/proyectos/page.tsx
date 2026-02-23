import Link from "next/link";
import { getProjects } from "@/lib/actions/projects";
import { ADMIN_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { DeleteProjectButton } from "./delete-project-button";

export default async function AdminProyectosPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-12 sm:space-y-14">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Portafolio web
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
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Listado
        </p>
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <p className="text-[15px] text-[var(--muted-foreground)]">
              No hay proyectos. Crea uno para que aparezca en la web.
            </p>
            <Button asChild className="mt-4">
              <Link href={`${ADMIN_PATH}/proyectos/nueva`}>Crear proyecto</Link>
            </Button>
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
                    <span className="text-xs text-[var(--muted-foreground)]">{p.año}</span>
                    {p.orden < 3 && (
                      <span className="text-xs text-[var(--muted-foreground)]">· Orden {p.orden}</span>
                    )}
                  </div>
                  <h2 className="mt-1 font-semibold text-[var(--foreground)]">{p.titulo}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                    {p.descripcion}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
