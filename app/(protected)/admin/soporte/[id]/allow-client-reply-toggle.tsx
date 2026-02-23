"use client";

import { useTransition } from "react";
import { updateSupportTicketAllowClientReply } from "@/lib/actions/support-tickets";

export function AllowClientReplyToggle({
  ticketId,
  allowClientReply,
}: {
  ticketId: string;
  allowClientReply: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]">
      <input
        type="checkbox"
        checked={allowClientReply}
        disabled={isPending}
        onChange={(e) => {
          startTransition(() => {
            updateSupportTicketAllowClientReply(ticketId, e.target.checked);
          });
        }}
        className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)]"
      />
      <span>Permitir respuesta del cliente</span>
    </label>
  );
}
