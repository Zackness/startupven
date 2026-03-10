import { Link } from "@/components/link";
import { notFound } from "next/navigation";
import { getProjectById, getProjectPackagesForAdmin } from "@/lib/actions/projects";
import { getClientsForAssignment } from "@/lib/actions/users";
import { getAdminServicePackages } from "@/lib/actions/admin-service-packages";
import { ADMIN_PATH } from "@/routes";
import { ProjectForm } from "../../project-form";
import { ProjectPortfolioSection } from "./_components/project-portfolio-section";
import { ProjectServicesSection } from "./_components/project-services-section";
import { ArrowLeft } from "lucide-react";

export default async function EditarProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, clients, projectPackages, catalogPackages] = await Promise.all([
    getProjectById(id),
    getClientsForAssignment(),
    getProjectPackagesForAdmin(id),
    getAdminServicePackages(),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <Link
          href={`${ADMIN_PATH}/proyectos`}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a proyectos
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Editar
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {project.titulo}
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Los cambios se reflejarán en la página pública /proyectos.
        </p>
      </section>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <ProjectForm
          mode="edit"
          projectId={id}
          clients={clients}
          initialData={{
            titulo: project.titulo,
            descripcion: project.descripcion,
            tipo: project.tipo,
            año: project.año,
            imagen: project.imagen,
            url: project.url,
            orden: project.orden,
            categorias: project.categorias,
            public: project.public,
            assignedUserIds: project.assignedUserIds ?? [],
          }}
        />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <ProjectServicesSection
          projectId={id}
          initialPackages={projectPackages}
          catalogPackages={catalogPackages.map((p) => ({ id: p.id, name: p.name, category: p.category }))}
        />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <ProjectPortfolioSection
          projectId={id}
          initialItems={project.portfolioItems ?? []}
          projectTitle={project.titulo}
        />
      </div>
    </div>
  );
}
