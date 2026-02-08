import Link from "next/link";
import { getMyTickets, getTicketTypes, processExpiredTickets } from "@/lib/actions/tickets";
import { getWalletBalance } from "@/lib/actions/wallet";
import { ESCRITORIO_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { DemoTicketButton } from "@/app/(protected)/escritorio/components/demo-ticket-button";
import { Ticket } from "lucide-react";
import { MenuContainer } from "./_components/menu-container";
import { WalletCard } from "./_components/wallet-card";

export default async function EscritorioPage() {
  // 1. Process expired tickets (auto-refund)
  await processExpiredTickets();

  // 2. Fetch data
  const [tickets, types, wallet] = await Promise.all([
    getMyTickets(),
    getTicketTypes(),
    getWalletBalance(),
  ]);

  const pendientes = tickets.filter((t) => !t.usedAt).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Escritorio
        </h1>
        <p className="mt-1 text-zinc-600">
          Gestiona tus tickets y compras del comedor.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Tickets Pendientes */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-zinc-100 p-2">
              <Ticket className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">
                Tickets pendientes
              </p>
              <p className="text-2xl font-bold text-black">
                {pendientes}
              </p>
            </div>
          </div>
          <Link href={`${ESCRITORIO_PATH}/mis-tickets`} className="mt-4 block">
            <Button variant="outline" size="sm" className="bg-blue-800 text-white hover:bg-blue-600 hover:text-white w-full">
              Ver mis tickets
            </Button>
          </Link>
        </div>

        {/* Wallet Balance */}
        <WalletCard balance={wallet.balance} />
      </div>

      {/* Main Menu / Purchasing Area */}
      <div className="mt-8">
        <MenuContainer types={types} balance={wallet.balance} />
      </div>
    </div>
  );
}
