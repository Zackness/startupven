"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTicketAdmin } from "@/lib/actions/tickets";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import type { TicketPaymentStatus } from "@/lib/generated/prisma/enums";

type TicketForEdit = {
  id: string;
  userName: string;
  userEmail: string;
  ticketTypeId: string;
  ticketTypeName: string;
  mealDateYmd: string;
  paymentStatus: TicketPaymentStatus;
  paymentReference: string;
  paymentBank: string;
};

type TicketTypeOption = {
  id: string;
  name: string;
};

const PAYMENT_STATUS_LABEL: Record<TicketPaymentStatus, string> = {
  PENDIENTE: "Pendiente de pago",
  PAGADO: "Pagado",
  REEMBOLSADO: "Reembolsado",
};

export function EditTicketForm({ ticket, types }: { ticket: TicketForEdit; types: TicketTypeOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const ticketTypeId = (formData.get("ticketTypeId") as string) || "";
    const mealDateYmd = (formData.get("mealDate") as string) || "";
    const paymentStatus = (formData.get("paymentStatus") as TicketPaymentStatus) || "PENDIENTE";
    const paymentReference = (formData.get("paymentReference") as string) || "";
    const paymentBank = (formData.get("paymentBank") as string) || "";

    if (!ticketTypeId) {
      setError("Selecciona un plato.");
      return;
    }
    if (!mealDateYmd) {
      setError("Selecciona la fecha del menú.");
      return;
    }

    startTransition(async () => {
      try {
        await updateTicketAdmin({
          id: ticket.id,
          ticketTypeId,
          mealDateYmd,
          paymentStatus,
          paymentReference,
          paymentBank,
        });
        setSuccess("Ticket actualizado.");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo actualizar el ticket.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
        <p>
          <span className="font-medium text-black">Usuario:</span> {ticket.userName}{" "}
          <span className="text-xs text-zinc-500">({ticket.userEmail})</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-black" htmlFor="ticketTypeId">
            Plato
          </label>
          <select
            id="ticketTypeId"
            name="ticketTypeId"
            defaultValue={ticket.ticketTypeId}
            disabled={isPending}
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50"
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-black" htmlFor="mealDate">
            Fecha del menú
          </label>
          <Input
            id="mealDate"
            name="mealDate"
            type="date"
            defaultValue={ticket.mealDateYmd}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-black" htmlFor="paymentStatus">
            Estado de pago
          </label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            defaultValue={ticket.paymentStatus}
            disabled={isPending}
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50"
          >
            {(["PENDIENTE", "PAGADO", "REEMBOLSADO"] as TicketPaymentStatus[]).map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-black" htmlFor="paymentBank">
            Banco (opcional)
          </label>
          <Input
            id="paymentBank"
            name="paymentBank"
            defaultValue={ticket.paymentBank}
            disabled={isPending}
            placeholder="Ej. Banco del Tesoro"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-black" htmlFor="paymentReference">
            Referencia de pago (opcional)
          </label>
          <Input
            id="paymentReference"
            name="paymentReference"
            defaultValue={ticket.paymentReference}
            disabled={isPending}
            placeholder="Ej. últimos 4 dígitos o ID de transacción"
          />
        </div>
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="bg-black text-white hover:bg-zinc-800">
          {isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

