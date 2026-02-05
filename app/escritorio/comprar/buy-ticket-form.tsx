"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buyTicket } from "@/lib/actions/tickets";
import { ESCRITORIO_PATH } from "@/routes";
type TicketTypeOption = { id: string; name: string; price: number; description: string | null };

function todayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function BuyTicketForm({ types }: { types: TicketTypeOption[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = todayString();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const typeId = (form.elements.namedItem("ticketTypeId") as HTMLSelectElement).value;
    const dateStr = (form.elements.namedItem("mealDate") as HTMLInputElement).value;
    if (!typeId || !dateStr) {
      setError("Selecciona tipo y fecha.");
      setPending(false);
      return;
    }
    try {
      await buyTicket(typeId, new Date(dateStr));
      router.push(`${ESCRITORIO_PATH}/mis-tickets`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comprar");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="ticketTypeId" className="mb-1 block text-sm font-medium text-black">
          Tipo de ticket
        </label>
        <select
          id="ticketTypeId"
          name="ticketTypeId"
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
        >
          <option value="">Selecciona...</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — ${t.price.toFixed(2)}
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
          required
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full bg-black text-white hover:bg-zinc-800">
        {pending ? "Comprando..." : "Comprar ticket"}
      </Button>
    </form>
  );
}
