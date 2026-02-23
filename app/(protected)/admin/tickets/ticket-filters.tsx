"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const DEBOUNCE_MS = 450;

export type TicketFilterUser = {
  id: string;
  label: string;
  email: string;
};

export type TicketFilterType = {
  id: string;
  name: string;
};

export function TicketFilters(props: {
  users: TicketFilterUser[];
  types: TicketFilterType[];
  initial: { tipo?: string; usuario?: string; fecha?: string; cedula?: string };
}) {
  const { users, types } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userOpen, setUserOpen] = React.useState(false);

  const tipo = searchParams.get("tipo") ?? props.initial.tipo ?? "";
  const usuario = searchParams.get("usuario") ?? props.initial.usuario ?? "";
  const fecha = searchParams.get("fecha") ?? props.initial.fecha ?? "";

  const initialCedula = searchParams.get("cedula") ?? props.initial.cedula ?? "";
  const [cedula, setCedula] = React.useState(initialCedula);

  React.useEffect(() => {
    setCedula(initialCedula);
  }, [initialCedula]);

  const selectedUser = React.useMemo(
    () => (usuario ? users.find((u) => u.id === usuario) : undefined),
    [usuario, users]
  );

  function pushParams(next: URLSearchParams) {
    // al cambiar filtros, reiniciar paginación
    next.set("page", "0");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function setOrClearParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    pushParams(next);
  }

  function clearFilters() {
    setCedula("");
    const next = new URLSearchParams(searchParams.toString());
    next.delete("tipo");
    next.delete("usuario");
    next.delete("fecha");
    next.delete("cedula");
    next.set("page", "0");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const cedulaRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyCedula = React.useCallback(
    (value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set("cedula", value);
      else next.delete("cedula");
      next.set("page", "0");
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCedula(value);
    if (cedulaRef.current) clearTimeout(cedulaRef.current);
    cedulaRef.current = setTimeout(() => applyCedula(value), DEBOUNCE_MS);
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Tipo (comida)</label>
          <select
            value={tipo}
            onChange={(e) => setOrClearParam("tipo", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <option value="">Todos</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Usuario</label>
          <Popover open={userOpen} onOpenChange={setUserOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={userOpen}
                className="w-full justify-between border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                <span className="truncate text-left">
                  {selectedUser ? selectedUser.label : "Todos"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar usuario..." />
                <CommandList>
                  <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="__all__"
                      onSelect={() => {
                        setOrClearParam("usuario", "");
                        setUserOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", !usuario ? "opacity-100" : "opacity-0")} />
                      Todos
                    </CommandItem>
                    {users.map((u) => (
                      <CommandItem
                        key={u.id}
                        value={`${u.label} ${u.email}`}
                        onSelect={() => {
                          setOrClearParam("usuario", u.id);
                          setUserOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", usuario === u.id ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col">
                          <span className="text-sm">{u.label}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">{u.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Fecha menú</label>
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setOrClearParam("fecha", e.target.value)}
            className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Cédula</label>
          <Input
            value={cedula}
            onChange={handleCedulaChange}
            placeholder="Ej. V-12345678"
            className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="border-[var(--border)] text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}

