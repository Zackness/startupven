"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { completeOnboardingWithPayment } from "@/lib/actions/users";
import { ESCRITORIO_PATH } from "@/routes";
import {
  sanitizeNamePart,
  sanitizeCedula,
  sanitizeTelefono,
} from "@/lib/sanitize";
import { PROJECT_CATEGORY_VALUES, PROJECT_CATEGORY_LABELS, PROJECT_CATEGORY_DESCRIPTIONS, type ProjectCategory } from "@/lib/project-categories";
import type { ServicePackageRow } from "@/lib/actions/service-packages-db";
import { getBcvUsdToVesRate } from "@/lib/actions/bcv";
import { CategoriesCombobox } from "./categories-combobox";
import { PackagesCards } from "./packages-cards";
import {
  OnboardingStripeForm,
  getOnboardingStripePayloadFromStorage,
  clearOnboardingStripePayload,
  type OnboardingStripePayload,
} from "./onboarding-stripe-form";
import { Plus, Trash2, ChevronRight, ChevronLeft, CreditCard, Smartphone } from "lucide-react";

type Props = {
  allPackages: ServicePackageRow[];
  defaultPrimerNombre: string;
  defaultSegundoNombre: string;
  defaultPrimerApellido: string;
  defaultSegundoApellido: string;
  defaultCedula: string;
  defaultTelefono: string;
};

