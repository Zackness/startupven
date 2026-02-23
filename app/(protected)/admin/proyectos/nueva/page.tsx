import Link from "next/link";
import { ADMIN_PATH } from "@/routes";
import { ProjectForm } from "../project-form";
import { ArrowLeft } from "lucide-react";

export default function NuevaProyectoPage() {
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
          Nuevo
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Crear proyecto
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          El proyecto aparecerá en la página pública /proyectos. Puedes subir una imagen por URL.
        </p>
      </section>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <ProjectForm mode="create" />
      </div>
    </div>
  );
}
