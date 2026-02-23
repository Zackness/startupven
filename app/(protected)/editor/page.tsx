import { getEditorTicketsFiltered } from "@/lib/actions/tickets";
import { ApproveButton } from "@/app/(protected)/admin/tickets/approve-button";
import { MarkUsedButton } from "@/app/(protected)/admin/tickets/mark-used-button";
import { EditorTicketFilters } from "./editor-ticket-filters";
import { Link } from "@/components/link";
import { ESCRITORIO_PATH, EDITOR_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { getTodayStartUTC } from "@/lib/utils";
import { QrCode } from "lucide-react";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; cedula?: string; fecha?: string }>;
}) {
  const { page, cedula, fecha } = await searchParams;
  const pageNum = Math.max(0, parseInt(page ?? "0", 10));
  const pageSize = 20;
  const todayStart = getTodayStartUTC();

  const { tickets, total } = await getEditorTicketsFiltered(pageNum, pageSize, {
    cedula: cedula ?? null,
    fecha: fecha ?? null,
  });
  const totalPages = Math.ceil(total / pageSize);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (cedula) params.set("cedula", cedula);
    if (fecha) params.set("fecha", fecha);
    return `/editor?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Panel de editor</h1>
          <p className="mt-1 text-zinc-600">
            Aprobar compras: filtra por cédula o fecha y aprueba pagos pendientes.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`${EDITOR_PATH}/escaneo`}>
            <Button size="sm" className="gap-2 bg-black text-white hover:bg-zinc-800">
              <QrCode className="h-4 w-4" />
              Escanear QR
            </Button>
          </Link>
          <Link href={ESCRITORIO_PATH}>
            <Button variant="outline" size="sm">
              Ir a escritorio
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <EditorTicketFilters initial={{ cedula: cedula ?? "", fecha: fecha ?? "" }} />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-black">Usuario</th>
                <th className="px-4 py-3 font-medium text-black">Tipo</th>
                <th className="px-4 py-3 font-medium text-black">Fecha menú</th>
                <th className="px-4 py-3 font-medium text-black">Estado</th>
                <th className="px-4 py-3 font-medium text-black">Pago</th>
                <th className="px-4 py-3 font-medium text-black">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const isCancelled = !t.usedAt && t.mealDate < todayStart;
                return (
                  <tr key={t.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-black">{t.userName}</p>
                      <p className="text-xs text-zinc-600">{t.userEmail}</p>
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
                    <td className="px-4 py-3 flex gap-2">
                      {t.paymentStatus === "PENDIENTE" ? (
                        <ApproveButton ticketId={t.id} />
                      ) : !t.usedAt && !isCancelled ? (
                        <MarkUsedButton ticketId={t.id} />
                      ) : isCancelled ? (
                        <span className="text-xs text-zinc-500">Vencido</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {tickets.length === 0 && (
          <div className="px-4 py-12 text-center text-zinc-600">
            No hay tickets con los filtros aplicados
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
