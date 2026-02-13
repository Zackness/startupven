"use client";

import { useState, useCallback } from "react";
import { QRScanner } from "@/components/qr-scanner";
import { ScanResultPanel, type TicketScanInfo } from "@/components/scan-result-panel";
import { getTicketByIdForScan, markTicketUsed } from "@/lib/actions/tickets";
import { getTodayStartUTC } from "@/lib/utils";
import { toast } from "sonner";

export function EscaneoQRPage() {
  const [ticket, setTicket] = useState<TicketScanInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResult = useCallback(async (ticketId: string) => {
    setError(null);
    setLoading(true);
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
      const canAutoMark =
        data.paymentStatus === "PAGADO" && !usedAt && !isExpired;

      const ticketInfo: TicketScanInfo = {
        ...data,
        mealDate,
        usedAt,
      };

      if (canAutoMark) {
        await markTicketUsed(data.id);
        setTicket({ ...ticketInfo, usedAt: new Date() });
        toast.success("¡Escaneo exitoso!", {
          description: "El ticket fue canjeado correctamente. El cliente verá la actualización en su pantalla.",
          duration: 4500,
        });
      } else {
        setTicket(ticketInfo);
        if (usedAt) {
          toast.success("¡Escaneo exitoso!", {
            description: "Este ticket ya estaba canjeado.",
            duration: 4000,
          });
        } else {
          toast.success("Ticket leído", { duration: 3000 });
        }
      }
    } catch {
      setTicket(null);
      setError("Error al consultar el ticket.");
      toast.error("Error al consultar", { duration: 4000 });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
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
            Un escaneo marca el ticket como canjeado. No se puede canjear dos veces.
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
