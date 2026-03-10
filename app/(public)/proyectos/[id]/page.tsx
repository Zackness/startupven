import { Link } from "@/components/link";
import { notFound } from "next/navigation";
import { getProjectByIdForPublic } from "@/lib/actions/projects";
import { BRAND_NAME } from "@/components/marca/brand";
import { ProyectoPreviewIframe } from "@/components/proyecto-preview-iframe";
import { PortfolioItemRenderer } from "@/components/portfolio/portfolio-item-renderer";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectByIdForPublic(id);
  if (!project) return { title: "Proyecto no encontrado" };
  return {
    title: `${project.titulo} | Proyectos | ${BRAND_NAME}`,
    description: project.descripcion.slice(0, 160),
  };
}

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectByIdForPublic(id);
  if (!project) notFound();

  return (
    <div className="min-h-screen">
      <section className="border-b border-[var(--border)] px-6 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/proyectos"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a proyectos
          </Link>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            {project.tipo} · {project.año}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl">
            {project.titulo}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)]">
            {project.descripcion}
          </p>
        </div>
      </section>

      {(project.imagen || project.url) && (
        <section className="border-b border-[var(--border)] px-6 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Vista previa
            </p>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)]">
              {project.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.imagen}
                  alt={project.titulo}
                  className="h-full w-full object-cover"
                />
              ) : project.url ? (
                <ProyectoPreviewIframe
                  url={project.url}
                  title={project.titulo}
                  className="absolute inset-0 h-full w-full"
                />
              ) : null}
            </div>
          </div>
        </section>
      )}

      {project.portfolioItems && project.portfolioItems.length > 0 && (
        <section className="px-6 py-12 sm:px-8 sm:py-14">
          <div className="mx-auto max-w-5xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Portafolio
            </p>
            <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
              Fotos y diseños
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Contenido de redes sociales, Behance e imágenes del proyecto.
            </p>
            <div className="mt-8 grid gap-8 sm:grid-cols-1 lg:gap-10">
              {project.portfolioItems.map((item) => (
                <PortfolioItemRenderer key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-[var(--border)] bg-[var(--muted)]/30 px-6 py-10 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] sm:text-xl">
            ¿Te gustaría algo similar?
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Cuéntanos tu proyecto y te respondemos con alcance y condiciones.
          </p>
          <Link
            href="/contacto"
            className="mt-6 inline-block rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
          >
            Contactar
          </Link>
        </div>
      </section>
    </div>
  );
}
