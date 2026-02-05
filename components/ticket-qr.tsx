"use client";

import { QRCodeSVG } from "qrcode.react";

/**
 * Código QR único por ticket. El valor codificado es el ID del ticket
 * para que al escanear se pueda canjear o verificar.
 */
export function TicketQR({ ticketId, size = 80 }: { ticketId: string; size?: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-zinc-200 bg-white p-2">
      <QRCodeSVG
        value={ticketId}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#000000"
        title={`Ticket ${ticketId}`}
      />
      <span className="mt-1 text-[10px] text-zinc-500">QR del ticket</span>
    </div>
  );
}
