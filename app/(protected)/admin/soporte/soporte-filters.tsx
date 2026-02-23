"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Link } from "@/components/link";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "ABIERTO", label: "Abierto" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "ESPERANDO_CLIENTE", label: "En espera del cliente" },
  { value: "RESUELTO", label: "Resuelto" },
  { value: "CERRADO", label: "Cerrado" },
];

export function SoporteFilters({
  status,
  search,
}: {
  status?: string;
  search?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function applyFilters(next: URLSearchParams) {
    const q = next.toString();
    startTransition(() => {
      router.push(q ? `/admin/soporte?${q}` : "/admin/soporte");
    });
  }

  return (
    <form
      className="flex flex-wrap items-end gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const next = new URLSearchParams();
        const s = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value;
        const q = (form.querySelector('[name="search"]') as HTMLInputElement)?.value?.trim();
        if (s) next.set("status", s);
        if (q) next.set("search", q);
        applyFilters(next);
      }}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <label htmlFor="soporte-status" className="block text-xs font-medium text-[var(--muted-foreground)]">
          Estado
        </label>
        <select
          id="soporte-status"
          name="status"
          defaultValue={status ?? ""}
          disabled={isPending}
          onChange={(e) => {
            const next = new URLSearchParams(searchParams.toString());
            const v = e.target.value;
            if (v) next.set("status", v);
            else next.delete("status");
            applyFilters(next);
          }}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50 sm:w-auto"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-0 flex-1 space-y-1 sm:min-w-[200px]">
        <label htmlFor="soporte-search" className="block text-xs font-medium text-[var(--muted-foreground)]">
          Buscar (asunto, nombre, email)
        </label>
        <input
          id="soporte-search"
          name="search"
          type="search"
          defaultValue={search ?? ""}
          placeholder="Buscar..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          Filtrar
        </button>
        {(status || search) && (
          <Link
            href="/admin/soporte"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            Limpiar
          </Link>
        )}
      </div>
    </form>
  );
}
