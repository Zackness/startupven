"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMyTickets } from "@/lib/actions/tickets";

const POLL_INTERVAL_MS = 12_000;

type TicketStatus = "CANJEADO" | "VENCIDO" | "DISPONIBLE" | "PENDIENTE_PAGO";

export function TicketCanjeadoNotifier({
  initialTickets,
}: {
  initialTickets: { id: string; status: TicketStatus }[];
}) {
  const router = useRouter();
  const statusByIdRef = useRef<Map<string, TicketStatus>>(new Map());
  const isMountedRef = useRef(true);

  useEffect(() => {
    initialTickets.forEach((t) => statusByIdRef.current.set(t.id, t.status));
    isMountedRef.current = true;

    const interval = setInterval(async () => {
      if (!isMountedRef.current) return;
      try {
        const tickets = await getMyTickets();
        const prev = statusByIdRef.current;
        let anyCanjeado = false;
        for (const t of tickets) {
          const prevStatus = prev.get(t.id);
          if (t.status === "CANJEADO" && prevStatus !== "CANJEADO") {
            anyCanjeado = true;
            break;
          }
        }
        tickets.forEach((t) => statusByIdRef.current.set(t.id, t.status));

        if (anyCanjeado) {
          toast.success("Tu ticket fue aprobado", {
            description: "Tu comida fue canjeada correctamente. ¡Buen provecho!",
            duration: 6000,
          });
          router.refresh();
        }
      } catch {
        // Silently ignore (e.g. session expired)
      }
    }, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [initialTickets, router]);

  return null;
}
