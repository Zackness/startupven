"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CrearProyectoDialog } from "./crear-proyecto-dialog";
import { createProjectFromEscritorioWithPayment } from "@/lib/actions/escritorio";
import { toast } from "sonner";
import type { PackageOption } from "./crear-proyecto-dialog";

export function ProyectosPageClient({ catalogPackages }: { catalogPackages: PackageOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const stripeReturnProcessed = useRef(false);

  useEffect(() => {
    const stripeDone = searchParams.get("stripe") === "done";
    const paymentIntentId = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");
    if (!stripeDone || !paymentIntentId || stripeReturnProcessed.current) return;

    if (redirectStatus && redirectStatus !== "succeeded") {
      toast.error(redirectStatus === "failed" ? "El pago no se completó. Intenta de nuevo o usa otro método." : "El pago está en proceso.");
      router.replace("/escritorio/proyectos");
      return;
    }

    (async () => {
      stripeReturnProcessed.current = true;
      try {
        const res = await fetch(
          `/api/escritorio/stripe-payload?payment_intent=${encodeURIComponent(paymentIntentId)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        const payload = data.payload;
        if (!payload) {
          toast.error("No se encontraron los datos del pago. Si ya pagaste, contacta a soporte.");
          router.replace("/escritorio/proyectos");
          return;
        }
        await createProjectFromEscritorioWithPayment({
          titulo: payload.titulo,
          descripcion: payload.descripcion,
          categorias: payload.categorias,
          packageIds: payload.packageIds ?? [],
          paymentMethod: "STRIPE",
          paymentReference: paymentIntentId,
        });
        toast.success("Proyecto creado. Pago con tarjeta registrado.");
        router.replace("/escritorio/proyectos");
        router.refresh();
      } catch (err) {
        stripeReturnProcessed.current = false;
        toast.error(err instanceof Error ? err.message : "Error al completar el proyecto.");
      }
    })();
  }, [searchParams, router]);

  return (
    <>
      <p className="mt-4">
        <Button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Crear proyecto
        </Button>
      </p>
      <CrearProyectoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        catalogPackages={catalogPackages}
      />
    </>
  );
}
