"use client";

import { useState, useCallback } from "react";
import { QRScanner } from "@/components/qr-scanner";
import { ScanResultPanel, type TicketScanInfo } from "@/components/scan-result-panel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTicketByIdForScan, markTicketUsed } from "@/lib/actions/tickets";
import { getTodayStartUTC } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function EscaneoQRPage() {
  const [ticket, setTicket] = useState<TicketScanInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  /** Si es true, al hacer clic en Aceptar se canjea el ticket (no se canjea al escanear). */
  const [canRedeemOnAccept, setCanRedeemOnAccept] = useState(false);

  const handleResult = useCallback(async (ticketId: string) => {
    setError(null);
    setLoading(true);
    setShowSuccessDialog(false);
    try {
      const data = await getTicketByIdForScan(ticketId);
      if (!data) {
        setTicket(null);
        setError("Ticket no encontrado o sin permiso.");
        toast.error("Ticket no encontrado");
        return;
      }
      const mealDate = new Date(data.mealDate);
      const usedAt = data.usedAt ? new Date(data.usedAt) : null;
      const todayStart = getTodayStartUTC();
      const isExpired = !usedAt && mealDate < todayStart;
      const canRedeem =
        data.paymentStatus === "PAGADO" && !usedAt && !isExpired;

      const ticketInfo: TicketScanInfo = {
        ...data,
        mealDate,
        usedAt,
      };

      setTicket(ticketInfo);
      setCanRedeemOnAccept(canRedeem);
      setShowSuccessDialog(true);
      if (!canRedeem) {
        if (usedAt) toast.info("Este ticket ya estaba canjeado.", { duration: 4000 });
        else if (isExpired) toast.info("Ticket vencido.", { duration: 4000 });
        else toast.info("Ticket leído.", { duration: 3000 });
      }
    } catch {
      setTicket(null);
      setError("Error al consultar el ticket.");
      toast.error("Error al consultar", { duration: 4000 });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAccept = useCallback(async () => {
    if (!ticket) {
      setShowSuccessDialog(false);
      return;
    }
    if (canRedeemOnAccept) {
      try {
        await markTicketUsed(ticket.id);
        setTicket((prev) => (prev ? { ...prev, usedAt: new Date() } : null));
        setCanRedeemOnAccept(false);
        toast.success("Ticket canjeado correctamente.", {
          description: "El cliente verá la actualización en su pantalla.",
          duration: 4500,
        });
      } catch {
        toast.error("No se pudo canjear el ticket.");
        return;
      }
    }
    setShowSuccessDialog(false);
  }, [ticket, canRedeemOnAccept]);

  return (
    <div className="space-y-6">
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent
          className="max-w-md sm:max-w-lg border-zinc-200 bg-white p-6 text-center sm:p-8"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-black sm:text-3xl">
              Escaneado con éxito
            </DialogTitle>
            <p className="mt-2 text-zinc-600">
              {canRedeemOnAccept
                ? "Revisa los datos y pulsa Aceptar para canjear el ticket."
                : "Datos del ticket. No se puede canjear (ya usado, vencido o pendiente de pago)."}
            </p>
          </DialogHeader>
          {ticket && (
            <div className="mt-4 text-left">
              <ScanResultPanel ticket={ticket} />
            </div>
          )}
          <div className="mt-6">
            <Button
              size="lg"
              className="w-full bg-black text-white hover:bg-zinc-800 sm:w-auto sm:min-w-[180px]"
              onClick={handleAccept}
            >
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-black">Cámara</h2>
          <p className="mb-3 text-sm text-zinc-600">
            Enfoca el código QR del ticket dentro del recuadro. Funciona en PC (webcam) y móvil (cámara trasera).
          </p>
          <QRScanner
            onResult={handleResult}
            className="aspect-square max-h-[min(80vmin,420px)] w-full"
          />
          {loading && (
            <p className="mt-2 text-sm text-zinc-500">Consultando ticket…</p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-black">Resultado</h2>
          <p className="mb-3 text-sm text-zinc-600">
            Al escanear se abre un diálogo con los datos. El ticket se canjea solo al pulsar Aceptar en ese diálogo.
          </p>
          {ticket ? (
            <ScanResultPanel ticket={ticket} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 py-16 text-center">
              <p className="text-sm text-zinc-500">
                Escanea un código QR para ver el ticket.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
