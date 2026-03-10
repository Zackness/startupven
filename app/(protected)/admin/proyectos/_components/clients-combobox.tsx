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

type Client = { id: string; name: string; email: string };

export function ClientsCombobox({
  clients,
  initialSelectedIds = [],
  disabled,
}: {
  clients: Client[];
  initialSelectedIds?: string[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialSelectedIds));
  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.trim().toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const selectedClients = useMemo(
    () => clients.filter((c) => selectedIds.has(c.id)),
    [clients, selectedIds]
  );

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function remove(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {/* Hidden inputs para el form: un input por cada id seleccionado */}
      {Array.from(selectedIds).map((id) => (
        <input key={id} type="hidden" name="assignedUserIds" value={id} readOnly />
      ))}

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
              {selectedIds.size === 0
                ? "Buscar y seleccionar clientes…"
                : `${selectedIds.size} cliente${selectedIds.size === 1 ? "" : "s"} seleccionado${selectedIds.size === 1 ? "" : "s"}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] rounded-xl border-[var(--border)] bg-[var(--popover)] p-0" align="start">
          <Command className="rounded-lg border-0" shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por nombre o email…"
              value={search}
              onValueChange={setSearch}
              className="border-0 focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>Ningún cliente coincide.</CommandEmpty>
              <CommandGroup>
                {filteredClients.map((client) => {
                  const isSelected = selectedIds.has(client.id);
                  return (
                    <CommandItem
                      key={client.id}
                      value={client.id}
                      onSelect={() => toggle(client.id)}
                      className="cursor-pointer"
                    >
                      <span
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded border",
                          isSelected ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)]"
                        )}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium text-[var(--foreground)]">{client.name}</span>
                        <span className="truncate text-xs text-[var(--muted-foreground)]">{client.email}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Chips de clientes seleccionados */}
      {selectedClients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedClients.map((client) => (
            <span
              key={client.id}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--muted)]/30 pl-2.5 pr-1 py-1 text-sm"
            >
              <span className="truncate max-w-[180px] text-[var(--foreground)]">{client.name}</span>
              <button
                type="button"
                onClick={() => remove(client.id)}
                className="rounded-full p-0.5 hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                aria-label={`Quitar ${client.name}`}
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
