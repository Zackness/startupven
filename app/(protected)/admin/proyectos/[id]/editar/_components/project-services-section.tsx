"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  assignServiceToProjectAdmin,
  setServiceSuspendedAdmin,
  cancelServiceAdmin,
  removeServiceFromProjectAdmin,
} from "@/lib/actions/admin-project-packages";
import type { ProjectPackageForAdmin } from "@/lib/actions/projects";
import { getProjectCategoryLabel } from "@/lib/project-categories";
import { toast } from "sonner";
import { Plus, Pause, Play, Ban, Trash2 } from "lucide-react";

type CatalogItem = { id: string; name: string; category: string };

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-VE", { dateStyle: "medium" });
}

export function ProjectServicesSection({
  projectId,
  initialPackages,
  catalogPackages,
}: {
  projectId: string;
  initialPackages: ProjectPackageForAdmin[];
  catalogPackages: CatalogItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const assignedIds = new Set(initialPackages.map((p) => p.packageId));
  const availableToAdd = catalogPackages.filter((c) => !assignedIds.has(c.id));

  function handleAdd(packageId: string) {
    if (!packageId) return;
    startTransition(async () => {
      try {
        await assignServiceToProjectAdmin(projectId, packageId);
        toast.success("Servicio asignado al proyecto.");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al asignar.");
      }
    });
  }

  function handleSuspend(projectPackageId: string, suspended: boolean) {
    startTransition(async () => {
      try {
        await setServiceSuspendedAdmin(projectPackageId, suspended);
        toast.success(suspended ? "Servicio suspendido." : "Servicio reactivado.");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error.");
      }
    });
  }

  function handleCancel(projectPackageId: string) {
    if (!confirm("¿Cancelar este servicio? No se renovará.")) return;
    startTransition(async () => {
      try {
        await cancelServiceAdmin(projectPackageId);
        toast.success("Servicio cancelado.");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error.");
      }
    });
  }

  function handleRemove(projectPackageId: string, packageName: string) {
    if (!confirm(`¿Quitar "${packageName}" del proyecto? Se elimina la asignación.`)) return;
    startTransition(async () => {
      try {
        await removeServiceFromProjectAdmin(projectPackageId);
        toast.success("Servicio quitado del proyecto.");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Servicios del proyecto</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Asigna paquetes del catálogo, suspende o cancela servicios ya asignados.
        </p>
      </div>

      {/* Añadir servicio */}
      {availableToAdd.length > 0 && (
        <form
          className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/10 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const select = form.querySelector<HTMLSelectElement>("select[name=addPackageId]");
            const id = select?.value?.trim();
            if (id) handleAdd(id);
          }}
        >
          <label className="flex flex-1 min-w-[200px] flex-col gap-1">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">Añadir servicio</span>
            <select
              name="addPackageId"
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="">Elegir paquete…</option>
              {availableToAdd.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({getProjectCategoryLabel(p.category)})
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" size="sm" disabled={pending} className="shrink-0 bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Plus className="mr-1.5 h-4 w-4" />
            Asignar
          </Button>
        </form>
      )}

      {initialPackages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] py-8 text-center text-sm text-[var(--muted-foreground)]">
          No hay servicios asignados a este proyecto. Añade uno desde el selector anterior.
        </p>
      ) : (
        <ul className="space-y-3">
          {initialPackages.map((pkg) => {
            const isCanceled = !!pkg.cancelledAt;
            const isSuspended = pkg.suspended && !isCanceled;
            return (
              <li
                key={pkg.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--foreground)]">{pkg.packageName}</span>
                    <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
                      {getProjectCategoryLabel(pkg.category)}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">USD {pkg.price}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0 text-xs text-[var(--muted-foreground)]">
                    <span>Finaliza: {formatDate(pkg.endsAt)}</span>
                    {isCanceled && <span className="text-red-600 dark:text-red-400">Cancelado {formatDate(pkg.cancelledAt)}</span>}
                    {isSuspended && <span className="text-amber-600 dark:text-amber-400">Suspendido</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {!isCanceled && (
                    <>
                      {isSuspended ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-[var(--border)]"
                          disabled={pending}
                          onClick={() => handleSuspend(pkg.id, false)}
                        >
                          <Play className="mr-1 h-3.5 w-3.5" />
                          Reactivar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-[var(--border)]"
                          disabled={pending}
                          onClick={() => handleSuspend(pkg.id, true)}
                        >
                          <Pause className="mr-1 h-3.5 w-3.5" />
                          Suspender
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
                        disabled={pending}
                        onClick={() => handleCancel(pkg.id)}
                      >
                        <Ban className="mr-1 h-3.5 w-3.5" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                    disabled={pending}
                    onClick={() => handleRemove(pkg.id, pkg.packageName)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Quitar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
