import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ADMIN_PATH, ESCRITORIO_PROYECTO_PATH } from "@/routes";
import { CalendarDays, Pencil, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function EscritorioProyectoPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role ?? null;
  if (role !== "EDITOR" && role !== "ADMIN") redirect("/escritorio");

  const { projectId } = await params;
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, titulo: true, descripcion: true },
  });
  if (!project) redirect(`${ADMIN_PATH}/proyectos`);

  const basePath = `${ESCRITORIO_PROYECTO_PATH}/${projectId}`;

  return (
    <div className="space-y-14 sm:space-y-16">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Trabajar en {project.titulo}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
          Puntos a trabajar y cronograma de contenido de este proyecto.
        </p>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Accesos rápidos
        </p>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <Link
            href={`${basePath}/calendario-editorial`}
            className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <CalendarDays className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                Cronograma de contenido
              </p>
              <p className="mt-2 text-[15px] text-[var(--foreground)]">
                Calendario editorial de este proyecto: publicaciones y programación RRSS.
              </p>
            </div>
          </Link>

          <Link
            href={`${ADMIN_PATH}/proyectos/${projectId}/editar`}
            className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <Pencil className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                Editar proyecto
              </p>
              <p className="mt-2 text-[15px] text-[var(--foreground)]">
                Cambiar título, descripción, clientes asignados e ítems del portafolio.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
