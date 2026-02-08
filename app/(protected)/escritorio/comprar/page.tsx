import { getTicketTypes } from "@/lib/actions/tickets";
import { BuyTicketForm } from "./buy-ticket-form";
import { DemoTicketButton } from "@/app/(protected)/escritorio/components/demo-ticket-button";

export default async function ComprarPage() {
  const types = await getTicketTypes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Comprar ticket
        </h1>
        <p className="mt-1 text-zinc-600">
          Elige el tipo de ticket y la fecha para la que lo deseas. También puedes generar una compra de ejemplo.
        </p>
      </div>

      {types.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-white p-6">
          <p className="text-amber-800">
            No hay tipos de ticket disponibles. Crea tipos en el panel admin o usa compra de ejemplo desde el escritorio.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="mb-3 text-sm text-zinc-600">
              ¿Quieres ver un ejemplo rápido? Genera un ticket de demostración (compra ficticia).
            </p>
            <DemoTicketButton />
          </div>
          <BuyTicketForm types={types} />
        </>
      )}
    </div>
  );
}
