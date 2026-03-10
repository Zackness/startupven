import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { getSupportTicketsForClient } from "@/lib/actions/support-tickets";
import { cn } from "@/lib/utils";
import { ESCRITORIO_PARA_PATH } from "@/routes";

const ESTADO_LABEL: Record<string, string> = {
  ABIERTO: "Abierto",
  EN_PROCESO: "En proceso",
  ESPERANDO_CLIENTE: "En espera de tu respuesta",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
};

export default async function ParaTicketsPage({
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
    select: { id: true },
  });
  if (!client) redirect("/agency/clientes");

  const tickets = await getSupportTicketsForClient(userId);
  const basePath = `${ESCRITORIO_PARA_PATH}/${userId}`;

  return (
    <div className="space-y-12 sm:space-y-14">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Tickets de soporte
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
            Tickets de este cliente. Seguimiento y respuestas.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
            <p className="text-[15px] text-[var(--muted-foreground)]">
              No hay tickets.
            </p>
          </div>
        ) : (
          tickets.map((t) => (
            <Link
              key={t.id}
              href={`${basePath}/tickets/${t.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--foreground)]/10 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--foreground)]">{t.subject}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t.messageCount} mensaje{t.messageCount !== 1 ? "s" : ""} · Actualizado{" "}
                  {new Date(t.updatedAt).toLocaleDateString("es-ES")}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded px-2 py-0.5 text-xs font-medium",
                  t.status === "ABIERTO" &&
                    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                  t.status === "EN_PROCESO" &&
                    "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
                  t.status === "RESUELTO" &&
                    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                  t.status === "CERRADO" &&
                    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}
              >
                {ESTADO_LABEL[t.status] ?? t.status}
              </span>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
