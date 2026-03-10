import { getAdminServicePackages } from "@/lib/actions/admin-service-packages";
import { Link } from "@/components/link";
import { ADMIN_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { getProjectCategoryLabel } from "@/lib/project-categories";
import { DeleteServicePackageButton } from "./delete-service-package-button";

export default async function AdminServiciosPage() {
  const packages = await getAdminServicePackages();

  return (
    <div className="space-y-12 sm:space-y-14">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Catálogo
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Servicios y paquetes
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
            Gestiona el catálogo de paquetes por servicio. Se usan en onboarding y escritorio.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Link href={`${ADMIN_PATH}/servicios/nuevo`}>
            <Plus className="mr-2 h-4 w-4" />
            Crear paquete
          </Link>
        </Button>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Listado
        </p>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">ID</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Nombre</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Precio (USD)</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Categoría</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Descripción</th>
                  <th className="w-[160px] px-4 py-3 font-semibold text-[var(--foreground)]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="transition-colors hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">{pkg.id}</td>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">{pkg.name}</td>
                    <td className="px-4 py-3 text-[var(--foreground)]">{pkg.price}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
                        {getProjectCategoryLabel(pkg.category)}
                      </span>
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-[var(--muted-foreground)]">
                      {pkg.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`${ADMIN_PATH}/servicios/${encodeURIComponent(pkg.id)}/editar`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Editar
                          </Button>
                        </Link>
                        <DeleteServicePackageButton packageId={pkg.id} packageName={pkg.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {packages.length === 0 && (
            <p className="px-4 py-12 text-center text-[var(--muted-foreground)]">
              No hay paquetes en el catálogo. Crea uno para que aparezca en onboarding y escritorio.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
