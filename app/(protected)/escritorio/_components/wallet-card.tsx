"use client";

import { Link } from "@/components/link";
import { Wallet, ArrowRight } from "lucide-react";
import { ESCRITORIO_PATH } from "@/routes";

interface WalletCardProps {
  balance: number;
}

/**
 * Billetera tipo Stripe Connect: saldo = ingresos de pagos en páginas del cliente.
 * Estilo coherente con el resto del dashboard (Vercel-like).
 */
export function WalletCard({ balance }: WalletCardProps) {
  return (
    <Link
      href={`${ESCRITORIO_PATH}/billetera`}
      className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-[var(--muted)] p-3">
          <Wallet className="h-6 w-6 text-[var(--foreground)]" />
        </div>
        <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Billetera
        </p>
        <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
          USD {balance.toFixed(2)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Ingresos disponibles para retirar
        </p>
      </div>
    </Link>
  );
}
