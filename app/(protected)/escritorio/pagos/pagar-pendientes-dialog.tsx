"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { reportPayment } from "@/lib/actions/wallet-reports";
import { toast } from "sonner";

type PendingReport = {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  bank: string | null;
  createdAt: string;
};

export function PagarPendientesDialog({
  saldoPendiente,
  pendingReports,
}: {
  saldoPendiente: number;
  pendingReports: PendingReport[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [method, setMethod] = useState<"PAGO_MOVIL" | "STRIPE">("PAGO_MOVIL");
  const [monto, setMonto] = useState<string>("");
  const [bank, setBank] = useState("");
  const [reference, setReference] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saldoPendiente <= 0) return;

    const raw = parseFloat(monto.replace(",", "."));
    if (isNaN(raw) || raw <= 0) {
      toast.error("Indica un monto válido para pagar.");
      return;
    }
    const amount = Math.min(raw, saldoPendiente);

    setPending(true);
    try {
      await reportPayment(amount, bank || "", reference, method);
      toast.success("Pago reportado. Espera la aprobación del administrador.");
      setOpen(false);
      setMonto("");
      setBank("");
      setReference("");
    } catch {
      toast.error("Error al reportar pago");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
        >
          Pagar pendientes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]">
        <DialogHeader>
          <DialogTitle>Pagar montos pendientes</DialogTitle>
          <DialogDescription className="text-[var(--muted-foreground)]">
            Aquí puedes pagar todo o una parte del monto pendiente que tienes con la agencia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/10 p-3 text-sm">
            <p className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Saldo total contratado</span>
              <span className="font-semibold text-[var(--foreground)]">—</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Pagado y aprobado</span>
              <span className="font-semibold text-[var(--foreground)]">—</span>
            </p>
            <p className="mt-2 flex justify-between text-sm font-semibold">
              <span className="text-[var(--foreground)]">Saldo pendiente por pagar</span>
              <span className="text-[var(--foreground)]">
                USD {saldoPendiente.toFixed(2)}
              </span>
            </p>
          </div>

          {pendingReports.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Pagos reportados en proceso
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                {pendingReports.map((r) => (
                  <li key={r.id} className="flex justify-between gap-3">
                    <span className="text-[var(--foreground)]">
                      USD {r.amount.toFixed(2)} · {r.method === "PAGO_MOVIL" ? "Pago móvil" : "Tarjeta"}
                      {r.bank ? ` · ${r.bank}` : ""}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {new Date(r.createdAt).toLocaleDateString("es-VE", { dateStyle: "short" })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {saldoPendiente <= 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              No tienes saldo pendiente por pagar en este momento.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="monto-pagar">Monto a pagar ahora (USD)</Label>
                <Input
                  id="monto-pagar"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={saldoPendiente}
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="mt-1 border-[var(--border)] bg-[var(--background)]"
                  placeholder={`Hasta USD ${saldoPendiente.toFixed(2)}`}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={method === "PAGO_MOVIL" ? "default" : "outline"}
                  onClick={() => setMethod("PAGO_MOVIL")}
                  className="flex-1 border-[var(--border)]"
                >
                  Pago móvil / Transferencia
                </Button>
                <Button
                  type="button"
                  variant={method === "STRIPE" ? "default" : "outline"}
                  onClick={() => setMethod("STRIPE")}
                  className="flex-1 border-[var(--border)]"
                >
                  Tarjeta / Stripe
                </Button>
              </div>

              {method === "PAGO_MOVIL" && (
                <>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Realiza el pago móvil a los datos indicados por la agencia y coloca aquí el banco emisor y la
                    referencia.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="bank-pago">Banco emisor</Label>
                      <Input
                        id="bank-pago"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="mt-1 border-[var(--border)] bg-[var(--background)]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ref-pago">Referencia</Label>
                      <Input
                        id="ref-pago"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="mt-1 border-[var(--border)] bg-[var(--background)]"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {method === "STRIPE" && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  Para pagar con tarjeta, realiza el pago en el enlace que te indique la agencia y coloca aquí el ID
                  de transacción.
                </p>
              )}

              {method === "STRIPE" && (
                <div>
                  <Label htmlFor="ref-stripe">ID de pago</Label>
                  <Input
                    id="ref-stripe"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="mt-1 border-[var(--border)] bg-[var(--background)]"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
              >
                {pending ? "Enviando…" : "Reportar pago de pendiente"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

