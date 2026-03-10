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
import { PROJECT_CATEGORY_VALUES, PROJECT_CATEGORY_LABELS, type ProjectCategory } from "@/lib/project-categories";

export function CategoriesCombobox({
  selectedIds,
  onSelectionChange,
  disabled,
}: {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return PROJECT_CATEGORY_VALUES;
    const q = search.trim().toLowerCase();
    return PROJECT_CATEGORY_VALUES.filter(
      (val) =>
        val.toLowerCase().includes(q) ||
        PROJECT_CATEGORY_LABELS[val].toLowerCase().includes(q)
    );
  }, [search]);

  function toggle(val: ProjectCategory) {
    const has = selectedSet.has(val);
    if (has) {
      const next = selectedIds.filter((id) => id !== val);
      if (next.length === 0) return;
      onSelectionChange(next);
    } else {
      onSelectionChange([...selectedIds, val]);
    }
  }

  function remove(val: string) {
    const next = selectedIds.filter((id) => id !== val);
    if (next.length === 0) return;
    onSelectionChange(next);
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
            disabled={disabled}
            className="w-full justify-between rounded-lg border-[var(--border)] bg-[var(--background)] font-normal"
          >
            <span className="truncate text-[var(--muted-foreground)]">
              {selectedIds.length === 0
                ? "Seleccionar categorías…"
                : `${selectedIds.length} categoría${selectedIds.length === 1 ? "" : "s"} seleccionada${selectedIds.length === 1 ? "" : "s"}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-xl border-[var(--border)] bg-[var(--popover)] p-0" align="start">
          <Command className="rounded-lg border-0" shouldFilter={false}>
            <CommandInput
              placeholder="Buscar categoría…"
              value={search}
              onValueChange={setSearch}
              className="border-0 focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>Ninguna categoría coincide.</CommandEmpty>
              <CommandGroup>
                {filteredCategories.map((val) => {
                  const isSelected = selectedSet.has(val);
                  return (
                    <CommandItem
                      key={val}
                      value={val}
                      onSelect={() => toggle(val)}
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
                      <span className="font-medium text-[var(--foreground)]">{PROJECT_CATEGORY_LABELS[val]}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--muted)]/30 pl-2.5 pr-1 py-1 text-sm"
            >
              <span className="truncate max-w-[180px] text-[var(--foreground)]">
                {PROJECT_CATEGORY_LABELS[id as ProjectCategory] ?? id}
              </span>
              <button
                type="button"
                onClick={() => remove(id)}
                className="rounded-full p-0.5 hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                aria-label={`Quitar ${PROJECT_CATEGORY_LABELS[id as ProjectCategory]}`}
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
