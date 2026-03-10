import { getServiciosData } from "@/lib/actions/escritorio";
import { ServiciosFilter } from "./_components/servicios-filter";
import { ServiciosList } from "./_components/servicios-list";

type Props = { searchParams: Promise<{ projectId?: string }> };

export default async function ServiciosPage(props: Props) {
  const searchParams = await props.searchParams;
  const rawProjectId = searchParams.projectId?.trim() ?? null;
  const projectIdFilter = rawProjectId === "all" || rawProjectId === "" ? null : rawProjectId;

  const { projects, servicios } = await getServiciosData(projectIdFilter);

  // Por defecto: un solo proyecto → ese; varios → el primero (última selección se puede guardar en URL).
  if (projects.length >= 1 && projectIdFilter === null) {
    const defaultId = projects[0].id;
    const { redirect } = await import("next/navigation");
    redirect(`/escritorio/servicios?projectId=${encodeURIComponent(defaultId)}`);
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Servicios
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Servicios asignados a tus proyectos. Filtra por proyecto para ver los de ese proyecto. Puedes suspender o reactivar.
        </p>
        <div className="mt-6">
          <ServiciosFilter projects={projects} projectIdFilter={projectIdFilter} />
        </div>
      </section>

      <section>
        {servicios.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <p className="text-[15px] text-[var(--muted-foreground)]">
              No tienes servicios registrados. Completa el onboarding para ver tus paquetes aquí.
            </p>
          </div>
        ) : (
          <ServiciosList
            servicios={servicios}
            projects={projects}
            projectIdFilter={projectIdFilter}
          />
        )}
      </section>
    </div>
  );
}
