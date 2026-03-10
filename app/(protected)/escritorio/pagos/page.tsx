import { getEscritorioData } from "@/lib/actions/escritorio";
import { getCategoryLabel } from "@/lib/service-packages";
import type { ProjectCategory } from "@/lib/project-categories";
import { PagarPendientesDialog } from "@/app/(protected)/escritorio/pagos/pagar-pendientes-dialog";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente de confirmación",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

const METHOD_LABEL: Record<string, string> = {
  PAGO_MOVIL: "Pago móvil",
  STRIPE: "Tarjeta (Stripe)",
};

export default async function PagosPage() {
  const data = await getEscritorioData();
  const {
    paymentReports,
    totalPagado,
    totalPendiente,
    packagesAcquired,
    totalServiciosAdquiridos,
    extraCharges,
  } = data;

  const pendingReports = paymentReports.filter((r) => r.status === "PENDIENTE");
  const montoContratado = totalServiciosAdquiridos;
  const montoPagadoAprobado = totalPagado;
  const montoPagosEnProceso = totalPendiente;
  const saldoPendiente =
    Math.max(montoContratado - montoPagadoAprobado - montoPagosEnProceso, 0);

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Pagos
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Revisa lo que se debe, lo que has pagado y los servicios que adquiriste en el onboarding.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Lo que se debe
          </p>
          <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
            USD {totalPendiente.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Pagos reportados que aún están pendientes de confirmación por el equipo.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Lo que se pagó
          </p>
          <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
            USD {totalPagado.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Total pagado y aprobado
          </p>
        </div>
      </section>
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Pagar pendientes
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)] max-w-xl">
              Aquí puedes pagar todo o una parte del monto pendiente que tienes con la agencia. Los pagos quedarán
              como pendientes hasta que el equipo los apruebe.
            </p>
          </div>
          <PagarPendientesDialog
            saldoPendiente={saldoPendiente}
            pendingReports={pendingReports.map((r) => ({
              id: r.id,
              amount: r.amount,
              method: r.method,
              reference: r.reference,
              bank: r.bank,
              createdAt: r.createdAt.toISOString(),
            }))}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Historial de pagos
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Cada pago registrado al completar el onboarding o pagos adicionales.
        </p>
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          {paymentReports.length === 0 ? (
            <div className="px-6 py-14 text-center text-[15px] text-[var(--muted-foreground)]">
              No hay pagos registrados.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {paymentReports.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      USD {r.amount.toFixed(2)} · {METHOD_LABEL[r.method] ?? r.method}
                      {r.bank ? ` · ${r.bank}` : ""}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString("es-VE", {
                        dateStyle: "medium",
                      })}
                      {r.reference ? ` · Ref: ${r.reference}` : ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      r.status === "APROBADO"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : r.status === "PENDIENTE"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                  >
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {extraCharges.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Cargos extra
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Ajustes o servicios adicionales acordados contigo (por ejemplo horas extra, campañas especiales o
            trabajo fuera de los paquetes estándar).
          </p>
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {extraCharges.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {c.label} · USD {c.amount.toFixed(2)}
                    </p>
                    {c.description && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {c.description}
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString("es-VE", {
                        dateStyle: "medium",
                      })}{" "}
                      · {c.category}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      c.status === "PAGADO"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : c.status === "PENDIENTE" || c.status === "FACTURADO"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                  >
                    {c.status === "PENDIENTE"
                      ? "Pendiente"
                      : c.status === "FACTURADO"
                        ? "Facturado"
                        : c.status === "PAGADO"
                          ? "Pagado"
                          : "Cancelado"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Servicios adquiridos
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Paquetes contratados en el onboarding. Total: USD {totalServiciosAdquiridos.toFixed(2)}
        </p>
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          {packagesAcquired.length === 0 ? (
            <div className="px-6 py-14 text-center text-[15px] text-[var(--muted-foreground)]">
              No hay servicios registrados. Completa el onboarding para ver tus paquetes aquí.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {packagesAcquired.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{p.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {getCategoryLabel(p.category as ProjectCategory)}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums text-[var(--foreground)]">
                    USD {p.price.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
