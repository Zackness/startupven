"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCategoryLabel } from "@/lib/service-packages";
import type { ProjectCategory } from "@/lib/project-categories";
import type { ServicioConProyecto, ServicioEstado } from "@/lib/actions/escritorio";
import { setServiceSuspended, cancelService } from "@/lib/actions/escritorio";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ESCRITORIO_PAGOS_PATH } from "@/routes";

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
  return new Date(d).toLocaleDateString("es-VE", { dateStyle: "medium" });
}

type Props = {
  servicio: ServicioConProyecto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function ServicioDetalleDialog({ servicio, open, onOpenChange, onSuccess }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSuspend(suspended: boolean) {
    if (!servicio) return;
    setLoading("suspend");
    try {
      await setServiceSuspended(servicio.projectPackageId, suspended);
      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    if (!servicio) return;
    setLoading("cancel");
    try {
      await cancelService(servicio.projectPackageId);
      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (!servicio) return null;

  const showRenovar = servicio.status === "VENCIDO" || servicio.status === "POR_RENOVAR";
  const showCancelar = servicio.status !== "CANCELADO";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[var(--foreground)]">{servicio.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[servicio.status]}`}
            >
              {STATUS_LABEL[servicio.status]}
            </span>
            <span className="text-[var(--muted-foreground)]">
              {getCategoryLabel(servicio.category as ProjectCategory)}
            </span>
          </div>
          {servicio.status === "POR_RENOVAR" && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Falta poco para que finalice este servicio. Renueva para continuar.
            </p>
          )}

          <dl className="grid gap-2">
            <div>
              <dt className="text-[var(--muted-foreground)]">Proyecto</dt>
              <dd className="font-medium text-[var(--foreground)]">{servicio.projectTitulo}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">Duración</dt>
              <dd>{servicio.durationMonths} {servicio.durationMonths === 1 ? "mes" : "meses"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">Adquirido el</dt>
              <dd>{formatDate(servicio.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">Finaliza el</dt>
              <dd>{formatDate(servicio.endsAt)}</dd>
            </div>
            {servicio.cancelledAt && (
              <div>
                <dt className="text-[var(--muted-foreground)]">Cancelado el</dt>
                <dd>{formatDate(servicio.cancelledAt)}</dd>
              </div>
            )}
          </dl>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
              Desglose del gasto
            </p>
            <p className="text-[var(--foreground)]">
              {servicio.description || "Sin descripción."}
            </p>
            <p className="mt-2 font-semibold text-[var(--foreground)]">
              USD {servicio.price.toFixed(2)}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          {servicio.status !== "CANCELADO" && servicio.status !== "SUSPENDIDO" && (
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => handleSuspend(true)}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] disabled:opacity-50"
            >
              Suspender
            </button>
          )}
          {servicio.status === "SUSPENDIDO" && (
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => handleSuspend(false)}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] disabled:opacity-50"
            >
              Reactivar
            </button>
          )}
          {showRenovar && (
            <Link
              href={ESCRITORIO_PAGOS_PATH}
              className="rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-medium text-center"
            >
              Pagar / Renovar
            </Link>
          )}
          {showCancelar && (
            <button
              type="button"
              disabled={loading !== null}
              onClick={handleCancel}
              className="rounded-lg bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading === "cancel" ? "Cancelando…" : "Cancelar servicio"}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
