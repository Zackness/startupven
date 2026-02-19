import { getVendorTicketsFiltered } from "@/lib/actions/tickets";
import { getTodayStartUTC } from "@/lib/utils";
import { TicketQRViewButton } from "@/components/ticket-qr";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function VendedorTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; fecha?: string; cedula?: string; expediente?: string }>;
}) {
  const { page, fecha, cedula, expediente } = await searchParams;
  const pageNum = Math.max(0, parseInt(page ?? "0", 10));
  const pageSize = 20;

  const todayStart = getTodayStartUTC();

  // Por defecto, el vendedor trabaja con el día de hoy
  const defaultYmd = new Date().toISOString().slice(0, 10);
  const fechaYmd = fecha ?? defaultYmd;

  const { tickets, total } = await getVendorTicketsFiltered(pageNum, pageSize, {
    fecha: fechaYmd,
    cedula,
    expediente,
  });
  const totalPages = Math.ceil(total / pageSize);

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("fecha", fechaYmd);
    if (cedula) params.set("cedula", cedula);
    if (expediente) params.set("expediente", expediente);
    return `/vendedor/tickets?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Tickets (vendedor)</h1>
        <p className="mt-1 text-zinc-600">Consulta tickets vendidos. El canje lo realiza personal autorizado (admin/editor).</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Fecha menú</label>
            <input
              type="date"
              defaultValue={fechaYmd}
              name="fecha"
              form="vendedor-filters"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Cédula</label>
            <input
              defaultValue={cedula ?? ""}
              name="cedula"
              form="vendedor-filters"
              placeholder="Ej. V-12345678"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Expediente</label>
            <input
              defaultValue={expediente ?? ""}
              name="expediente"
              form="vendedor-filters"
              placeholder="Ej. 2024-12345"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            />
          </div>
        </div>

        <form id="vendedor-filters" className="mt-4 flex gap-2" action="/vendedor/tickets" method="GET">
          {/* los inputs están arriba con form= */}
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Filtrar
          </button>
          <a
            href={`/vendedor/tickets?fecha=${encodeURIComponent(fechaYmd)}`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-50"
          >
            Limpiar
          </a>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-black">Usuario</th>
                <th className="px-4 py-3 font-medium text-black">Origen</th>
                <th className="px-4 py-3 font-medium text-black">C.I.</th>
                <th className="px-4 py-3 font-medium text-black">Expediente</th>
                <th className="px-4 py-3 font-medium text-black">Tipo</th>
                <th className="px-4 py-3 font-medium text-black">Fecha menú</th>
                <th className="px-4 py-3 font-medium text-black">Estado</th>
                <th className="px-4 py-3 font-medium text-black">Referencia / Pago</th>
                <th className="px-4 py-3 font-medium text-black">Ver QR</th>
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
                    <td className="px-4 py-3">
                      {t.isWebPurchase ? (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                          Compra web
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          Venta manual
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{t.userCedula ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-700">{t.userExpediente ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-700">{t.ticketTypeName}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatDate(t.mealDate)}</td>
                    <td className="px-4 py-3">
                      {t.usedAt ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Canjeado
                        </span>
                      ) : isCancelled ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          Cancelado
                        </span>
                      ) : t.paymentStatus === "PAGADO" ? (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          Comprado
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {t.paymentReference || t.paymentBank ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-black">{t.paymentReference ?? "—"}</span>
                          <span className="text-xs text-zinc-500">{t.paymentBank ?? ""}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <TicketQRViewButton ticketId={t.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {tickets.length === 0 && (
          <div className="px-4 py-12 text-center text-zinc-600">No hay tickets para los filtros actuales.</div>
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

