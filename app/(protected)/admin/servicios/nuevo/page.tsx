import { Link } from "@/components/link";
import { ADMIN_PATH } from "@/routes";
import { ServicePackageForm } from "../servicio-form";
import { ArrowLeft } from "lucide-react";

export default function NuevoServicioPage() {
  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <Link
          href={`${ADMIN_PATH}/servicios`}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a servicios
        </Link>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Nuevo
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Crear paquete de servicio
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
          El paquete aparecerá en el onboarding y en el escritorio según categoría.
        </p>
      </section>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <ServicePackageForm mode="create" />
      </div>
    </div>
  );
}
