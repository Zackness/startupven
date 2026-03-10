import { auth } from "@/lib/auth";
import { getPaymentReports } from "@/lib/actions/wallet-reports";
import { ApprovePaymentButton, RejectPaymentButton } from "@/app/(protected)/admin/pagos/approve-reject-buttons";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente de confirmación",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

const METHOD_LABEL: Record<string, string> = {
  PAGO_MOVIL: "Pago móvil",
  STRIPE: "Tarjeta (Stripe)",
};

export default async function AdminPagosPage() {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string })?.role;
  const isAdmin = role === "ADMIN";
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Pagos</h1>
        <p className="text-[15px] text-[var(--muted-foreground)]">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  const [pendingReports, allReports] = await Promise.all([
    getPaymentReports("PENDIENTE"),
    getPaymentReports(undefined),
  ]);

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Pagos reportados
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Revisa y aprueba los pagos móviles reportados por los clientes. Los pagos aprobados actualizan la
          billetera del usuario.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Pagos pendientes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Pagos que aún no han sido aprobados. Verifica los datos en tu banco antes de aprobar.
        </p>
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          {pendingReports.length === 0 ? (
            <div className="px-6 py-10 text-center text-[15px] text-[var(--muted-foreground)]">
              No hay pagos pendientes.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {pendingReports.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      USD {Number(r.amount).toFixed(2)} · {METHOD_LABEL[r.method] ?? r.method}
                      {r.bank ? ` · ${r.bank}` : ""}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {new Date(r.createdAt).toLocaleString("es-VE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {r.reference ? ` · Ref: ${r.reference}` : ""}
                    </p>
                    {r.user && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {r.user.name ?? "Sin nombre"} · {r.user.email}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ApprovePaymentButton reportId={r.id} />
                    <RejectPaymentButton reportId={r.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Historial de pagos</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Todos los pagos reportados por los usuarios, con su estado actual.
        </p>
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          {allReports.length === 0 ? (
            <div className="px-6 py-10 text-center text-[15px] text-[var(--muted-foreground)]">
              No hay pagos registrados.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {allReports.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      USD {Number(r.amount).toFixed(2)} · {METHOD_LABEL[r.method] ?? r.method}
                      {r.bank ? ` · ${r.bank}` : ""}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {new Date(r.createdAt).toLocaleString("es-VE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {r.reference ? ` · Ref: ${r.reference}` : ""}
                    </p>
                    {r.user && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {r.user.name ?? "Sin nombre"} · {r.user.email}
                      </p>
                    )}
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
    </div>
  );
}

