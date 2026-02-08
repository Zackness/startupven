import { getMyTickets } from "@/lib/actions/tickets";
import { TicketQR } from "@/components/ticket-qr";
import { Ticket, CheckCircle, Clock, XCircle } from "lucide-react";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function MisTicketsPage() {
  const tickets = await getMyTickets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Mis tickets
        </h1>
        <p className="mt-1 text-zinc-600">
          Tickets de comedor que has comprado. Cada ticket tiene un código QR único para canjear.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <Ticket className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-4 text-zinc-600">
            No tienes tickets todavía
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Compra tu primer ticket o usa «Compra de ejemplo» en el escritorio para ver un ticket con QR.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {tickets.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-nowrap"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {t.status === "CANJEADO" ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                ) : t.status === "VENCIDO" ? (
                  <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                ) : t.status === "PENDIENTE_PAGO" ? (
                  <Clock className="h-5 w-5 shrink-0 text-amber-500" />
                ) : (
                  <Ticket className="h-5 w-5 shrink-0 text-blue-600" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-black">
                    {t.ticketTypeName}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {formatDate(t.mealDate)}
                    {t.status === "CANJEADO" && " · Canjeado"}
                    {t.status === "VENCIDO" && " · Vencido"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {t.status === "DISPONIBLE" && <TicketQR ticketId={t.id} />}
                <span
                  className={
                    t.status === "CANJEADO"
                      ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                      : t.status === "VENCIDO"
                        ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                        : t.status === "PENDIENTE_PAGO"
                          ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                          : "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                  }
                >
                  {t.status === "CANJEADO"
                    ? "Canjeado"
                    : t.status === "VENCIDO"
                      ? "Vencido"
                      : t.status === "PENDIENTE_PAGO"
                        ? "Pendiente de Pago"
                        : "Comprado"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
