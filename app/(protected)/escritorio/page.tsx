import { Link } from "@/components/link";
import { getWalletBalance } from "@/lib/actions/wallet";
import { getEscritorioData } from "@/lib/actions/escritorio";
import {
  ESCRITORIO_PROYECTOS_PATH,
  ESCRITORIO_DOMINIOS_PATH,
  ESCRITORIO_TICKETS_PATH,
  ESCRITORIO_SERVICIOS_PATH,
  ESCRITORIO_PAGOS_PATH,
} from "@/routes";
import {
  FileText,
  Globe,
  MessageSquare,
  Wallet,
  ArrowRight,
  Package,
  PauseCircle,
} from "lucide-react";
import { WalletCard } from "./_components/wallet-card";

export default async function EscritorioPage() {
  const [wallet, data] = await Promise.all([getWalletBalance(), getEscritorioData()]);

  const {
    projectsSuspendedCount,
    servicesAcquiredCount,
    servicesSuspendedCount,
    supportTicketsCount,
    dominiosCount,
    totalPagado,
    totalPendiente,
    totalServiciosAdquiridos,
  } = data;

  const proyectosCount = data.projects.length;

  const montoContratado = totalServiciosAdquiridos;
  const montoPagadoAprobado = totalPagado;
  const montoPagosEnProceso = totalPendiente;
  const saldoPendiente =
    Math.max(montoContratado - montoPagadoAprobado - montoPagosEnProceso, 0);

  const cards: { href: string; label: string; count: number; subtitle: string; icon: typeof FileText }[] = [
    { href: ESCRITORIO_PROYECTOS_PATH, label: "Proyectos", count: proyectosCount, subtitle: proyectosCount === 1 ? "proyecto" : "proyectos", icon: FileText },
    { href: ESCRITORIO_PROYECTOS_PATH, label: "Proyectos suspendidos", count: projectsSuspendedCount, subtitle: projectsSuspendedCount === 1 ? "suspendido" : "suspendidos", icon: PauseCircle },
    { href: ESCRITORIO_SERVICIOS_PATH, label: "Servicios adquiridos", count: servicesAcquiredCount, subtitle: servicesAcquiredCount === 1 ? "servicio" : "servicios", icon: Package },
    { href: ESCRITORIO_SERVICIOS_PATH, label: "Servicios suspendidos", count: servicesSuspendedCount, subtitle: servicesSuspendedCount === 1 ? "suspendido" : "suspendidos", icon: PauseCircle },
    { href: ESCRITORIO_TICKETS_PATH, label: "Tickets", count: supportTicketsCount, subtitle: supportTicketsCount === 1 ? "activo" : "activos", icon: MessageSquare },
    { href: ESCRITORIO_DOMINIOS_PATH, label: "Dominios", count: dominiosCount, subtitle: "dominios", icon: Globe },
  ];

  return (
    <div className="space-y-14 sm:space-y-16">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Escritorio
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Centro de control. Proyectos, servicios, tickets, dominios y billetera.
        </p>
      </section>

      {saldoPendiente > 0 && (
        <section>
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900 dark:border-amber-500/60 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  Tienes pagos pendientes con la agencia.
                </p>
                <p className="text-xs sm:text-sm">
                  Monto pendiente aproximado:{" "}
                  <span className="font-semibold">
                    USD {saldoPendiente.toFixed(2)}
                  </span>
                  . Puedes ver el detalle y pagar desde la sección de pagos.
                </p>
              </div>
              <Link
                href={ESCRITORIO_PAGOS_PATH}
                className="inline-flex items-center justify-center rounded-full border border-amber-400 bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-200 dark:border-amber-500/80 dark:bg-amber-900/40 dark:text-amber-50"
              >
                Ver pagos pendientes
              </Link>
            </div>
          </div>
        </section>
      )}

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Resumen
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
          {cards.map(({ href, label, count, subtitle, icon: Icon }) => (
            <Link
              key={href + label}
              href={href}
              className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-[var(--muted)] p-3">
                  <Icon className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
                  {count}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {subtitle}
                </p>
              </div>
            </Link>
          ))}

          <WalletCard balance={wallet.balance} />
        </div>
      </section>
    </div>
  );
}
