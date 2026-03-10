"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoriesCombobox } from "@/app/(protected)/onboarding/_components/categories-combobox";
import { PackagesCards } from "@/app/(protected)/onboarding/_components/packages-cards";
import { EscritorioStripeForm } from "./escritorio-stripe-form";
import { createProjectFromEscritorioWithPayment } from "@/lib/actions/escritorio";
import { getProjectCategoryLabel } from "@/lib/project-categories";
import { getBcvUsdToVesRate } from "@/lib/actions/bcv";
import { ChevronRight, ChevronLeft, Smartphone, CreditCard } from "lucide-react";
import type { ProjectCategory } from "@/lib/project-categories";

export type PackageOption = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
};

export function CrearProyectoDialog({
  open,
  onOpenChange,
  catalogPackages,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogPackages: PackageOption[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"PAGO_MOVIL" | "STRIPE">("PAGO_MOVIL");
  const [paymentBank, setPaymentBank] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [bcvRate, setBcvRate] = useState<number | null>(null);

  const availablePackages = useMemo(
    () =>
      catalogPackages.filter(
        (p) => p.category !== "SERVIDORES" && categorias.includes(p.category)
      ),
    [catalogPackages, categorias]
  );

  const serverPackages = useMemo(
    () => catalogPackages.filter((p) => p.category === "SERVIDORES"),
    [catalogPackages]
  );

  const totalAmountBase = useMemo(
    () =>
      selectedPackageIds.reduce((sum, id) => {
        const p = catalogPackages.find((x) => x.id === id);
        return sum + (p ? p.price : 0);
      }, 0),
    [selectedPackageIds, catalogPackages]
  );

  const selectedPackagesList = useMemo(
    () =>
      selectedPackageIds
        .map((id) => catalogPackages.find((p) => p.id === id))
        .filter((p): p is PackageOption => p != null),
    [selectedPackageIds, catalogPackages]
  );

  const hasScaleWeb = useMemo(
    () => selectedPackagesList.some((p) => p.category === "WEB"),
    [selectedPackagesList]
  );

  const [serverPackageId, setServerPackageId] = useState<string | null>(null);

  const selectedServerPackage = useMemo(() => {
    if (!hasScaleWeb) return null;
    const idToUse = serverPackageId || serverPackages[0]?.id || null;
    return serverPackages.find((p) => p.id === idToUse) ?? null;
  }, [hasScaleWeb, serverPackageId, serverPackages]);

  const totalAmount = useMemo(
    () =>
      totalAmountBase +
      (hasScaleWeb && selectedServerPackage ? selectedServerPackage.price : 0),
    [totalAmountBase, hasScaleWeb, selectedServerPackage]
  );

  useEffect(() => {
    if (step === 2 && totalAmount > 0) {
      getBcvUsdToVesRate().then(setBcvRate);
    } else {
      setBcvRate(null);
    }
  }, [step, totalAmount]);

  const canGoStep2 =
    titulo.trim() !== "" &&
    categorias.length > 0 &&
    selectedPackageIds.length > 0;

  function resetForm() {
    setStep(1);
    setError(null);
    setTitulo("");
    setDescripcion("");
    setCategorias([]);
    setSelectedPackageIds([]);
    setPaymentMethod("PAGO_MOVIL");
    setPaymentBank("");
    setPaymentReference("");
    setServerPackageId(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  async function handleSubmit() {
    setError(null);
    if (step === 1) {
      setStep(2);
      return;
    }

    if (totalAmount > 0 && paymentMethod === "STRIPE") {
      return;
    }

    const finalPackageIds =
      hasScaleWeb && selectedServerPackage
        ? [...selectedPackageIds, selectedServerPackage.id]
        : selectedPackageIds;

    setPending(true);
    try {
      await createProjectFromEscritorioWithPayment({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        categorias: categorias.length > 0 ? categorias : undefined,
        packageIds: finalPackageIds,
        ...(totalAmount > 0
          ? {
              paymentMethod: "PAGO_MOVIL" as const,
              paymentBank: paymentBank.trim(),
              paymentReference: paymentReference.trim(),
            }
          : {}),
      });
      handleOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el proyecto.");
    } finally {
      setPending(false);
    }
  }

  function getStripePayload() {
    const finalPackageIds =
      hasScaleWeb && selectedServerPackage
        ? [...selectedPackageIds, selectedServerPackage.id]
        : selectedPackageIds;
    return {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      categorias: categorias.length > 0 ? categorias : undefined,
      packageIds: finalPackageIds,
      totalAmount,
    };
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[var(--border)] bg-[var(--background)] p-6 text-[var(--foreground)] sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-[var(--foreground)]">
            Crear proyecto
          </DialogTitle>
          <DialogDescription className="text-[var(--muted-foreground)]">
            {step === 1
              ? "Paso 1: Datos del proyecto y servicios a asignar."
              : "Paso 2: Pago según lo seleccionado."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </p>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="crear-titulo" className="text-[var(--foreground)]">
                Título del proyecto *
              </Label>
              <Input
                id="crear-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Sitio web corporativo"
                className="mt-1 border-[var(--border)] bg-[var(--background)]"
              />
            </div>
            <div>
              <Label htmlFor="crear-descripcion" className="text-[var(--foreground)]">
                Descripción
              </Label>
              <textarea
                id="crear-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                placeholder="Breve descripción"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              />
            </div>
            <div>
              <Label className="text-[var(--foreground)]">Categorías *</Label>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Elige las categorías del proyecto. Según esto se mostrarán los servicios que puedes asignar.
              </p>
              <div className="mt-2">
                <CategoriesCombobox
                  selectedIds={categorias}
                  onSelectionChange={setCategorias}
                  disabled={pending}
                />
              </div>
            </div>
            <div>
              <Label className="text-[var(--foreground)]">Servicios del proyecto *</Label>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Elige un servicio por categoría (por ejemplo Launch Básico o Launch Pro, no ambos). El monto se calculará en el siguiente paso.
              </p>
              <div className="mt-2">
                <PackagesCards
                  packages={availablePackages as { id: string; name: string; price: number; category: ProjectCategory; description?: string }[]}
                  selectedIds={selectedPackageIds}
                  onSelectionChange={setSelectedPackageIds}
                  disabled={pending}
                  maxOnePerCategory
                />
              </div>
              {categorias.length > 0 && availablePackages.length === 0 && (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  No hay servicios en el catálogo para las categorías elegidas.
                </p>
              )}
            </div>
            {selectedPackageIds.length > 0 && (
              <p className="text-sm font-medium text-[var(--foreground)]">
                Total: USD {totalAmount.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4">
              <p className="text-sm font-medium text-[var(--foreground)]">Resumen</p>
              <p className="mt-1 text-[var(--foreground)]">{titulo}</p>
              {selectedPackagesList.length > 0 ? (
                <>
                  <ul className="mt-3 space-y-1 text-sm">
                    {selectedPackagesList.map((p) => (
                      <li key={p.id} className="flex justify-between gap-4">
                        <span className="text-[var(--foreground)]">{p.name}</span>
                        <span className="font-medium text-[var(--foreground)]">
                          USD {p.price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {hasScaleWeb && selectedServerPackage && (
                    <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Servidores gestionados para Scale
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        Todo proyecto Scale incluye un servidor gestionado mínimo (USD 25) para alojar la web. Si el
                        proyecto crece o requiere más recursos, puedes subir el nivel desde aquí.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {serverPackages.map((sp) => (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => setServerPackageId(sp.id)}
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                              selectedServerPackage && selectedServerPackage.id === sp.id
                                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                                : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                            }`}
                          >
                            {sp.name} · USD {sp.price.toFixed(0)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 border-t border-[var(--border)] pt-3">
                    {paymentMethod === "PAGO_MOVIL" && totalAmount > 0 ? (
                      <>
                        <p className="flex justify-between text-base font-semibold text-[var(--foreground)]">
                          <span>Total a pagar (Bs)</span>
                          <span>{bcvRate != null ? `Bs ${(totalAmount * bcvRate).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "— (cargando tasa…)"}</span>
                        </p>
                        {bcvRate != null && (
                          <p className="flex justify-between text-sm text-[var(--muted-foreground)]">
                            <span>Equivalente en USD</span>
                            <span>USD {totalAmount.toFixed(2)}</span>
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="flex justify-between text-base font-semibold text-[var(--foreground)]">
                        <span>Total a pagar (USD)</span>
                        <span>USD {totalAmount.toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {totalAmount > 0 ? (
              <>
                <div className="space-y-3">
                  <Label className="text-[var(--foreground)]">Método de pago</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={paymentMethod === "PAGO_MOVIL" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 border-[var(--border)]"
                      onClick={() => setPaymentMethod("PAGO_MOVIL")}
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Pago móvil / Transferencia
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "STRIPE" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 border-[var(--border)]"
                      onClick={() => setPaymentMethod("STRIPE")}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Tarjeta / Stripe
                    </Button>
                  </div>
                </div>

                {paymentMethod === "PAGO_MOVIL" && (
                  <>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Indica los datos del pago móvil o transferencia para registrar el reporte.
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Realiza la transferencia o pago móvil a: <strong className="text-[var(--foreground)]">Cédula 27436494 · Teléfono 04245945615 · BNC</strong>. Luego indica la referencia y el banco emisor abajo.
                    </p>
                    {bcvRate != null && (
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        Monto a abonar en Bs: Bs {(totalAmount * bcvRate).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (tasa BCV)
                      </p>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="crear-bank" className="text-[var(--foreground)]">
                          Banco emisor *
                        </Label>
                        <Input
                          id="crear-bank"
                          value={paymentBank}
                          onChange={(e) => setPaymentBank(e.target.value.slice(0, 64))}
                          placeholder="Ej. Banesco, Mercantil"
                          className="mt-1 border-[var(--border)] bg-[var(--background)]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="crear-reference" className="text-[var(--foreground)]">
                          Referencia de pago *
                        </Label>
                        <Input
                          id="crear-reference"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value.slice(0, 64))}
                          placeholder="Últimos dígitos"
                          className="mt-1 border-[var(--border)] bg-[var(--background)]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === "STRIPE" && totalAmount > 0 && (
                  <EscritorioStripeForm
                    amountUsd={totalAmount}
                    getPayloadToSave={getStripePayload}
                    disabled={pending}
                  />
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                No hay monto a pagar. Solo se creará el proyecto con los servicios seleccionados.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          {step === 2 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={pending}
                className="border-[var(--border)]"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              {!(paymentMethod === "STRIPE" && totalAmount > 0) && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    pending ||
                    (totalAmount > 0 &&
                      paymentMethod === "PAGO_MOVIL" &&
                      (!paymentReference.trim() || !paymentBank.trim()))
                  }
                  className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                >
                  {pending
                    ? "Creando…"
                    : totalAmount > 0 && paymentMethod === "PAGO_MOVIL"
                      ? "Crear proyecto y reportar pago"
                      : "Crear proyecto"}
                </Button>
              )}
            </>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canGoStep2 || pending}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            >
              Siguiente: Pago
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
