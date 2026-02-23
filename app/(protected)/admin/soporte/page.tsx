import { Link } from "@/components/link";
import { getSupportTicketsForAdmin } from "@/lib/actions/support-tickets";
import { cn } from "@/lib/utils";
import { SoporteFilters } from "./soporte-filters";

const ESTADO_LABEL: Record<string, string> = {
  ABIERTO: "Abierto",
  EN_PROCESO: "En proceso",
  ESPERANDO_CLIENTE: "En espera del cliente",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
};

export default async function AdminSoportePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const tickets = await getSupportTicketsForAdmin({
    status: params.status ?? null,
    search: params.search ?? null,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Soporte
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
          Tickets de soporte abiertos por clientes. Filtra por estado o busca por asunto, nombre o email.
        </p>
      </div>

      <SoporteFilters status={params.status} search={params.search} />

      <section className="space-y-4">
        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <p className="text-[15px] text-[var(--muted-foreground)]">
              No hay tickets de soporte
              {(params.status || params.search) ? " con esos filtros." : "."}
            </p>
          </div>
        ) : (
          tickets.map((t) => (
            <Link
              key={t.id}
              href={`/admin/soporte/${t.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--foreground)]/10 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--foreground)]">{t.subject}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t.userName} · {t.userEmail} · {t.messageCount} mensaje
                  {t.messageCount !== 1 ? "s" : ""} ·{" "}
                  {new Date(t.updatedAt).toLocaleDateString("es-ES")}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded px-2 py-0.5 text-xs font-medium",
                  t.status === "ABIERTO" &&
                    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                  t.status === "EN_PROCESO" &&
                    "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
                  t.status === "ESPERANDO_CLIENTE" &&
                    "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
                  t.status === "RESUELTO" &&
                    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                  t.status === "CERRADO" &&
                    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}
              >
                {ESTADO_LABEL[t.status] ?? t.status}
              </span>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
