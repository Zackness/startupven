"use strict";
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { approveTicket } from "@/lib/actions/tickets";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

export function ApproveButton({ ticketId }: { ticketId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleApprove = async () => {
        try {
            setLoading(true);
            await approveTicket(ticketId);
            toast.success("Pago aprobado");
            router.refresh();
        } catch (e) {
            toast.error("Error al aprobar pago");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleApprove}
            disabled={loading}
            className="gap-2 text-white hover:text-white bg-blue-800 hover:bg-blue-600"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Check className="h-4 w-4" />
            )}
            Aprobar
        </Button>
    );
}
