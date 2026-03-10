"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ServicePackage } from "@/lib/service-packages";
import { getCategoryLabel } from "@/lib/service-packages";

export function PackagesCombobox({
  packages,
  selectedIds,
  onSelectionChange,
  disabled,
}: {
  packages: ServicePackage[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredPackages = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.trim().toLowerCase();
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        getCategoryLabel(p.category).toLowerCase().includes(q)
    );
  }, [packages, search]);

  const selectedPackages = useMemo(
    () => packages.filter((p) => selectedSet.has(p.id)),
    [packages, selectedSet]
  );

  function toggle(id: string) {
    const next = selectedSet.has(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id];
    onSelectionChange(next);
  }

  function remove(id: string) {
    onSelectionChange(selectedIds.filter((i) => i !== id));
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || packages.length === 0}
            className="w-full justify-between rounded-lg border-[var(--border)] bg-[var(--background)] font-normal"
          >
            <span className="truncate text-[var(--muted-foreground)]">
              {packages.length === 0
                ? "Elige al menos una categoría arriba para ver paquetes"
                : selectedIds.length === 0
                  ? "Seleccionar paquetes a contratar…"
                  : `${selectedIds.length} paquete${selectedIds.length === 1 ? "" : "s"} seleccionado${selectedIds.length === 1 ? "" : "s"}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[320px] overflow-hidden rounded-xl border-[var(--border)] bg-[var(--popover)] p-0" align="start">
          <Command className="rounded-lg border-0" shouldFilter={false}>
            <CommandInput
              placeholder="Buscar paquete o categoría…"
              value={search}
              onValueChange={setSearch}
              className="border-0 focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>Ningún paquete coincide.</CommandEmpty>
              <CommandGroup>
                {filteredPackages.map((pkg) => {
                  const isSelected = selectedSet.has(pkg.id);
                  return (
                    <CommandItem
                      key={pkg.id}
                      value={pkg.id}
                      onSelect={() => toggle(pkg.id)}
                      className="cursor-pointer"
                    >
                      <span
                        className={cn(
                          "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          isSelected ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)]"
                        )}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="font-medium text-[var(--foreground)]">{pkg.name}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {getCategoryLabel(pkg.category)} · USD {pkg.price}
                          {pkg.description ? ` · ${pkg.description}` : ""}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedPackages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPackages.map((pkg) => (
            <span
              key={pkg.id}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--muted)]/30 pl-2.5 pr-1 py-1 text-sm"
            >
              <span className="max-w-[200px] truncate text-[var(--foreground)]">
                {pkg.name} — USD {pkg.price}
              </span>
              <button
                type="button"
                onClick={() => remove(pkg.id)}
                className="rounded-full p-0.5 hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                aria-label={`Quitar ${pkg.name}`}
              >
                <X className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
