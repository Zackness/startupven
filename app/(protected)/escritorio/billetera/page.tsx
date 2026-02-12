import { WalletCard } from "@/app/(protected)/escritorio/_components/wallet-card";
import { getWalletBalance } from "@/lib/actions/wallet";
import { TopUpForm } from "@/app/(protected)/escritorio/billetera/top-up-form";


export default async function WalletPage() {
    const { balance, transactions } = await getWalletBalance();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-black">Mi Billetera</h1>
                <p className="mt-1 text-zinc-600">
                    Gestiona tu saldo y revisa tus movimientos.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <WalletCard balance={balance} />
                    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 font-semibold text-black">Recargar Saldo</h3>
                        <p className="mb-4 text-sm text-zinc-600">
                            Agrega fondos a tu billetera mediante Pago Móvil para realizar compras rápidas.
                        </p>
                        <TopUpForm />
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
                    <div className="border-b border-zinc-100 p-4">
                        <h3 className="font-semibold text-black">Historial de Movimientos</h3>
                    </div>
                    <div className="divide-y divide-zinc-100">
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-sm text-zinc-500">
                                No hay movimientos recientes.
                            </div>
                        ) : (
                            transactions.map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="font-medium text-black">
                                            {tx.type === "DEPOSITO" && "Recarga de Saldo"}
                                            {tx.type === "COMPRA" && "Compra de Ticket"}
                                            {tx.type === "REEMBOLSO" && "Reembolso"}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(tx.createdAt).toLocaleDateString()} • {tx.reference}
                                        </p>
                                    </div>
                                    <span
                                        className={`font-bold ${tx.amount > 0 ? "text-green-600" : "text-black"
                                            }`}
                                    >
                                        {tx.amount > 0 ? "+" : ""}Bs. {tx.amount.toFixed(2)}
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
