import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Link } from "@/components/link";
import { ADMIN_PATH } from "@/routes";
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
      cedula: true,
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
    <div className="space-y-12 sm:space-y-14">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`${ADMIN_PATH}/usuarios`}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a usuarios
          </Link>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Editar
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {target.name || target.email}
          </h1>
          <p className="mt-1 text-[15px] text-[var(--muted-foreground)]">
            {target.email}
          </p>
        </div>
      </section>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <EditUserForm user={target} />
      </div>
    </div>
  );
}
