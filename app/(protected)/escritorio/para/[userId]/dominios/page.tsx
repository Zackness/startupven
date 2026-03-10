import { Button } from "@/components/ui/button";
import { MOCK_DOMINIOS } from "@/app/(protected)/escritorio/_components/escritorio-mock-data";
import { cn } from "@/lib/utils";

const ESTADO_LABEL: Record<string, string> = {
  activo: "Activo",
  pendiente_pago: "Pendiente de pago",
  vencido: "Vencido",
};

export default function ParaDominiosPage() {
  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Dominios
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Dominios del cliente. Renovaciones y nuevos registros.
        </p>
      </section>

      <section className="space-y-4">
        {MOCK_DOMINIOS.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <p className="text-[15px] text-[var(--muted-foreground)]">
              No hay dominios registrados.
            </p>
          </div>
        ) : (
          MOCK_DOMINIOS.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-[var(--foreground)]">{d.nombre}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Vencimiento {d.vencimiento ? new Date(d.vencimiento).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium",
                    d.estado === "activo" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                    d.estado === "pendiente_pago" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                    d.estado === "vencido" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {ESTADO_LABEL[d.estado] ?? d.estado}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {d.precioRenovacion != null && (
                  <span className="text-sm font-medium tabular-nums text-[var(--foreground)]">
                    USD {d.precioRenovacion}
                  </span>
                )}
                {(d.estado === "pendiente_pago" || d.estado === "vencido") && (
                  <Button size="sm" className="bg-[var(--primary)] text-[var(--primary-foreground)]">
                    Pagar
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