export function OnboardingForm({
  allPackages,
  defaultPrimerNombre,
  defaultSegundoNombre,
  defaultPrimerApellido,
  defaultSegundoApellido,
  defaultCedula,
  defaultTelefono,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const [primerNombre, setPrimerNombre] = useState(defaultPrimerNombre);
  const [segundoNombre, setSegundoNombre] = useState(defaultSegundoNombre);
  const [primerApellido, setPrimerApellido] = useState(defaultPrimerApellido);
  const [segundoApellido, setSegundoApellido] = useState(defaultSegundoApellido);
  const [cedula, setCedula] = useState(defaultCedula);
  const [telefono, setTelefono] = useState(defaultTelefono);

  const [proyectos, setProyectos] = useState<{ titulo: string; descripcion: string; categorias: string[] }[]>([
    { titulo: "", descripcion: "", categorias: ["LAUNCH"] },
  ]);

  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<"PAGO_MOVIL" | "STRIPE">("PAGO_MOVIL");
  const [paymentBank, setPaymentBank] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const stripeReturnProcessed = useRef(false);
  const canGoNext =
    primerNombre.trim() !== "" && primerApellido.trim() !== "" && cedula.trim() !== "";
  const uniqueCategories = useMemo(
    () => [...new Set(proyectos.flatMap((p) => p.categorias).filter(Boolean))],
    [proyectos]
  );
  const availablePackages = useMemo(
    () =>
      allPackages.filter(
        (p) =>
          // Paquetes visibles según categorías elegidas. SCALE mapea a WEB.
          (p.category !== "SERVIDORES" &&
            (uniqueCategories.includes(p.category) ||
              (uniqueCategories.includes("SCALE") && p.category === "WEB")))
      ),
    [allPackages, uniqueCategories]
  );
  const canSubmit =
    canGoNext && proyectos.some((p) => p.titulo.trim() !== "");

  const serverPackages = useMemo(
    () => allPackages.filter((p) => p.category === "SERVIDORES"),
    [allPackages]
  );
  const hasScaleWeb = useMemo(
    () =>
      selectedPackageIds
        .map((id) => allPackages.find((p) => p.id === id))
        .some((p) => p && p.category === "WEB"),
    [selectedPackageIds, allPackages]
  );
  const [serverPackageId, setServerPackageId] = useState<string | null>(null);

  const selectedServerPackage = useMemo(() => {
    if (!hasScaleWeb) return null;
    const idToUse =
      serverPackageId ||
      serverPackages[0]?.id ||
      null;
    return serverPackages.find((p) => p.id === idToUse) ?? null;
  }, [hasScaleWeb, serverPackageId, serverPackages]);

  const totalAmountBase = useMemo(
    () =>
      selectedPackageIds.reduce((sum, id) => {
        const p = allPackages.find((x) => x.id === id);
        return sum + (p ? Number(p.price) : 0);
      }, 0),
    [selectedPackageIds, allPackages]
  );
  const selectedPackagesList = useMemo(
    () =>
      selectedPackageIds
        .map((id) => allPackages.find((p) => p.id === id))
        .filter((p): p is ServicePackageRow => p != null),
    [selectedPackageIds, allPackages]
  );
  const totalAmount = useMemo(
    () =>
      totalAmountBase +
      (hasScaleWeb && selectedServerPackage ? Number(selectedServerPackage.price) : 0),
    [totalAmountBase, hasScaleWeb, selectedServerPackage]
  );
  const totalBs = bcvRate != null && totalAmount > 0 ? totalAmount * bcvRate : null;

  useEffect(() => {
    if (step === 3 && totalAmount > 0) {
      getBcvUsdToVesRate().then(setBcvRate);
    } else {
      setBcvRate(null);
    }
  }, [step, totalAmount]);

  /** Al volver de Stripe (return_url): completar onboarding solo si el pago fue exitoso (redirect_status=succeeded). Prueba localStorage y luego API. */
  useEffect(() => {
    const stripeDone = searchParams.get("stripe") === "done";
    const paymentIntentId = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");
    if (!stripeDone || !paymentIntentId || stripeReturnProcessed.current) return;

    if (redirectStatus && redirectStatus !== "succeeded") {
      setError(redirectStatus === "failed" ? "El pago no se completó. Intenta de nuevo o usa otro método." : "El pago está en proceso. Si ya descontaron, contacta a soporte.");
      return;
    }

    async function run() {
      let payload = getOnboardingStripePayloadFromStorage(paymentIntentId);
      if (!payload) {
        try {
          const res = await fetch(
            `/api/onboarding/stripe-payload?payment_intent=${encodeURIComponent(paymentIntentId!)}`,
            { credentials: "include" }
          );
          const data = await res.json();
          if (data.payload) payload = data.payload as OnboardingStripePayload;
        } catch {
          setError("No se pudo recuperar los datos del pago. Contacta a soporte.");
          return;
        }
      }
      if (!payload) {
        setError("No se encontraron los datos del pago. Si ya pagaste, contacta a soporte con el ID de pago.");
        return;
      }
      stripeReturnProcessed.current = true;
      startTransition(async () => {
        try {
          await completeOnboardingWithPayment({
            primerNombre: payload!.primerNombre || null,
            segundoNombre: payload!.segundoNombre || null,
            primerApellido: payload!.primerApellido || null,
            segundoApellido: payload!.segundoApellido || null,
            cedula: payload!.cedula || null,
            telefono: payload!.telefono || null,
            proyectos: payload!.proyectos,
            paqueteIds: payload!.paqueteIds,
            totalAmount: payload!.totalAmount,
            paymentMethod: "STRIPE",
            paymentBank: "",
            paymentReference: paymentIntentId!,
          });
          clearOnboardingStripePayload(paymentIntentId!);
          setSuccess("Pago realizado. Redirigiendo…");
          router.replace(ESCRITORIO_PATH);
          router.refresh();
        } catch (err) {
          stripeReturnProcessed.current = false;
          setError(err instanceof Error ? err.message : "Error al completar");
        }
      });
    }
    run();
  }, [searchParams, router]);

  function getStripePayload(): OnboardingStripePayload {
    const proyectosToSend = proyectos
      .map((p) => ({
        titulo: p.titulo.trim(),
        descripcion: p.descripcion?.trim() || undefined,
        categorias: p.categorias.filter((c) => PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory)),
      }))
      .filter((p) => p.titulo.length > 0 && p.categorias.length > 0);
    const finalPackageIds =
      hasScaleWeb && selectedServerPackage
        ? [...selectedPackageIds, selectedServerPackage.id]
        : selectedPackageIds;
    return {
      primerNombre: primerNombre || null,
      segundoNombre: segundoNombre || null,
      primerApellido: primerApellido || null,
      segundoApellido: segundoApellido || null,
      cedula: cedula || null,
      telefono: telefono || null,
      proyectos: proyectosToSend,
      paqueteIds: finalPackageIds,
      totalAmount,
    };
  }

  function getCategoryDescription(cat: string): string {
    if (cat === "SCALE") return PROJECT_CATEGORY_DESCRIPTIONS.WEB;
    return PROJECT_CATEGORY_DESCRIPTIONS[cat as ProjectCategory] ?? "";
  }

  function setProjectCategories(projectIndex: number, categorias: string[]) {
    if (categorias.length === 0) return;
    setProyectos((prev) =>
      prev.map((p, i) => (i === projectIndex ? { ...p, categorias } : p))
    );
  }

  const handlePrimerNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimerNombre(sanitizeNamePart(e.target.value));
  };
  const handleSegundoNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSegundoNombre(sanitizeNamePart(e.target.value));
  };
  const handlePrimerApellido = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimerApellido(sanitizeNamePart(e.target.value));
  };
  const handleSegundoApellido = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSegundoApellido(sanitizeNamePart(e.target.value));
  };
  const handleCedula = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCedula(sanitizeCedula(e.target.value));
  };
  const handleTelefono = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefono(sanitizeTelefono(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const proyectosToSend = proyectos
      .map((p) => ({
        titulo: p.titulo.trim(),
        descripcion: p.descripcion?.trim() || undefined,
        categorias: p.categorias.filter((c) => PROJECT_CATEGORY_VALUES.includes(c as ProjectCategory)),
      }))
      .filter((p) => p.titulo.length > 0 && p.categorias.length > 0);
    if (proyectosToSend.length === 0) {
      setError("Debes crear al menos un proyecto. Según los proyectos que indiques se te facturará el servicio.");
      return;
    }
    if (step === 3 && totalAmount > 0 && !paymentReference.trim()) {
      setError("Indica la referencia de pago para continuar.");
      return;
    }
    if (step === 3 && totalAmount > 0 && paymentMethod === "PAGO_MOVIL" && !paymentBank.trim()) {
      setError("Indica el banco emisor del pago móvil.");
      return;
    }
    const finalPackageIds =
      hasScaleWeb && selectedServerPackage
        ? [...selectedPackageIds, selectedServerPackage.id]
        : selectedPackageIds;

    startTransition(async () => {
      try {
        await completeOnboardingWithPayment({
          primerNombre: primerNombre || null,
          segundoNombre: segundoNombre || null,
          primerApellido: primerApellido || null,
          segundoApellido: segundoApellido || null,
          cedula: cedula || null,
          telefono: telefono || null,
          proyectos: proyectosToSend,
          paqueteIds: finalPackageIds.length > 0 ? finalPackageIds : undefined,
          totalAmount,
          paymentMethod,
          paymentBank: paymentBank.trim(),
          paymentReference: paymentReference.trim(),
        });
        setSuccess(totalAmount > 0 ? "Pago reportado. Redirigiendo a tu escritorio…" : "Perfil completado. Redirigiendo…");
        router.refresh();
        router.push(ESCRITORIO_PATH);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar");
      }
    });
  };

  const isStripeOnlyForm = step === 3 && paymentMethod === "STRIPE" && totalAmount > 0;

  return (
    <form
      onSubmit={isStripeOnlyForm ? undefined : handleSubmit}
      className="space-y-6"
    >
      <FormError message={error} />
      <FormSuccess message={success} />

      {/* Indicador de pasos */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-2">
        <span
          className={`text-sm font-medium ${step === 1 ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}
        >
          Paso 1: Información personal
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        <span
          className={`text-sm font-medium ${step === 2 ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}
        >
          Paso 2: Proyectos y paquetes
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
        <span
          className={`text-sm font-medium ${step === 3 ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}
        >
          Paso 3: Pago
        </span>
      </div>

      {/* Paso 1: Información personal */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Paso 1 de 3
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Información personal
            </h2>
            <p className="mt-2 text-[15px] text-[var(--muted-foreground)]">
              Datos para tu perfil y facturación.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="primerNombre">Primer nombre *</Label>
              <Input
                id="primerNombre"
                name="primerNombre"
                value={primerNombre}
                onChange={handlePrimerNombre}
                placeholder="Ej. María"
                disabled={isPending}
                autoComplete="given-name"
                maxLength={64}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="segundoNombre">Segundo nombre</Label>
              <Input
                id="segundoNombre"
                name="segundoNombre"
                value={segundoNombre}
                onChange={handleSegundoNombre}
                placeholder="Ej. José"
                disabled={isPending}
                autoComplete="additional-name"
                maxLength={64}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="primerApellido">Primer apellido *</Label>
              <Input
                id="primerApellido"
                name="primerApellido"
                value={primerApellido}
                onChange={handlePrimerApellido}
                placeholder="Ej. González"
                disabled={isPending}
                autoComplete="family-name"
                maxLength={64}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="segundoApellido">Segundo apellido</Label>
              <Input
                id="segundoApellido"
                name="segundoApellido"
                value={segundoApellido}
                onChange={handleSegundoApellido}
                placeholder="Ej. Pérez"
                disabled={isPending}
                autoComplete="family-name"
                maxLength={64}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cedula">Cédula / Documento de identidad *</Label>
            <Input
              id="cedula"
              name="cedula"
              value={cedula}
              onChange={handleCedula}
              placeholder="Ej. V-12345678"
              disabled={isPending}
              autoComplete="off"
              maxLength={24}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              value={telefono}
              onChange={handleTelefono}
              placeholder="Ej. +58 412 1234567"
              disabled={isPending}
              autoComplete="tel"
              maxLength={32}
            />
          </div>

          <Button
            type="button"
            onClick={() => setStep(2)}
            disabled={!canGoNext}
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 sm:w-auto sm:min-w-[140px]"
          >
            Siguiente: Proyectos
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Paso 2: Proyectos del servicio */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Paso 2 de 3
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Proyectos del servicio
            </h2>
            <p className="mt-2 text-[15px] text-[var(--muted-foreground)]">
              Indica el o los proyectos por los que contratas el servicio. Según esto se te facturará.
            </p>
          </div>

          <div className="space-y-4">
            {proyectos.map((p, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    Proyecto {index + 1}
                  </span>
                  {proyectos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-red-600"
                      onClick={() => setProyectos((prev) => prev.filter((_, i) => i !== index))}
                      disabled={isPending}
                      aria-label="Quitar proyecto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="grid gap-2">
                    <Label>Categorías del servicio (puedes elegir varias) *</Label>
                    <CategoriesCombobox
                      selectedIds={p.categorias}
                      onSelectionChange={(ids) => setProjectCategories(index, ids)}
                      disabled={isPending}
                    />
                    {p.categorias.length > 0 && getCategoryDescription(p.categorias[0]) && (
                      <p className="text-[13px] leading-snug text-[var(--muted-foreground)]">
                        {getCategoryDescription(p.categorias[0])}
                        {p.categorias.length > 1 ? " (y más categorías elegidas)." : ""}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`proyecto-titulo-${index}`}>Nombre del proyecto *</Label>
                    <Input
                      id={`proyecto-titulo-${index}`}
                      value={p.titulo}
                      onChange={(e) =>
                        setProyectos((prev) =>
                          prev.map((q, i) => (i === index ? { ...q, titulo: e.target.value } : q))
                        )
                      }
                      placeholder="Ej. Mi sitio web, Redes sociales..."
                      disabled={isPending}
                      maxLength={200}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`proyecto-descripcion-${index}`}>Descripción (opcional)</Label>
                    <Input
                      id={`proyecto-descripcion-${index}`}
                      value={p.descripcion}
                      onChange={(e) =>
                        setProyectos((prev) =>
                          prev.map((q, i) => (i === index ? { ...q, descripcion: e.target.value } : q))
                        )
                      }
                      placeholder="Breve descripción"
                      disabled={isPending}
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-[var(--border)]"
              onClick={() => setProyectos((prev) => [...prev, { titulo: "", descripcion: "", categorias: ["LAUNCH"] }])}
              disabled={isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              Añadir otro proyecto
            </Button>
          </div>

          {/* Paquetes: justo debajo de las categorías; se rellenan según categorías elegidas */}
          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
            <div>
            <Label>Paquetes a contratar</Label>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Selecciona un servicio por categoría (por ejemplo Launch Básico o Launch Pro, no ambos). Haz clic en cada tarjeta para elegir.
            </p>
            </div>
            <PackagesCards
              packages={availablePackages as any}
              selectedIds={selectedPackageIds}
              onSelectionChange={setSelectedPackageIds}
              disabled={isPending}
              maxOnePerCategory
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isPending}
              className="border-[var(--border)]"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              type="button"
              onClick={() => setStep(3)}
              disabled={isPending || !canSubmit}
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 sm:w-auto sm:min-w-[200px]"
            >
              Siguiente: Pago
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Paso 3: Pago */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Paso 3 de 3
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              Pago e ingreso
            </h2>
            <p className="mt-2 text-[15px] text-[var(--muted-foreground)]">
              Elige el método de pago, realiza el abono y reporta los datos para acceder al escritorio.
            </p>
          </div>

          {/* Resumen de paquetes y total (según método: Bs para pago móvil, USD para tarjeta) */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 space-y-3">
            <Label>Resumen</Label>
            {selectedPackagesList.length > 0 ? (
              <>
                <ul className="space-y-1 text-sm text-[var(--foreground)]">
                  {selectedPackagesList.map((pkg) => (
                    <li key={pkg.id} className="flex justify-between gap-4">
                      <span>{pkg.name}</span>
                      <span className="font-medium">USD {pkg.price}</span>
                    </li>
                  ))}
                  {hasScaleWeb && selectedServerPackage && (
                    <li className="flex justify-between gap-4">
                      <span>{selectedServerPackage.name}</span>
                      <span className="font-medium">
                        USD {Number(selectedServerPackage.price).toFixed(2)}
                      </span>
                    </li>
                  )}
                </ul>

                {hasScaleWeb && serverPackages.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Servidores gestionados para Scale
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Scale incluye siempre un servidor gestionado mínimo (USD 25) para alojar tu proyecto web.
                      Puedes subir a un nivel superior si necesitas más capacidad, tráfico o entornos adicionales.
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      • <span className="font-semibold">Básico</span>: entorno de producción para un proyecto web, recursos optimizados para lanzamientos iniciales.
                      <br />
                      • <span className="font-semibold">Pro</span>: más CPU/RAM, pensado para proyectos con más tráfico y automatizaciones.
                      <br />
                      • <span className="font-semibold">Premium</span>: infraestructura avanzada, entornos extra y margen para escalar sin migraciones.
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
                          {sp.name} · USD {Number(sp.price).toFixed(0)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1 border-t border-[var(--border)] pt-3">
                  {paymentMethod === "PAGO_MOVIL" ? (
                    <>
                      <p className="flex justify-between text-base font-semibold text-[var(--foreground)]">
                        <span>Total a pagar (Bs)</span>
                        <span>
                          {totalBs != null
                            ? `Bs ${totalBs.toLocaleString("es-VE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "— (cargando tasa…)"}
                        </span>
                      </p>
                      {totalBs != null && (
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
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                No seleccionaste paquetes. El monto a pagar es USD 0. Puedes continuar sin reportar pago.
              </p>
            )}
          </div>

          {/* Método de pago */}
          <div className="space-y-3">
            <Label>Método de pago</Label>
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
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
              <p className="text-sm font-medium text-[var(--foreground)]">Datos para el pago</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Realiza la transferencia o pago móvil a: <strong className="text-[var(--foreground)]">Cédula 27436494 · Teléfono 04245945615 · BNC</strong>. Luego indica la referencia y el banco emisor abajo.
              </p>
              {totalBs != null && totalAmount > 0 && (
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Monto a abonar en Bs: Bs {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (tasa BCV)
                </p>
              )}
            </div>
          )}

          {paymentMethod === "STRIPE" && totalAmount > 0 && (
            <OnboardingStripeForm
              amountUsd={totalAmount}
              getPayloadToSave={getStripePayload}
              disabled={isPending}
            />
          )}

          {totalAmount > 0 && paymentMethod !== "STRIPE" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethod === "PAGO_MOVIL" && (
                <div className="grid gap-2">
                  <Label htmlFor="paymentBank">Banco emisor *</Label>
                  <Input
                    id="paymentBank"
                    value={paymentBank}
                    onChange={(e) => setPaymentBank(e.target.value.slice(0, 64))}
                    placeholder="Ej. Banesco, Mercantil"
                    disabled={isPending}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="paymentReference">
                  {paymentMethod === "PAGO_MOVIL" ? "Referencia de pago (últimos dígitos) *" : "ID de transacción (opcional)"}
                </Label>
                <Input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value.slice(0, 64))}
                  placeholder={paymentMethod === "PAGO_MOVIL" ? "Ej. 1234" : "Ej. ch_3L..."}
                  disabled={isPending}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              disabled={isPending}
              className="border-[var(--border)]"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            {!(paymentMethod === "STRIPE" && totalAmount > 0) && (
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 sm:w-auto sm:min-w-[220px]"
              >
                {isPending ? "Procesando…" : totalAmount > 0 ? "Reportar pago y acceder" : "Completar y acceder"}
              </Button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
