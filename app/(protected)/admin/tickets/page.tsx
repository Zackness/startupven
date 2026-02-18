import { getAdminTicketTypes, getAdminTicketsFiltered, getAdminUsersForTicketsFilter } from "@/lib/actions/tickets";
import { MarkUsedButton } from "./mark-used-button";
import { ApproveButton } from "./approve-button";
import { DeleteTicketButton } from "./delete-ticket-button";
import { TicketFilters } from "./ticket-filters";
import { getTodayStartUTC } from "@/lib/utils";
import Link from "next/link";
import { ADMIN_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    tipo?: string;
    usuario?: string;
    fecha?: string;
    cedula?: string;
    expediente?: string;
  }>;
}) {
  const { page, tipo, usuario, fecha, cedula, expediente } = await searchParams;
  const pageNum = Math.max(0, parseInt(page ?? "0", 10));
  const pageSize = 20;
  const todayStart = getTodayStartUTC();
  const [users, types, ticketsResult] = await Promise.all([
    getAdminUsersForTicketsFilter(),
    getAdminTicketTypes(),
    getAdminTicketsFiltered(pageNum, pageSize, { tipo, usuario, fecha, cedula, expediente }),
  ]);
  const { tickets, total } = ticketsResult;
  const totalPages = Math.ceil(total / pageSize);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (tipo) params.set("tipo", tipo);
    if (usuario) params.set("usuario", usuario);
    if (fecha) params.set("fecha", fecha);
    if (cedula) params.set("cedula", cedula);
    if (expediente) params.set("expediente", expediente);
    return `/admin/tickets?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Tickets vendidos
          </h1>
          <p className="mt-1 text-zinc-600">
            Listado de todos los tickets y estado de canje
          </p>
        </div>
        <Link href={`${ADMIN_PATH}/escaneo`}>
          <Button className="gap-2 bg-black text-white hover:bg-zinc-800">
            <QrCode className="h-4 w-4" />
            Escanear QR
          </Button>
        </Link>
      </div>

      <TicketFilters
        users={users}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        initial={{ tipo, usuario, fecha, cedula, expediente }}
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-black">Usuario</th>
                <th className="px-4 py-3 font-medium text-black">Vendedor</th>
                <th className="px-4 py-3 font-medium text-black">Tipo</th>
                <th className="px-4 py-3 font-medium text-black">Fecha menú</th>
                <th className="px-4 py-3 font-medium text-black">Estado</th>
                <th className="px-4 py-3 font-medium text-black">Pago</th>
                <th className="px-4 py-3 font-medium text-black">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                (() => {
                  const isCancelled = !t.usedAt && t.mealDate < todayStart;
                  return (
                    <tr key={t.id} className="border-b border-zinc-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-black">{t.userName}</p>
                        <p className="text-xs text-zinc-600">{t.userEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        {t.sellerName || t.sellerEmail ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-black">{t.sellerName ?? "—"}</span>
                            <span className="text-xs text-zinc-600">{t.sellerEmail ?? ""}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{t.ticketTypeName}</td>
                      <td className="px-4 py-3 text-zinc-700">{formatDate(t.mealDate)}</td>
                      <td className="px-4 py-3">
                        {t.paymentStatus === "PENDIENTE" ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Pendiente de Pago
                          </span>
                        ) : t.usedAt ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Canjeado
                          </span>
                        ) : isCancelled ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Vencido
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Comprado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {t.paymentReference || t.paymentBank ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-black">{t.paymentReference}</span>
                            <span className="text-xs text-zinc-500">{t.paymentBank}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 flex flex-wrap gap-2">
                        {t.paymentStatus === "PENDIENTE" ? (
                          <ApproveButton ticketId={t.id} />
                        ) : !t.usedAt && !isCancelled ? (
                          <MarkUsedButton ticketId={t.id} />
                        ) : isCancelled ? (
                          <span className="text-xs text-zinc-500">Vencido</span>
                        ) : null}
                        <Link href={`${ADMIN_PATH}/tickets/${t.id}`}>
                          <button className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                            Editar
                          </button>
                        </Link>
                        <DeleteTicketButton ticketId={t.id} />
                      </td>
                    </tr>
                  );
                })()
              ))}
            </tbody>
          </table>
        </div>
        {tickets.length === 0 && (
          <div className="px-4 py-12 text-center text-zinc-600">
            No hay tickets registrados
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {pageNum > 0 && (
            <a
              href={pageHref(pageNum - 1)}
              className="rounded-md border border-zinc-300 px-3 py-1 text-sm text-black hover:bg-zinc-50"
            >
              Anterior
            </a>
          )}
          <span className="px-3 py-1 text-sm text-zinc-600">
            Página {pageNum + 1} de {totalPages}
          </span>
          {pageNum < totalPages - 1 && (
            <a
              href={pageHref(pageNum + 1)}
              className="rounded-md border border-zinc-300 px-3 py-1 text-sm text-black hover:bg-zinc-50"
            >
              Siguiente
            </a>
          )}
        </div>
      )}
    </div>
  );
}
