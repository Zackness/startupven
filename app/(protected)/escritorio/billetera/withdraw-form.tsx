"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestWithdrawal } from "@/lib/actions/withdrawal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WithdrawFormProps {
  balance: number;
}

export function WithdrawForm({ balance }: WithdrawFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = new FormData(e.currentTarget);
    const amount = parseFloat(form.get("amount") as string);
    const bankName = form.get("bankName") as string;
    const bankAccount = form.get("bankAccount") as string;

    try {
      await requestWithdrawal(amount, bankName, bankAccount);
      toast.success("Solicitud de retiro enviada. Se procesará en breve.");
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al solicitar retiro");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
          disabled={balance <= 0}
        >
          Retirar saldo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar retiro</DialogTitle>
          <DialogDescription>
            Indica el monto y los datos bancarios donde quieres recibir el dinero. El equipo procesará tu solicitud.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Monto a retirar</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              min={0.01}
              max={balance}
              placeholder={`Máx. ${balance.toFixed(2)}`}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Disponible: USD {balance.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="bankName">Banco (opcional)</Label>
            <Input id="bankName" name="bankName" placeholder="Ej. Banesco, Mercantil" />
          </div>

          <div>
            <Label htmlFor="bankAccount">Cuenta o datos bancarios</Label>
            <Input
              id="bankAccount"
              name="bankAccount"
              required
              placeholder="Número de cuenta, cédula, teléfono Pago Móvil..."
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)]"
            disabled={pending}
          >
            {pending ? "Enviando..." : "Solicitar retiro"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
