import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ADMIN_PATH } from "@/routes";
import { getAdminTicketTypes, getTicketForAdminEdit } from "@/lib/actions/tickets";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditTicketForm } from "../edit-ticket-form";

export default async function AdminEditTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const { id } = await params;
  const [ticket, types] = await Promise.all([
    getTicketForAdminEdit(id),
    getAdminTicketTypes(),
  ]);

  if (!ticket) {
    redirect(`${ADMIN_PATH}/tickets`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`${ADMIN_PATH}/tickets`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-black">Editar ticket</h1>
        <p className="mt-1 text-zinc-600">
          Ajusta el plato, la fecha y datos de pago de este ticket.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <EditTicketForm
          ticket={ticket}
          types={types.map((t) => ({ id: t.id, name: t.name }))}
        />
      </div>
    </div>
  );
}

