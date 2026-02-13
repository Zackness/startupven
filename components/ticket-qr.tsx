"use client";

import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

/** Botón para abrir el QR del ticket en grande (p. ej. en listado del vendedor para pasarlo al cliente/invitado). */
export function TicketQRViewButton({ ticketId }: { ticketId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5 border-zinc-300 text-zinc-700 hover:bg-zinc-50">
          <QrCode className="h-4 w-4" />
          Ver QR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm border-zinc-200 bg-white text-black">
        <DialogHeader>
          <DialogTitle>Código QR del ticket</DialogTitle>
          <DialogDescription>
            Puedes mostrar este QR en grande al cliente o invitado para que lo use al canjear. Útil si no tiene cuenta en el sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-6">
          <QRCodeSVG
            value={ticketId}
            size={280}
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
