"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markTicketUsed } from "@/lib/actions/tickets";
import { Check } from "lucide-react";

export type TicketScanInfo = {
  id: string;
  userName: string;
  userEmail: string;
  ticketTypeName: string;
  mealDate: Date;
  usedAt: Date | null;
  paymentStatus: string;
};

export function ScanResultPanel({
  ticket,
  onMarked,
}: {
  ticket: TicketScanInfo;
  onMarked?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isExpired = !ticket.usedAt && ticket.mealDate < todayStart;
  const canMarkUsed =
    ticket.paymentStatus === "PAGADO" &&
    !ticket.usedAt &&
    !isExpired;

  function handleMarkUsed() {
    startTransition(async () => {
      await markTicketUsed(ticket.id);
      onMarked?.();
    });
  }

  const mealDateStr = new Date(ticket.mealDate).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-zinc-700">Ticket escaneado</h3>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-zinc-500">Usuario</dt>
          <dd className="font-medium text-black">{ticket.userName}</dd>
          <dd className="text-xs text-zinc-600">{ticket.userEmail}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Plato</dt>
          <dd className="font-medium text-black">{ticket.ticketTypeName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Fecha menú</dt>
          <dd className="font-medium text-black">{mealDateStr}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Estado</dt>
          <dd>
            {ticket.usedAt ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                <Check className="h-3 w-3" />
                Canjeado
              </span>
            ) : ticket.paymentStatus !== "PAGADO" ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Pendiente de pago
              </span>
            ) : isExpired ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                Vencido
              </span>
            ) : (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                Comprado
              </span>
            )}
          </dd>
        </div>
      </dl>
      {canMarkUsed && (
        <div className="mt-4">
          <Button
            type="button"
            className="w-full bg-green-600 text-white hover:bg-green-700"
            disabled={isPending}
            onClick={handleMarkUsed}
          >
            {isPending ? "..." : "Marcar canjeado"}
          </Button>
        </div>
      )}
    </div>
  );
}
