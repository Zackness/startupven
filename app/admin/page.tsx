import { getAdminStats } from "@/lib/actions/tickets";
import Link from "next/link";
import { ADMIN_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { Ticket, CalendarDays, UtensilsCrossed } from "lucide-react";

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Panel de administración
        </h1>
        <p className="mt-1 text-zinc-600">
          Comedor universitario — venta y control de tickets
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-zinc-100 p-2">
              <Ticket className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">
                Total tickets
              </p>
              <p className="text-2xl font-bold text-black">
                {stats.totalTickets}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <CalendarDays className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">
                Tickets hoy
              </p>
              <p className="text-2xl font-bold text-black">
                {stats.ticketsToday}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <UtensilsCrossed className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">
                Tipos activos
              </p>
              <p className="text-2xl font-bold text-black">
                {stats.ticketTypesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href={`${ADMIN_PATH}/tickets`}>
          <Button className="bg-black text-white hover:bg-zinc-800">Ver todos los tickets</Button>
        </Link>
        <Link href={`${ADMIN_PATH}/tipos`}>
          <Button variant="outline" className="border-zinc-300 text-black hover:bg-zinc-50">Gestionar tipos de ticket</Button>
        </Link>
        <Link href={`${ADMIN_PATH}/usuarios`}>
          <Button variant="outline" className="border-zinc-300 text-black hover:bg-zinc-50">Administrar usuarios</Button>
        </Link>
      </div>
    </div>
  );
}
