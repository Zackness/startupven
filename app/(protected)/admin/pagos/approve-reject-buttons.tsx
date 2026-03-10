"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { approvePaymentReport, rejectPaymentReport } from "@/lib/actions/wallet-reports";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";

export function ApprovePaymentButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleApprove() {
    try {
      setLoading(true);
      await approvePaymentReport(reportId);
      toast.success("Pago aprobado");
      router.refresh();
    } catch (e) {
      toast.error("Error al aprobar pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleApprove}
      disabled={loading}
      className="gap-2 border-[var(--border)] text-emerald-700 hover:text-emerald-700 dark:text-emerald-300"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      Aprobar
    </Button>
  );
}

export function RejectPaymentButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReject() {
    try {
      setLoading(true);
      await rejectPaymentReport(reportId);
      toast.success("Pago rechazado");
      router.refresh();
    } catch (e) {
      toast.error("Error al rechazar pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReject}
      disabled={loading}
      className="gap-2 border-[var(--border)] text-red-700 hover:text-red-700 dark:text-red-300"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      Rechazar
    </Button>
  );
}

