import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MOCK_TICKETS } from "../_components/escritorio-mock-data";
import { cn } from "@/lib/utils";
import type { EstadoTicket } from "../_components/escritorio-types";

const ESTADO_LABEL: Record<EstadoTicket, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};

export default function TicketsPage() {
  return (
    <div className="space-y-12 sm:space-y-14">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Tickets
          </h1>
          <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
            Solicitudes de modificación sobre tus proyectos. Seguimiento y respuestas del equipo.
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-[var(--primary-foreground)] hover:opacity-90">
          <Link href="#">Nuevo ticket</Link>
        </Button>
      </section>

      <section className="space-y-4">
        {MOCK_TICKETS.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <p className="text-[15px] text-[var(--muted-foreground)]">
              No tienes tickets de modificación.
            </p>
          </div>
        ) : (
          MOCK_TICKETS.map((t) => (
            <Link
              key={t.id}
              href="#"
              className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--foreground)]/10 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--foreground)]">{t.asunto}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t.proyectoRef && <span>{t.proyectoRef} · </span>}
                  {t.mensajes} mensaje{t.mensajes !== 1 ? "s" : ""} · Actualizado {new Date(t.ultimaActualizacion).toLocaleDateString("es-VE")}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded px-2 py-0.5 text-xs font-medium",
                  t.estado === "abierto" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                  t.estado === "en_proceso" && "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
                  t.estado === "resuelto" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                  t.estado === "cerrado" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}
              >
                {ESTADO_LABEL[t.estado]}
              </span>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
