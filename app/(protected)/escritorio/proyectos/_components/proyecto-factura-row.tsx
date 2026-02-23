"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProyectoFactura, EstadoPago } from "../../_components/escritorio-types";

const ESTADO_LABEL: Record<EstadoPago, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  vencido: "Vencido",
  parcial: "Pago parcial",
};

const ESTADO_CLASS: Record<EstadoPago, string> = {
  pendiente: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  pagado: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  vencido: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  parcial: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
};

interface ProyectoFacturaRowProps {
  proyecto: ProyectoFactura;
}

export function ProyectoFacturaRow({ proyecto }: ProyectoFacturaRowProps) {
  const [open, setOpen] = useState(false);
  const moneda = proyecto.moneda ?? "USD";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden transition-shadow hover:shadow-sm">
      {/* Fila principal: click expande */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-5 p-5 sm:p-6 text-left hover:bg-[var(--muted)]/40 transition-colors"
      >
        <span className="text-[var(--muted-foreground)]">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[var(--foreground)] truncate">{proyecto.nombre}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{proyecto.referencia}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded px-2 py-0.5 text-xs font-medium",
            ESTADO_CLASS[proyecto.estado]
          )}
        >
          {ESTADO_LABEL[proyecto.estado]}
        </span>
        <span className="shrink-0 text-right font-semibold tabular-nums text-[var(--foreground)]">
          {moneda} {proyecto.total.toLocaleString()}
        </span>
      </button>

      {/* Detalle tipo factura (expandido) */}
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--muted)]/30">
          <div className="p-5 sm:p-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Detalle de la factura
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-2 text-left font-medium text-[var(--muted-foreground)]">Concepto</th>
                  <th className="pb-2 text-right font-medium text-[var(--muted-foreground)]">Cant.</th>
                  <th className="pb-2 text-right font-medium text-[var(--muted-foreground)]">Monto</th>
                </tr>
              </thead>
              <tbody>
                {proyecto.lineas.map((linea) => (
                  <tr key={linea.id} className="border-b border-[var(--border)]/50">
                    <td className="py-2">
                      <span className="text-[var(--foreground)]">{linea.concepto}</span>
                      {linea.detalle && (
                        <span className="block text-xs text-[var(--muted-foreground)]">{linea.detalle}</span>
                      )}
                    </td>
                    <td className="py-2 text-right tabular-nums text-[var(--foreground)]">
                      {linea.cantidad ?? 1}
                    </td>
                    <td className="py-2 text-right tabular-nums text-[var(--foreground)]">
                      {moneda} {linea.monto.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex justify-end gap-4 border-t border-[var(--border)] pt-3">
              <span className="text-sm text-[var(--muted-foreground)]">Total</span>
              <span className="font-semibold tabular-nums text-[var(--foreground)]">
                {moneda} {proyecto.total.toLocaleString()}
              </span>
            </div>
            {(proyecto.estado === "pendiente" || proyecto.estado === "parcial" || proyecto.estado === "vencido") && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" className="bg-[var(--primary)] text-[var(--primary-foreground)]">
                  Pagar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
