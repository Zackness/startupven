"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ServicePackage } from "@/lib/service-packages";
import { getCategoryLabel } from "@/lib/service-packages";
import { Check } from "lucide-react";

export function PackagesCards({
  packages,
  selectedIds,
  onSelectionChange,
  disabled,
  /** Si se pasa, solo los paquetes con id en este array se pueden seleccionar. El resto se muestran en gris con "No adquirido". */
  selectableIds,
  /** Si es true, solo se puede tener un servicio seleccionado por categoría (ej. Launch Básico o Launch Pro, no ambos). */
  maxOnePerCategory = false,
}: {
  packages: ServicePackage[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
  selectableIds?: string[];
  maxOnePerCategory?: boolean;
}) {
  const selectedSet = new Set(selectedIds);
  const selectableSet = selectableIds ? new Set(selectableIds) : null;

  function toggle(id: string) {
    if (disabled) return;
    if (selectableSet && !selectableSet.has(id)) return;
    if (selectedSet.has(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      if (maxOnePerCategory) {
        const newPkg = packages.find((p) => p.id === id);
        const category = newPkg?.category;
        const withoutSameCategory =
          category != null
            ? selectedIds.filter((pid) => {
                const p = packages.find((x) => x.id === pid);
                return p?.category !== category;
              })
            : selectedIds;
        onSelectionChange([...withoutSameCategory, id]);
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    }
  }

  if (packages.length === 0) {
    return (
      <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
        Elige al menos una categoría arriba para ver los paquetes disponibles.
      </p>
    );
  }

  const itemContent = (pkg: (typeof packages)[number]) => {
    const isSelected = selectedSet.has(pkg.id);
    const isSelectable = !selectableSet || selectableSet.has(pkg.id);
    return { isSelected, isSelectable };
  };

  return (
    <>
      {/* Móvil: lista compacta */}
      <div className="flex flex-col gap-2 md:hidden">
        {packages.map((pkg) => {
          const { isSelected, isSelectable } = itemContent(pkg);
          return (
            <div
              key={pkg.id}
              role="button"
              tabIndex={isSelectable ? 0 : -1}
              aria-pressed={isSelected}
              aria-disabled={!isSelectable}
              aria-label={`${pkg.name}, USD ${pkg.price}. ${isSelectable ? (isSelected ? "Seleccionado" : "Seleccionar") : "No adquirido"}`}
              onClick={() => toggle(pkg.id)}
              onKeyDown={(e) => {
                if (!isSelectable) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(pkg.id);
                }
              }}
              className={cn(
                "flex flex-wrap items-center gap-2 rounded-xl border px-3 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
                isSelectable && !disabled && "cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/30",
                (disabled || !isSelectable) && "pointer-events-none opacity-60",
                !isSelectable && "opacity-75",
                isSelected ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)] bg-[var(--card)]"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--foreground)]">{pkg.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {getCategoryLabel(pkg.category)} · USD {pkg.price}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  isSelected ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)]"
                )}
              >
                {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
            </div>
          );
        })}
      </div>

      {/* Desktop: tarjetas en grid */}
      <div className="hidden grid-cols-1 gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const isSelected = selectedSet.has(pkg.id);
          const isSelectable = !selectableSet || selectableSet.has(pkg.id);
          return (
            <Card
              key={pkg.id}
              role="button"
              tabIndex={isSelectable ? 0 : -1}
              aria-pressed={isSelected}
              aria-disabled={!isSelectable}
              aria-label={`${pkg.name}, USD ${pkg.price}. ${isSelectable ? (isSelected ? "Seleccionado" : "Seleccionar") : "No adquirido"}`}
              onClick={() => toggle(pkg.id)}
              onKeyDown={(e) => {
                if (!isSelectable) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(pkg.id);
                }
              }}
              className={cn(
                "transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
                isSelectable && !disabled && "cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/30",
                (disabled || !isSelectable) && "pointer-events-none opacity-60",
                !isSelectable && "opacity-75",
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-md"
                  : "border-[var(--border)] bg-[var(--card)]"
              )}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  {getCategoryLabel(pkg.category)}
                </span>
                <span className="flex items-center gap-1.5">
                  {!isSelectable && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      No adquirido
                    </span>
                  )}
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                      isSelected ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)]"
                    )}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                  </span>
                </span>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                <h3 className="font-semibold leading-tight text-[var(--foreground)]">{pkg.name}</h3>
                <p className="text-lg font-bold text-[var(--primary)]">USD {pkg.price}</p>
                {pkg.description && (
                  <p className="text-sm leading-snug text-[var(--muted-foreground)]">{pkg.description}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
