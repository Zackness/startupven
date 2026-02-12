"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buyTicket } from "@/lib/actions/tickets";
import { ESCRITORIO_PATH } from "@/routes";
import { toast } from "sonner";

import { TicketTypeOption } from "./types";

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface BuyTicketFormProps {
  types: TicketTypeOption[];
  preSelectedId?: string;
  onSuccess?: () => void;
  balance?: number;
}

export function BuyTicketForm({ types, preSelectedId, onSuccess, balance = 0 }: BuyTicketFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string>(preSelectedId || "");
  const [paymentMethod, setPaymentMethod] = useState<"PAGO_MOVIL" | "STRIPE" | "WALLET">("WALLET");

  // Update selection if prop changes
  if (preSelectedId && selectedTypeId !== preSelectedId) {
    setSelectedTypeId(preSelectedId);
  }

  const today = todayString();

  // Encontrar el tipo seleccionado para ver si tiene fecha fija
  const selectedType = types.find((t) => t.id === selectedTypeId);
  const fixedDate = selectedType?.availableForDate ? new Date(selectedType.availableForDate).toISOString().slice(0, 10) : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const typeId = selectedTypeId;
    const dateStr = fixedDate || (form.elements.namedItem("mealDate") as HTMLInputElement).value;

    // Pago Movil Data
    const reference = (form.elements.namedItem("paymentReference") as HTMLInputElement)?.value;
    const bank = (form.elements.namedItem("paymentBank") as HTMLInputElement)?.value;

    if (!typeId) {
      setError("Selecciona un tipo de ticket.");
      setPending(false);
      return;
    }
    if (!dateStr) {
      setError("Selecciona una fecha.");
      setPending(false);
      return;
    }

    if (paymentMethod === "PAGO_MOVIL" && (!reference || !bank)) {
      setError("Completa los datos del pago móvil.");
      setPending(false);
      return;
    }

    if (paymentMethod === "WALLET") {
      const type = types.find(t => t.id === typeId);
      if (type && balance < type.price) {
        setError("Saldo insuficiente en billetera.");
        setPending(false);
        return;
      }
    }

    try {
      await buyTicket(typeId, new Date(dateStr), paymentMethod, reference, bank);
      toast.success("Ticket comprado exitosamente");
      if (onSuccess) onSuccess();
      else router.push(`${ESCRITORIO_PATH}/mis-tickets`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comprar");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-6 rounded-xl border border-zinc-200 bg-white p-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* 1. Detalles del Ticket */}
      <div className="space-y-4">
        <h3 className="font-semibold text-black">1. Detalles del pedido</h3>
        <div>
          <label htmlFor="ticketTypeId" className="mb-1 block text-sm font-medium text-black">
            Tipo de ticket
          </label>
          <select
            id="ticketTypeId"
            name="ticketTypeId"
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
          >
            <option value="">Selecciona...</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — Bs. {t.price.toFixed(2)}
                {t.availableForDate && ` (${new Date(t.availableForDate).toLocaleDateString("es-VE", { timeZone: "UTC" })})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mealDate" className="mb-1 block text-sm font-medium text-black">
            Fecha del menú
          </label>
          <input
            id="mealDate"
            name="mealDate"
            type="date"
            min={today}
            required={!fixedDate}
            disabled={!!fixedDate}
            defaultValue={fixedDate || ""}
            key={fixedDate || "open"} // Force re-render on switch
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black disabled:bg-zinc-100 disabled:text-zinc-500"
          />
          {fixedDate && (
            <p className="mt-1 text-xs text-amber-600">
              Este ticket es válido únicamente para la fecha mostrada.
            </p>
          )}
        </div>
      </div>

      {/* 2. Método de Pago */}
      <div className="space-y-4">
        <h3 className="font-semibold text-black">2. Método de pago</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className={`flex flex-col items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all ${paymentMethod === "WALLET"
              ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600"
              : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            onClick={() => setPaymentMethod("WALLET")}
          >
            <span>💰 Billetera</span>
          </button>
          <button
            type="button"
            className={`flex flex-col items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all ${paymentMethod === "PAGO_MOVIL"
              ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
              : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            onClick={() => setPaymentMethod("PAGO_MOVIL")}
          >
            <span>📱 Pago Móvil</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-sm font-medium text-zinc-400 cursor-not-allowed opacity-70"
            disabled
            title="Próximamente"
          >
            <span>💳 Stripe</span>
          </button>
        </div>

        {paymentMethod === "WALLET" && (
          <div className={`space-y-3 rounded-lg border p-4 ${balance > 0 ? 'border-indigo-100 bg-indigo-50/50' : 'border-red-100 bg-red-50/50'}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-700">Saldo Disponible:</span>
              <span className={`font-bold ${balance > 0 ? 'text-indigo-700' : 'text-red-600'}`}>
                Bs. {balance.toFixed(2)}
              </span>
            </div>
            {selectedType && balance < selectedType.price && (
              <p className="text-xs text-red-600 font-medium">
                No tienes saldo suficiente para esta compra.
              </p>
            )}
          </div>
        )}

        {paymentMethod === "PAGO_MOVIL" && (
          <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-sm text-blue-800">
              Realiza el pago móvil a los datos indicados y registra la referencia.
              <br />
              <span className="font-bold">04245324034 | 24385660 | Banco del Tesoro</span>
            </p>
            <div>
              <div>
                <label className="mb-1 block text-xs font-medium text-blue-900">Banco Emisor</label>
                <input
                  name="paymentBank"
                  required
                  placeholder="Ej. Banesco"
                  className="w-full rounded border border-blue-200 bg-white px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 mt-2block text-xs font-medium text-blue-900">Referencia (4 últimos)</label>
                <input
                  name="paymentReference"
                  required
                  placeholder="Ej. 1234"
                  className="w-full rounded border border-blue-200 bg-white px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={pending} className="w-full bg-blue-800 text-white hover:bg-blue-600">
        {pending ? "Registrar Compra" : "Registrar Compra"}
      </Button>
    </form>
  );
}
