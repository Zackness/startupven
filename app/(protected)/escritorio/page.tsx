import Link from "next/link";
import { getWalletBalance } from "@/lib/actions/wallet";
import {
  ESCRITORIO_PATH,
  ESCRITORIO_PROYECTOS_PATH,
  ESCRITORIO_DOMINIOS_PATH,
  ESCRITORIO_TICKETS_PATH,
} from "@/routes";
import { FileText, Globe, MessageSquare, Wallet, ArrowRight } from "lucide-react";
import { WalletCard } from "./_components/wallet-card";
import { MOCK_PROYECTOS, MOCK_DOMINIOS, MOCK_TICKETS } from "./_components/escritorio-mock-data";

export default async function EscritorioPage() {
  const wallet = await getWalletBalance();
  const proyectosPendientes = MOCK_PROYECTOS.filter(
    (p) => p.estado === "pendiente" || p.estado === "vencido" || p.estado === "parcial"
  ).length;
  const dominiosPendientes = MOCK_DOMINIOS.filter((d) => d.estado === "pendiente_pago" || d.estado === "vencido").length;
  const ticketsAbiertos = MOCK_TICKETS.filter((t) => t.estado === "abierto" || t.estado === "en_proceso").length;

  const totalPendientes = proyectosPendientes + dominiosPendientes;
  const tienePendientes = totalPendientes > 0;

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* Hero — autoridad, claridad (identidad STARTUPVEN) */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Escritorio
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Centro de control. Proyectos, dominios, tickets de modificación y billetera.
        </p>
        {/* Estado: claridad estratégica, sin ruido */}
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {tienePendientes ? (
            <>
              <span className="font-medium text-[var(--foreground)]">{totalPendientes} pendiente{totalPendientes !== 1 ? "s" : ""}</span>
              {" · "}
              {proyectosPendientes > 0 && `${proyectosPendientes} factura${proyectosPendientes !== 1 ? "s" : ""}`}
              {proyectosPendientes > 0 && dominiosPendientes > 0 && " · "}
              {dominiosPendientes > 0 && `${dominiosPendientes} dominio${dominiosPendientes !== 1 ? "s" : ""}`}
            </>
          ) : (
            <span className="text-[var(--muted-foreground)]">Todo al día</span>
          )}
        </p>
      </section>

      {/* Acción recomendada — directo, propósito claro (solo si hay pendientes) */}
      {tienePendientes && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Acción recomendada
          </p>
          <p className="mt-1 text-[15px] text-[var(--foreground)]">
            {proyectosPendientes > 0 ? (
              <Link href={ESCRITORIO_PROYECTOS_PATH} className="font-medium underline underline-offset-2 hover:no-underline">
                Revisar facturación pendiente
              </Link>
            ) : dominiosPendientes > 0 ? (
              <Link href={ESCRITORIO_DOMINIOS_PATH} className="font-medium underline underline-offset-2 hover:no-underline">
                Renovar o pagar dominios
              </Link>
            ) : null}
          </p>
        </section>
      )}

      {/* Resumen — etiqueta de sección, jerarquía estructurada */}
      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Resumen
        </p>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        {/* Proyectos */}
        <Link
          href={ESCRITORIO_PROYECTOS_PATH}
          className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-[var(--muted)] p-3">
              <FileText className="h-6 w-6 text-[var(--foreground)]" />
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Proyectos
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
              {proyectosPendientes}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              pendiente{proyectosPendientes !== 1 ? "s" : ""} de pago
            </p>
          </div>
        </Link>

        {/* Dominios */}
        <Link
          href={ESCRITORIO_DOMINIOS_PATH}
          className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-[var(--muted)] p-3">
              <Globe className="h-6 w-6 text-[var(--foreground)]" />
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Dominios
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
              {dominiosPendientes}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              por pagar
            </p>
          </div>
        </Link>

        {/* Tickets */}
        <Link
          href={ESCRITORIO_TICKETS_PATH}
          className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-[var(--muted)] p-3">
              <MessageSquare className="h-6 w-6 text-[var(--foreground)]" />
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Tickets
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
              {ticketsAbiertos}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              activo{ticketsAbiertos !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>

        <WalletCard balance={wallet.balance} />
        </div>
      </section>
    </div>
  );
}
