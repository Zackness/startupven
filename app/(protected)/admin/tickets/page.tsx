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
  }>;
}) {
  const { page, tipo, usuario, fecha, cedula } = await searchParams;
  const pageNum = Math.max(0, parseInt(page ?? "0", 10));
  const pageSize = 20;
  const todayStart = getTodayStartUTC();
  const [users, types, ticketsResult] = await Promise.all([
    getAdminUsersForTicketsFilter(),
    getAdminTicketTypes(),
    getAdminTicketsFiltered(pageNum, pageSize, { tipo, usuario, fecha, cedula }),
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
    return `/admin/tickets?${params.toString()}`;
  }

  return (
    <div className="space-y-12 sm:space-y-14">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Operación</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">Tickets vendidos</h1>
          <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
            Listado de todos los tickets y estado de canje.
          </p>
        </div>
        <Link href={`${ADMIN_PATH}/escaneo`}>
          <Button className="shrink-0 gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-[var(--primary-foreground)] hover:opacity-90">
            <QrCode className="h-4 w-4" />
            Escanear QR
          </Button>
        </Link>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Filtros</p>
        <TicketFilters
          users={users}
          types={types.map((t) => ({ id: t.id, name: t.name }))}
          initial={{ tipo, usuario, fecha, cedula }}
        />
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Listado</p>

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Usuario</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Vendedor</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Tipo</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Fecha menú</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Estado</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Pago</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {tickets.map((t) => {
                  const isCancelled = !t.usedAt && t.mealDate < todayStart;
                  return (
                    <tr key={t.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--foreground)]">{t.userName}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{t.userEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        {t.sellerName || t.sellerEmail ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-[var(--foreground)]">{t.sellerName ?? "—"}</span>
                            <span className="text-xs text-[var(--muted-foreground)]">{t.sellerEmail ?? ""}</span>
                          </div>
                        ) : (
                          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">Compra web</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">{t.ticketTypeName}</td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">{formatDate(t.mealDate)}</td>
                      <td className="px-4 py-3">
                        {t.paymentStatus === "PENDIENTE" ? (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">Pendiente de pago</span>
                        ) : t.usedAt ? (
                          <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">Canjeado</span>
                        ) : isCancelled ? (
                          <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">Vencido</span>
                        ) : (
                          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">Comprado</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {t.paymentReference || t.paymentBank ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-[var(--foreground)]">{t.paymentReference}</span>
                            <span className="text-xs text-[var(--muted-foreground)]">{t.paymentBank}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 flex flex-wrap gap-2">
                        {t.paymentStatus === "PENDIENTE" ? (
                          <ApproveButton ticketId={t.id} />
                        ) : !t.usedAt && !isCancelled ? (
                          <MarkUsedButton ticketId={t.id} />
                        ) : isCancelled ? (
                          <span className="text-xs text-[var(--muted-foreground)]">Vencido</span>
                        ) : null}
                        <Link href={`${ADMIN_PATH}/tickets/${t.id}`}>
                          <Button variant="outline" size="sm" className="border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Editar</Button>
                        </Link>
                        <DeleteTicketButton ticketId={t.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {tickets.length === 0 && (
            <div className="px-4 py-12 text-center text-[var(--muted-foreground)]">No hay tickets registrados.</div>
          )}
        </div>

        {totalPages > 1 && (
          <nav className="mt-6 flex justify-center gap-2" aria-label="Paginación">
            {pageNum > 0 ? (
              <a href={pageHref(pageNum - 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]">
                Anterior
              </a>
            ) : (
              <span className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)]">Anterior</span>
            )}
            <span className="flex items-center px-4 py-2 text-sm text-[var(--muted-foreground)]">Página {pageNum + 1} de {totalPages}</span>
            {pageNum < totalPages - 1 ? (
              <a href={pageHref(pageNum + 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]">
                Siguiente
              </a>
            ) : (
              <span className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)]">Siguiente</span>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
