import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminTicketTypes, getUsersForManualSale } from "@/lib/actions/tickets";
import { AdminVentasPendientesForm } from "./admin-ventas-pendientes-form";
import { ADMIN_PATH } from "@/routes";

export default async function AdminVentasPendientesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect(ADMIN_PATH);

  const [types, users] = await Promise.all([getAdminTicketTypes(), getUsersForManualSale()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Ventas pendientes</h1>
        <p className="mt-1 text-zinc-600">
          Registro de ventas por corrección o que no se pudieron cargar a tiempo. Cualquier plato y cualquier fecha (incl. vencidas).
        </p>
      </div>

      <AdminVentasPendientesForm
        users={users}
        types={types.map((t) => ({ id: t.id, name: t.name, active: t.active }))}
      />
    </div>
  );
}
