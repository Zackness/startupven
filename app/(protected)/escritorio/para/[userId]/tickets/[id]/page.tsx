import { getSupportTicketWithMessages } from "@/lib/actions/support-tickets";
import { notFound } from "next/navigation";
import { ReplyForm } from "@/app/(protected)/escritorio/tickets/[id]/reply-form";
import { BackToParaTickets } from "./back-link";

const ESTADO_LABEL: Record<string, string> = {
  ABIERTO: "Abierto",
  EN_PROCESO: "En proceso",
  ESPERANDO_CLIENTE: "En espera de tu respuesta",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
};

export default async function ParaTicketDetailPage({
  params,
}: {
  params: Promise<{ userId?: string; id: string }>;
}) {
  const p = await params;
  const id = p.id;
  const ticket = await getSupportTicketWithMessages(id);
  if (!ticket) notFound();

  const canReply = ticket.status !== "CERRADO" && ticket.allowClientReply;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <BackToParaTickets />
          <h1 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            {ticket.subject}
          </h1>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Creado {new Date(ticket.createdAt).toLocaleString("es-ES")} · {ESTADO_LABEL[ticket.status] ?? ticket.status}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {ticket.messages.map((m) => {
          const isClient = m.authorRole === "CLIENTE";
          return (
            <div
              key={m.id}
              className={`rounded-2xl border p-4 sm:p-5 ${
                isClient
                  ? "border-[var(--border)] bg-[var(--card)]"
                  : "border-sky-200 bg-sky-50/50 dark:border-sky-800 dark:bg-sky-950/30"
              }`}
            >
              <p className="text-xs font-medium text-[var(--muted-foreground)]">
                {m.userName} · {isClient ? "Cliente" : m.authorLabel}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">{m.body}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {new Date(m.createdAt).toLocaleString("es-ES")}
              </p>
            </div>
          );
        })}
      </div>

      {canReply && <ReplyForm ticketId={id} />}

      {ticket.status !== "CERRADO" && !ticket.allowClientReply && (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 px-4 py-3 text-sm text-[var(--muted-foreground)]">
          El equipo está revisando este ticket.
        </p>
      )}

      {ticket.status === "CERRADO" && (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 px-4 py-3 text-sm text-[var(--muted-foreground)]">
          Este ticket está cerrado.
        </p>
      )}
    </div>
  );
}
