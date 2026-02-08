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
  initial: { tipo?: string; usuario?: string; fecha?: string; cedula?: string; expediente?: string };
}) {
  const { users, types } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [userOpen, setUserOpen] = React.useState(false);

  const tipo = searchParams.get("tipo") ?? props.initial.tipo ?? "";
  const usuario = searchParams.get("usuario") ?? props.initial.usuario ?? "";
  const fecha = searchParams.get("fecha") ?? props.initial.fecha ?? "";
  const cedula = searchParams.get("cedula") ?? props.initial.cedula ?? "";
  const expediente = searchParams.get("expediente") ?? props.initial.expediente ?? "";

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
    const next = new URLSearchParams(searchParams.toString());
    next.delete("tipo");
    next.delete("usuario");
    next.delete("fecha");
    next.delete("cedula");
    next.delete("expediente");
    next.set("page", "0");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-black">Tipo (comida)</label>
          <select
            value={tipo}
            onChange={(e) => setOrClearParam("tipo", e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
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
          <label className="text-sm font-medium text-black">Usuario</label>
          <Popover open={userOpen} onOpenChange={setUserOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={userOpen}
                className="w-full justify-between border-zinc-300 bg-white text-black hover:bg-zinc-50"
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
                          <span className="text-xs text-zinc-500">{u.email}</span>
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
          <label className="text-sm font-medium text-black">Fecha menú</label>
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setOrClearParam("fecha", e.target.value)}
          />
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-black">Cédula</label>
          <Input
            value={cedula}
            onChange={(e) => setOrClearParam("cedula", e.target.value)}
            placeholder="Ej. V-12345678"
          />
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-black">Expediente</label>
          <Input
            value={expediente}
            onChange={(e) => setOrClearParam("expediente", e.target.value)}
            placeholder="Ej. 2024-12345"
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="border-zinc-300 text-white hover:text-white bg-red-800 hover:bg-red-600"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}

