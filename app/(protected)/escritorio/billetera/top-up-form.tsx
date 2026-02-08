"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reportPayment } from "@/lib/actions/wallet-reports";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function TopUpForm() {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [method, setMethod] = useState<"PAGO_MOVIL" | "STRIPE">("PAGO_MOVIL");

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        const form = new FormData(e.currentTarget);
        const amount = parseFloat(form.get("amount") as string);
        const bank = form.get("bank") as string;
        const reference = form.get("reference") as string;

        try {
            await reportPayment(amount, bank || "", reference, method);
            toast.success("Pago reportado. Espera la aprobación del administrador.");
            setOpen(false);
        } catch (error) {
            toast.error("Error al reportar pago");
        } finally {
            setPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-800 text-white hover:bg-blue-700">Recargar Saldo</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Recargar Billetera</DialogTitle>
                    <DialogDescription>
                        Realiza un pago móvil a los datos indicados y reportalo aquí.
                        <br />
                        <span className="font-bold text-black">0412-1234567 | V-12345678 | Banco Mercantil</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={method === "PAGO_MOVIL" ? "default" : "outline"}
                        onClick={() => setMethod("PAGO_MOVIL")}
                        className="flex-1 bg-blue-800 text-white hover:text-white hover:bg-blue-700 data-[state=inactive]:bg-white data-[state=inactive]:text-white"
                    >
                        Pago Móvil
                    </Button>
                    <Button
                        type="button"
                        variant={method === "STRIPE" ? "default" : "outline"}
                        onClick={() => setMethod("STRIPE")}
                        className="flex-1 bg-blue-800 text-white hover:text-white hover:bg-blue-700"
                    >
                        Stripe / PayPal
                    </Button>
                </div>

                {method === "STRIPE" && (
                    <div className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-600">
                        <p>Para recargar con Stripe o PayPal, realiza el pago en el siguiente enlace y coloca el ID de transacción abajo:</p>
                        <a href="#" className="mt-1 block font-medium text-blue-600 underline">Enlace de Pago (Simulado)</a>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="amount">Monto (Ref)</Label>
                        <Input id="amount" name="amount" type="number" step="0.01" required min="0.01" />
                    </div>

                    {method === "PAGO_MOVIL" && (
                        <div>
                            <Label htmlFor="bank">Banco Emisor</Label>
                            <Input id="bank" name="bank" required placeholder="Ej. Banesco" />
                        </div>
                    )}

                    <div>
                        <Label htmlFor="reference">{method === "PAGO_MOVIL" ? "Referencia (4 últimos dígitos)" : "ID de Transacción"}</Label>
                        <Input id="reference" name="reference" required placeholder={method === "PAGO_MOVIL" ? "Ej. 1234" : "Ej. ch_3L..."} />
                    </div>
                    <Button type="submit" className="w-full bg-blue-800 text-white" disabled={pending}>
                        {pending ? "Enviando..." : "Reportar Pago"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
