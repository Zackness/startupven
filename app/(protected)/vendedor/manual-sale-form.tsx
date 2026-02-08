"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { createManualSale } from "@/lib/actions/tickets";

export type ManualSaleUser = {
  id: string;
  label: string;
  email: string;
  cedula: string | null;
  expediente: string | null;
};

export type ManualSaleType = {
  id: string;
  name: string;
};

export function ManualSaleForm(props: { users: ManualSaleUser[]; types: ManualSaleType[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | undefined>("");
  const [success, setSuccess] = React.useState<string | undefined>("");

  const [userOpen, setUserOpen] = React.useState(false);
  const [userId, setUserId] = React.useState<string>("");
  const [ticketTypeId, setTicketTypeId] = React.useState<string>("");
  const [mealDate, setMealDate] = React.useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [quantity, setQuantity] = React.useState<number>(1);
  const [markUsed, setMarkUsed] = React.useState<boolean>(false);

  const selectedUser = React.useMemo(() => props.users.find((u) => u.id === userId), [props.users, userId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await createManualSale({
          userId,
          ticketTypeId,
          mealDateYmd: mealDate,
          quantity,
          markUsed,
        });
        setSuccess("Venta registrada.");
        setQuantity(1);
        setMarkUsed(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo registrar la venta");
      }
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-black">Venta manual</h2>
        <p className="mt-1 text-sm text-zinc-600">Registra una compra creando tickets para un usuario.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Usuario</label>
            <Popover open={userOpen} onOpenChange={setUserOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={userOpen}
                  className="w-full justify-between border-zinc-300 bg-white text-black hover:bg-zinc-50"
                >
                  <span className="truncate text-left">
                    {selectedUser ? selectedUser.label : "Seleccionar usuario"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar por nombre, email, cédula o expediente..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                    <CommandGroup>
                      {props.users.map((u) => (
                        <CommandItem
                          key={u.id}
                          value={`${u.label} ${u.email} ${u.cedula ?? ""} ${u.expediente ?? ""}`}
                          onSelect={() => {
                            setUserId(u.id);
                            setUserOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", userId === u.id ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="text-sm">{u.label}</span>
                            <span className="text-xs text-zinc-500">
                              {u.email}
                              {u.cedula ? ` · ${u.cedula}` : ""}
                              {u.expediente ? ` · ${u.expediente}` : ""}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Tipo</label>
            <select
              value={ticketTypeId}
              onChange={(e) => setTicketTypeId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50"
              disabled={isPending}
            >
              <option value="">Seleccionar</option>
              {props.types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Fecha menú</label>
            <Input type="date" value={mealDate} onChange={(e) => setMealDate(e.target.value)} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Cantidad</label>
            <Input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value || 1))}
              disabled={isPending}
            />
            <p className="text-xs text-zinc-500">Máximo 50 por operación.</p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300"
                checked={markUsed}
                onChange={(e) => setMarkUsed(e.target.checked)}
                disabled={isPending}
              />
              Marcar como canjeado (usedAt)
            </label>
          </div>
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending} className="bg-black text-white hover:bg-zinc-800">
            {isPending ? "Registrando..." : "Registrar venta"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              setUserId("");
              setTicketTypeId("");
              setQuantity(1);
              setMarkUsed(false);
              setError("");
              setSuccess("");
            }}
          >
            Limpiar
          </Button>
        </div>
      </form>
    </div>
  );
}

