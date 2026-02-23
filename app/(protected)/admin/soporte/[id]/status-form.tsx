"use client";

import { useTransition } from "react";
import { updateSupportTicketStatus } from "@/lib/actions/support-tickets";

const STATUS_OPTIONS = [
  { value: "ABIERTO", label: "Abierto" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "ESPERANDO_CLIENTE", label: "En espera del cliente" },
  { value: "RESUELTO", label: "Resuelto" },
  { value: "CERRADO", label: "Cerrado" },
] as const;

export function StatusForm({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form className="shrink-0">
      <label htmlFor="status" className="sr-only">
        Estado
      </label>
      <select
        id="status"
        name="status"
        defaultValue={currentStatus}
        disabled={isPending}
        onChange={(e) => {
          const status = e.target.value;
          startTransition(() => {
            updateSupportTicketStatus(ticketId, status);
          });
        }}
        className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
