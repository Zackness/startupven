"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
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
import { createManualSale, type ManualSaleBuyer } from "@/lib/actions/tickets";

export type ManualSaleUser = {
  id: string;
  label: string;
  email: string;
  cedula: string | null;
};

export type ManualSaleType = {
  id: string;
  name: string;
};

type BuyerRow =
  | { id: string; type: "user"; userId: string }
  | { id: string; type: "guest"; guestName: string; guestInstitution: string };

function nextId() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ManualSaleForm(props: { users: ManualSaleUser[]; types: ManualSaleType[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | undefined>("");
  const [success, setSuccess] = React.useState<string | undefined>("");

  const [buyers, setBuyers] = React.useState<BuyerRow[]>([
    { id: nextId(), type: "user", userId: "" },
  ]);
  const [ticketTypeId, setTicketTypeId] = React.useState<string>("");
  const [mealDate, setMealDate] = React.useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [paymentBank, setPaymentBank] = React.useState<string>("");
  const [paymentReference, setPaymentReference] = React.useState<string>("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = React.useState<string | null>(null);

  const selectedTypeName = props.types.find((t) => t.id === ticketTypeId)?.name ?? "—";

  function addBuyer() {
    setBuyers((prev) => [...prev, { id: nextId(), type: "user", userId: "" }]);
  }

  function removeBuyer(id: string) {
    setBuyers((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  function setBuyerType(id: string, type: "user" | "guest") {
    setBuyers((prev) =>
      prev.map((r) =>
        r.id === id
          ? type === "user"
            ? { id: r.id, type: "user" as const, userId: "" }
            : { id: r.id, type: "guest" as const, guestName: "", guestInstitution: "" }
          : r
      )
    );
  }

  function updateBuyerUser(id: string, userId: string) {
    setBuyers((prev) => prev.map((r) => (r.id === id && r.type === "user" ? { ...r, userId } : r)));
  }

  function updateBuyerGuest(id: string, guestName: string, guestInstitution: string) {
    setBuyers((prev) =>
      prev.map((r) =>
        r.id === id && r.type === "guest" ? { ...r, guestName, guestInstitution } : r
      )
    );
  }

  function openConfirmDialog(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const hasValid = buyers.some((b) => {
      if (b.type === "user") return b.userId.trim() !== "";
      return b.guestName.trim() !== "" && b.guestInstitution.trim() !== "";
    });
    if (!hasValid) {
      setError("Agrega al menos un comprador (usuario o invitado).");
      return;
    }
    const invalid = buyers.filter((b) => {
      if (b.type === "user") return !b.userId.trim();
      return !b.guestName.trim() || !b.guestInstitution.trim();
    });
    if (invalid.length > 0) {
      setError("Completa o elimina las filas vacías. Cada comprador debe tener usuario o datos de invitado.");
      return;
    }
    if (!ticketTypeId) {
      setError("Selecciona un tipo de ticket.");
      return;
    }
    setConfirmOpen(true);
  }

  function buildBuyersPayload(): ManualSaleBuyer[] {
    return buyers
      .filter((b) => {
        if (b.type === "user") return b.userId.trim() !== "";
        return b.guestName.trim() !== "" && b.guestInstitution.trim() !== "";
      })
      .map((b) =>
        b.type === "user" ? { userId: b.userId } : { guestName: b.guestName, guestInstitution: b.guestInstitution }
      );
  }

  function handleConfirmSale() {
    startTransition(async () => {
      try {
        const payload = buildBuyersPayload();
        if (payload.length === 0) {
          setError("Agrega al menos un comprador.");
          return;
        }
        await createManualSale({
          buyers: payload,
          ticketTypeId,
          mealDateYmd: mealDate,
          paymentBank: paymentBank.trim() || undefined,
          paymentReference: paymentReference.trim() || undefined,
        });
        setSuccess(`Venta registrada: ${payload.length} ticket(s).`);
        setConfirmOpen(false);
        setBuyers([{ id: nextId(), type: "user", userId: "" }]);
        setTicketTypeId("");
        setPaymentBank("");
        setPaymentReference("");
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
        <p className="mt-1 text-sm text-zinc-600">
          Mismo plato, fecha, banco y referencia para todos. Agrega los compradores (uno por ticket).
        </p>
      </div>

      <form onSubmit={openConfirmDialog} className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black">Compradores</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBuyer}
              disabled={isPending}
              className="gap-1.5 border-zinc-300 text-black hover:bg-zinc-50"
            >
              <Plus className="h-4 w-4" />
              Agregar usuario
            </Button>
          </div>

          <div className="space-y-3">
            {buyers.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3"
              >
                <div className="flex gap-2">
                  <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      name={`type-${row.id}`}
                      checked={row.type === "user"}
                      onChange={() => setBuyerType(row.id, "user")}
                      className="h-3.5 w-3.5 border-zinc-300 text-black"
                    />
                    Usuario
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      name={`type-${row.id}`}
                      checked={row.type === "guest"}
                      onChange={() => setBuyerType(row.id, "guest")}
                      className="h-3.5 w-3.5 border-zinc-300 text-black"
                    />
                    Invitado
                  </label>
                </div>

                {row.type === "user" ? (
                  <div className="min-w-[200px] flex-1">
                    <Popover
                      open={userPopoverOpen === row.id}
                      onOpenChange={(open) => setUserPopoverOpen(open ? row.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between border-zinc-300 bg-white text-black hover:bg-zinc-50 text-sm"
                        >
                          <span className="truncate text-left">
                            {row.userId ? props.users.find((u) => u.id === row.userId)?.label ?? "Usuario" : "Seleccionar"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-64 p-0 bg-white" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar..." />
                          <CommandList>
                            <CommandEmpty>No hay resultados.</CommandEmpty>
                            <CommandGroup>
                              {props.users.map((u) => (
                                <CommandItem
                                  key={u.id}
                                  value={`${u.label} ${u.email} ${u.cedula ?? ""}`}
                                  onSelect={() => {
                                    updateBuyerUser(row.id, u.id);
                                    setUserPopoverOpen(null);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", row.userId === u.id ? "opacity-100" : "opacity-0")} />
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
                ) : (
                  <div className="flex flex-1 flex-wrap gap-2">
                    <Input
                      type="text"
                      value={row.guestName}
                      onChange={(e) => updateBuyerGuest(row.id, e.target.value, row.guestInstitution)}
                      placeholder="Nombre invitado"
                      disabled={isPending}
                      className="max-w-[180px] border-zinc-300 bg-white text-black"
                    />
                    <Input
                      type="text"
                      value={row.guestInstitution}
                      onChange={(e) => updateBuyerGuest(row.id, row.guestName, e.target.value)}
                      placeholder="Institución"
                      disabled={isPending}
                      className="max-w-[180px] border-zinc-300 bg-white text-black"
                    />
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBuyer(row.id)}
                  disabled={isPending || buyers.length === 1}
                  className="text-zinc-500 hover:text-red-600 hover:bg-red-50"
                  title="Quitar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Tipo (plato)</label>
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
              setBuyers([{ id: nextId(), type: "user", userId: "" }]);
              setTicketTypeId("");
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
            <DialogDescription>Se crearán tantos tickets como compradores. Mismo plato, fecha, banco y referencia.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2 text-sm">
            <p>
              <span className="font-medium text-zinc-700">Compradores:</span>{" "}
              {buyers
                .filter((b) => (b.type === "user" ? b.userId : b.guestName || b.guestInstitution))
                .map((b) =>
                  b.type === "user"
                    ? props.users.find((u) => u.id === b.userId)?.label ?? "—"
                    : `Invitado: ${b.guestName} (${b.guestInstitution})`
                )
                .join(", ")}
            </p>
            <p>
              <span className="font-medium text-zinc-700">Cantidad de tickets:</span> {buildBuyersPayload().length}
            </p>
            <p>
              <span className="font-medium text-zinc-700">Tipo:</span> {selectedTypeName}
            </p>
            <p>
              <span className="font-medium text-zinc-700">Fecha menú:</span> {mealDate}
            </p>
            <p>
              <span className="font-medium text-zinc-700">Banco:</span> {paymentBank.trim() || "—"}
            </p>
            <p>
              <span className="font-medium text-zinc-700">Referencia:</span> {paymentReference.trim() || "—"}
            </p>
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
