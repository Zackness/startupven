import { getAdminTickets } from "@/lib/actions/tickets";
import { MarkUsedButton } from "./mark-used-button";

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
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(0, parseInt(page ?? "0", 10));
  const pageSize = 20;
  const { tickets, total } = await getAdminTickets(pageNum, pageSize);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Tickets vendidos
        </h1>
        <p className="mt-1 text-zinc-600">
          Listado de todos los tickets y estado de canje
        </p>
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
                <th className="px-4 py-3 font-medium text-black">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-black">{t.userName}</p>
                    <p className="text-xs text-zinc-600">{t.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{t.ticketTypeName}</td>
                  <td className="px-4 py-3 text-zinc-700">{formatDate(t.mealDate)}</td>
                  <td className="px-4 py-3">
                    {t.usedAt ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Canjeado
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!t.usedAt && <MarkUsedButton ticketId={t.id} />}
                  </td>
                </tr>
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
              href={`/admin/tickets?page=${pageNum - 1}`}
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
              href={`/admin/tickets?page=${pageNum + 1}`}
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
