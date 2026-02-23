"use client";

import { useActionState } from "react";
import { addSupportTicketMessage } from "@/lib/actions/support-tickets";

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      return addSupportTicketMessage(ticketId, formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
      <label htmlFor="body" className="block text-sm font-medium text-[var(--foreground)]">
        Añadir respuesta
      </label>
      <textarea
        id="body"
        name="body"
        required
        rows={4}
        placeholder="Escribe tu mensaje..."
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
      >
        Enviar
      </button>
    </form>
  );
}
