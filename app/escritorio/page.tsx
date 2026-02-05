import Link from "next/link";
import { getMyTickets, getTicketTypes } from "@/lib/actions/tickets";
import { ESCRITORIO_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { DemoTicketButton } from "@/app/escritorio/components/demo-ticket-button";
import { Ticket, UtensilsCrossed } from "lucide-react";

export default async function EscritorioPage() {
  const [tickets, types] = await Promise.all([getMyTickets(), getTicketTypes()]);
  const pendientes = tickets.filter((t) => !t.usedAt).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Escritorio
        </h1>
        <p className="mt-1 text-zinc-600">
          Gestiona tus tickets de comedor universitario
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            <Button variant="outline" size="sm">
              Ver mis tickets
            </Button>
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <UtensilsCrossed className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">
                Tipos disponibles
              </p>
              <p className="text-2xl font-bold text-black">
                {types.length}
              </p>
            </div>
          </div>
          <Link href={`${ESCRITORIO_PATH}/comprar`} className="mt-4 block">
            <Button size="sm" className="bg-black text-white hover:bg-zinc-800">Comprar ticket</Button>
          </Link>
        </div>
      </div>

      {tickets.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-zinc-600">
            Aún no tienes tickets. Compra tu primer ticket para el comedor o genera uno de ejemplo.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href={`${ESCRITORIO_PATH}/comprar`}>
              <Button className="bg-black text-white hover:bg-zinc-800">Comprar ticket</Button>
            </Link>
            <DemoTicketButton />
          </div>
        </div>
      )}
    </div>
  );
}
