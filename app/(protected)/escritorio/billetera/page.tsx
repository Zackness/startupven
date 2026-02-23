import { getWalletBalance } from "@/lib/actions/wallet";
import { WithdrawForm } from "@/app/(protected)/escritorio/billetera/withdraw-form";

function txLabel(type: string): string {
  switch (type) {
    case "DEPOSITO":
      return "Ingreso";
    case "RETIRO":
      return "Retiro";
    case "COMPRA":
      return "Compra";
    case "REEMBOLSO":
      return "Reembolso";
    default:
      return type;
  }
}

export default async function WalletPage() {
  const { balance, transactions } = await getWalletBalance();

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Billetera
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Ingresos por pagos en tus páginas. Retira el saldo cuando quieras a tu cuenta bancaria.
        </p>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-shadow hover:shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Saldo</p>
            <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
              USD {balance.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Ingresos disponibles para retirar</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Retirar saldo
            </h3>
            <p className="mt-2 mb-6 text-[15px] text-[var(--muted-foreground)] leading-relaxed">
              Solicita el retiro a tu cuenta. El equipo procesará la transferencia.
            </p>
            <WithdrawForm balance={balance} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h3 className="font-semibold text-[var(--foreground)]">Movimientos</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {transactions.length === 0 ? (
              <div className="px-6 py-14 text-center text-[15px] text-[var(--muted-foreground)]">
                No hay movimientos recientes.
              </div>
            ) : (
              transactions.map((tx: { id: string; amount: number; type: string; reference: string | null; createdAt: Date }) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {txLabel(tx.type)}
                    </p>
                    {tx.reference && (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(tx.createdAt).toLocaleDateString("es-VE")} · {tx.reference}
                      </p>
                    )}
                    {!tx.reference && (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(tx.createdAt).toLocaleDateString("es-VE")}
                      </p>
                    )}
                  </div>
                  <span
                    className={`font-semibold tabular-nums ${
                      tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--foreground)]"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""} USD {tx.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
