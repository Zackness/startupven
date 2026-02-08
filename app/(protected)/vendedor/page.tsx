import { getTicketTypes, getUsersForManualSale } from "@/lib/actions/tickets";
import { ManualSaleForm } from "./manual-sale-form";

export default async function VendedorPage() {
  const [types, users] = await Promise.all([getTicketTypes(), getUsersForManualSale()]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Panel de vendedor</h1>
        <p className="mt-1 text-zinc-600">Herramientas para operaciones de venta/canje.</p>
      </div>

      <ManualSaleForm
        users={users}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}

