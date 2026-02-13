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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [isGuest, setIsGuest] = React.useState(false);
  const [userId, setUserId] = React.useState<string>("");
  const [guestName, setGuestName] = React.useState<string>("");
  const [guestInstitution, setGuestInstitution] = React.useState<string>("");
  const [ticketTypeId, setTicketTypeId] = React.useState<string>("");
  const [mealDate, setMealDate] = React.useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [quantity, setQuantity] = React.useState<number>(1);
  const [paymentBank, setPaymentBank] = React.useState<string>("");
  const [paymentReference, setPaymentReference] = React.useState<string>("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const selectedUser = React.useMemo(() => props.users.find((u) => u.id === userId), [props.users, userId]);
  const selectedTypeName = props.types.find((t) => t.id === ticketTypeId)?.name ?? "—";

  function openConfirmDialog(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (isGuest) {
      if (!guestName.trim()) {
        setError("Indica el nombre del invitado.");
        return;
      }
      if (!guestInstitution.trim()) {
        setError("Indica la institución del invitado.");
        return;
      }
    } else {
      if (!userId) {
        setError("Selecciona un usuario o vende a un invitado.");
        return;
      }
    }
    if (!ticketTypeId) {
      setError("Selecciona un tipo de ticket.");
      return;
    }
    setConfirmOpen(true);
  }

  function handleConfirmSale() {
    startTransition(async () => {
      try {
        const bank = paymentBank.trim() || undefined;
        const reference = paymentReference.trim() || undefined;

        await createManualSale({
          userId: isGuest ? undefined : userId,
          guestName: isGuest ? guestName.trim() : undefined,
          guestInstitution: isGuest ? guestInstitution.trim() : undefined,
          ticketTypeId,
          mealDateYmd: mealDate,
          quantity,
          paymentBank: bank,
          paymentReference: reference,
        });
        setSuccess("Venta registrada.");
        setConfirmOpen(false);
        setQuantity(1);
        setPaymentBank("");
        setPaymentReference("");
        if (isGuest) {
          setGuestName("");
          setGuestInstitution("");
        } else {
          setUserId("");
        }
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

      <form onSubmit={openConfirmDialog} className="space-y-6">
        <div className="space-y-3">
          <span className="text-sm font-medium text-black">¿A quién se vende?</span>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="saleTarget"
                checked={!isGuest}
                onChange={() => {
                  setIsGuest(false);
                  setGuestName("");
                  setGuestInstitution("");
                }}
                className="h-4 w-4 border-zinc-300 text-black focus:ring-zinc-400"
              />
              <span className="text-sm">Usuario registrado</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="saleTarget"
                checked={isGuest}
                onChange={() => {
                  setIsGuest(true);
                  setUserId("");
                  setUserOpen(false);
                }}
                className="h-4 w-4 border-zinc-300 text-black focus:ring-zinc-400"
              />
              <span className="text-sm">Invitado</span>
            </label>
          </div>
        </div>

        {isGuest ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Nombre del invitado</label>
              <Input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                disabled={isPending}
                className="border-zinc-300 bg-white text-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Institución</label>
              <Input
                type="text"
                value={guestInstitution}
                onChange={(e) => setGuestInstitution(e.target.value)}
                placeholder="Ej. Universidad XYZ"
                disabled={isPending}
                className="border-zinc-300 bg-white text-black"
              />
            </div>
          </div>
        ) : (
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
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0 bg-white shadow-md border border-zinc-200"
                  align="start"
                >
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
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">

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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Banco (opcional)</label>
            <Input
              type="text"
              value={paymentBank}
              onChange={(e) => setPaymentBank(e.target.value)}
              placeholder="Ej. Banesco"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Referencia (opcional)</label>
            <Input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Ej. 1234"
              disabled={isPending}
            />
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
              setGuestName("");
              setGuestInstitution("");
              setTicketTypeId("");
              setQuantity(1);
              setPaymentBank("");
              setPaymentReference("");
              setError("");
              setSuccess("");
            }}
          >
            Limpiar
          </Button>
        </div>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="border-zinc-200 bg-white text-black sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar venta</DialogTitle>
            <DialogDescription>Revisa los datos antes de registrar la venta.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2 text-sm">
            <p><span className="font-medium text-zinc-700">Cliente:</span>{" "}
              {isGuest ? `Invitado: ${guestName} (${guestInstitution})` : selectedUser?.label ?? "—"}
            </p>
            <p><span className="font-medium text-zinc-700">Tipo:</span> {selectedTypeName}</p>
            <p><span className="font-medium text-zinc-700">Fecha menú:</span> {mealDate}</p>
            <p><span className="font-medium text-zinc-700">Cantidad:</span> {quantity}</p>
            <p><span className="font-medium text-zinc-700">Banco:</span> {paymentBank.trim() || "—"}</p>
            <p><span className="font-medium text-zinc-700">Referencia:</span> {paymentReference.trim() || "—"}</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmSale} disabled={isPending} className="bg-black text-white hover:bg-zinc-800">
              {isPending ? "Registrando..." : "Confirmar venta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

