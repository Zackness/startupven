"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteTicketAdmin } from "@/lib/actions/tickets";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteTicketButton({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm("¿Seguro que deseas eliminar este ticket?");
    if (!ok) return;

    try {
      setLoading(true);
      await deleteTicketAdmin(ticketId);
      toast.success("Ticket eliminado");
      router.refresh();
    } catch (e) {
      toast.error("No se pudo eliminar el ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="gap-1 text-red-700 hover:text-red-700 border-red-200 hover:bg-red-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Eliminar
    </Button>
  );
}

