import { Link } from "@/components/link";
import { auth } from "@/lib/auth";
import {
  getSupportTicketWithMessages,
  deleteSupportTicket,
} from "@/lib/actions/support-tickets";
import { notFound } from "next/navigation";
import { AdminReplyForm } from "./admin-reply-form";
import { StatusForm } from "./status-form";
import { AllowClientReplyToggle } from "./allow-client-reply-toggle";

const ESTADO_LABEL: Record<string, string> = {
  ABIERTO: "Abierto",
  EN_PROCESO: "En proceso",
  ESPERANDO_CLIENTE: "En espera del cliente",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
};

export default async function AdminSoporteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, ticket] = await Promise.all([
    auth(),
    getSupportTicketWithMessages(id),
  ]);
  if (!ticket) notFound();
  const isAdmin = (session?.user as unknown as { role?: string })?.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/soporte"
            className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            ← Volver a soporte
          </Link>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            {ticket.subject}
          </h1>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Cliente: {ticket.userName} ({ticket.userEmail}) · Creado{" "}
            {new Date(ticket.createdAt).toLocaleString("es-ES")} ·{" "}
            {ESTADO_LABEL[ticket.status] ?? ticket.status}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusForm ticketId={id} currentStatus={ticket.status} />
          {ticket.status !== "CERRADO" && (
            <AllowClientReplyToggle ticketId={id} allowClientReply={ticket.allowClientReply} />
          )}
          {isAdmin && (
            <form
              action={deleteSupportTicket.bind(null, id)}
              className="shrink-0"
              onSubmit={(e) => {
                if (!confirm("¿Eliminar este ticket? Esta acción no se puede deshacer.")) {
                  e.preventDefault();
                }
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                Eliminar ticket
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {ticket.messages.map((m) => {
          const isClient = m.authorRole === "CLIENTE";
          return (
          <div
            key={m.id}
            className={
              isClient
                ? "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
                : "rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-950/30 sm:p-5"
            }
          >
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              {m.userName} · {m.authorLabel}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">
              {m.body}
            </p>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {new Date(m.createdAt).toLocaleString("es-ES")}
            </p>
          </div>
          );
        })}
      </div>

      {ticket.status !== "CERRADO" && <AdminReplyForm ticketId={id} />}
    </div>
  );
}
