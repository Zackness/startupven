import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ESCRITORIO_PARA_PATH } from "@/routes";
import { FileText, Globe, MessageSquare, CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";

function fullName(u: {
  name: string | null;
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
}) {
  if (u.primerNombre || u.primerApellido) {
    const parts = [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido].filter(Boolean);
    return parts.join(" ") || u.name || "—";
  }
  return u.name || "—";
}

export default async function EscritorioParaPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role ?? null;
  if (role !== "EDITOR" && role !== "ADMIN") redirect("/escritorio");

  const { userId } = await params;
  const client = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
    },
  });
  if (!client) redirect("/agency/clientes");

  const basePath = `${ESCRITORIO_PARA_PATH}/${userId}`;
  const clientName = fullName(client);

  return (
    <div className="space-y-14 sm:space-y-16">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Escritorio de {clientName}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
          Gestiona proyectos, dominios, calendario editorial y tickets de este cliente.
        </p>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Accesos rápidos
        </p>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <Link
            href={`${basePath}/proyectos`}
            className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <FileText className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Proyectos</p>
              <p className="mt-2 text-[15px] text-[var(--foreground)]">Facturación y proyectos del cliente</p>
            </div>
          </Link>

          <Link
            href={`${basePath}/dominios`}
            className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <Globe className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Dominios</p>
              <p className="mt-2 text-[15px] text-[var(--foreground)]">Dominios del cliente</p>
            </div>
          </Link>

          <Link
            href={`${basePath}/calendario-editorial`}
            className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <CalendarDays className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Calendario editorial</p>
              <p className="mt-2 text-[15px] text-[var(--foreground)]">Publicaciones y programación RRSS</p>
            </div>
          </Link>

          <Link
            href={`${basePath}/tickets`}
            className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <MessageSquare className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Tickets</p>
              <p className="mt-2 text-[15px] text-[var(--foreground)]">Tickets de modificación</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
