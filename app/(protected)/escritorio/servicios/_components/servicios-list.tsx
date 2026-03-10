"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCategoryLabel } from "@/lib/service-packages";
import type { ProjectCategory } from "@/lib/project-categories";
import type { ServicioConProyecto, ServicioEstado } from "@/lib/actions/escritorio";
import { ServicioDetalleDialog } from "./servicio-detalle-dialog";

const STATUS_LABEL: Record<ServicioEstado, string> = {
  ACTIVO: "Activo",
  SUSPENDIDO: "Suspendido",
  CANCELADO: "Cancelado",
  VENCIDO: "Vencido",
  POR_RENOVAR: "Por renovar",
};

const STATUS_CLASS: Record<ServicioEstado, string> = {
  ACTIVO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  SUSPENDIDO: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  CANCELADO: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  VENCIDO: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  POR_RENOVAR: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-VE", { dateStyle: "short" });
}

type Project = { id: string; titulo: string };

export function ServiciosList({
  servicios,
  projectIdFilter,
}: {
  servicios: ServicioConProyecto[];
  projects: Project[];
  projectIdFilter: string | null;
}) {
  const router = useRouter();
  const [detalleServicio, setDetalleServicio] = useState<ServicioConProyecto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openDetalle(s: ServicioConProyecto) {
    setDetalleServicio(s);
    setDialogOpen(true);
  }

  const inProject = projectIdFilter
    ? servicios.filter((s) => s.projectId === projectIdFilter)
    : servicios;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
          {projectIdFilter ? "Servicios de este proyecto" : "Todos tus servicios"}
        </h3>
        <ul className="rounded-2xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden">
          {inProject.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
              {projectIdFilter ? "Este proyecto no tiene servicios asignados." : "No tienes servicios asignados a proyectos."}
            </li>
          ) : (
            inProject.map((s) => (
              <li key={s.projectPackageId} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[var(--foreground)]">{s.name}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {getCategoryLabel(s.category as ProjectCategory)} · USD {s.price.toFixed(2)}
                    {!projectIdFilter && s.projectTitulo ? ` · ${s.projectTitulo}` : ""}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Adquirido: {formatDate(s.createdAt)} · Finaliza: {formatDate(s.endsAt)}
                    {s.cancelledAt && ` · Cancelado: ${formatDate(s.cancelledAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openDetalle(s)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                  >
                    Ver detalles
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <ServicioDetalleDialog
        servicio={detalleServicio}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
