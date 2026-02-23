import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Link } from "@/components/link";
import { ADMIN_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditTicketTypeForm } from "../edit-ticket-type-form";

export default async function AdminEditPlatoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const { id } = await params;
  const plato = await db.ticketType.findUnique({
    where: { id },
  });

  if (!plato) {
    redirect(`${ADMIN_PATH}/almuerzos`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`${ADMIN_PATH}/almuerzos`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-black">Editar plato</h1>
        <p className="mt-1 text-zinc-600">{plato.name}</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <EditTicketTypeForm
          plato={{
            id: plato.id,
            name: plato.name,
            category: plato.category,
            lugar: plato.lugar,
            price: Number(plato.price),
            description: plato.description,
            image: plato.image,
            availableForDate: plato.availableForDate,
            maxQuantity: plato.maxQuantity,
            active: plato.active,
          }}
        />
      </div>
    </div>
  );
}
