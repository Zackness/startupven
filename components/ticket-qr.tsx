"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Código QR único por ticket. El valor codificado es el ID del ticket
 * para que al escanear se pueda canjear o verificar.
 *
 * Al hacer clic/tocar se abre en grande en un modal.
 */
export function TicketQR({ ticketId, size = 80 }: { ticketId: string; size?: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex flex-col items-center rounded-lg border border-zinc-200 bg-white p-2 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <QRCodeSVG
            value={ticketId}
            size={size}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            title={`Ticket ${ticketId}`}
          />
          <span className="mt-1 text-[10px] text-zinc-500">Toca para ver el QR</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Código QR del ticket</DialogTitle>
          <DialogDescription>
            Muéstralo al personal autorizado para canjear tu comida. Este código solo se puede usar una vez.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <QRCodeSVG
            value={ticketId}
            size={240}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            title={`Ticket ${ticketId}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
