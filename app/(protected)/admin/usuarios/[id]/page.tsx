import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ADMIN_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditUserForm } from "../edit-user-form";

export default async function AdminEditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN") redirect("/escritorio");

  const { id } = await params;
  const target = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      gremio: true,
      cedula: true,
      expediente: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
    },
  });

  if (!target) {
    redirect(ADMIN_PATH + "/usuarios");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`${ADMIN_PATH}/usuarios`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-black">
          Editar usuario
        </h1>
        <p className="mt-1 text-zinc-600">
          {target.email}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <EditUserForm user={target} />
      </div>
    </div>
  );
}
