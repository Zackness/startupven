"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const ONBOARDING_STRIPE_PAYLOAD_KEY = "onboarding_stripe_payload";

function payloadKey(paymentIntentId: string | null) {
  return paymentIntentId ? `${ONBOARDING_STRIPE_PAYLOAD_KEY}_${paymentIntentId}` : ONBOARDING_STRIPE_PAYLOAD_KEY;
}

/** Lee las variables CSS del proyecto para aplicar la misma apariencia al Payment Element de Stripe. */
function getStripeAppearanceFromDOM(): StripeAppearance {
  if (typeof document === "undefined") {
    return getStripeAppearanceFallback();
  }
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const bodyStyle = getComputedStyle(document.body);
  const getVar = (name: string) => style.getPropertyValue(name).trim() || undefined;
  return {
    theme: "flat",
    variables: {
      colorPrimary: getVar("--primary") || "#0a0a0a",
      colorBackground: getVar("--card") || getVar("--background") || "#ffffff",
      colorText: getVar("--foreground") || "#0a0a0a",
      colorTextSecondary: getVar("--muted-foreground") || "#737373",
      colorDanger: getVar("--destructive") || "#dc2626",
      fontFamily: bodyStyle.fontFamily || "system-ui, sans-serif",
      borderRadius: getVar("--radius") || "6px",
      spacingUnit: "4px",
      buttonColorBackground: getVar("--primary") || "#0a0a0a",
      buttonColorText: getVar("--primary-foreground") || "#ffffff",
      accessibleColorOnColorPrimary: getVar("--primary-foreground") || "#ffffff",
    },
    rules: {
      ".Input": {
        border: `1px solid ${getVar("--border") || "#e5e5e5"}`,
        boxShadow: "none",
      },
      ".Input:focus": {
        border: `1px solid ${getVar("--ring") || getVar("--primary") || "#0a0a0a"}`,
        boxShadow: `0 0 0 2px ${getVar("--background") || "#ffffff"}, 0 0 0 4px ${getVar("--ring") || "rgba(10,10,10,0.2)"}`,
      },
      ".Label": {
        color: getVar("--foreground") || "#0a0a0a",
      },
      ".Tab": {
        border: `1px solid ${getVar("--border") || "#e5e5e5"}`,
      },
      ".Tab--selected": {
        backgroundColor: getVar("--primary") || "#0a0a0a",
        color: getVar("--primary-foreground") || "#ffffff",
        borderColor: getVar("--primary") || "#0a0a0a",
      },
      ".Block": {
        backgroundColor: getVar("--card") || getVar("--muted") || "#fafafa",
        border: `1px solid ${getVar("--border") || "#e5e5e5"}`,
      },
    },
  };
}

function getStripeAppearanceFallback(): StripeAppearance {
  return {
    theme: "flat",
    variables: {
      colorPrimary: "#0a0a0a",
      colorBackground: "#ffffff",
      colorText: "#0a0a0a",
      colorTextSecondary: "#737373",
      colorDanger: "#dc2626",
      fontFamily: "system-ui, sans-serif",
      borderRadius: "6px",
      spacingUnit: "4px",
      buttonColorBackground: "#0a0a0a",
      buttonColorText: "#ffffff",
    },
  };
}

type StripeAppearance = {
  theme: "stripe" | "night" | "flat";
  variables: Record<string, string>;
  rules?: Record<string, Record<string, string>>;
};

export type OnboardingStripePayload = {
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
  cedula: string | null;
  telefono: string | null;
  proyectos: { titulo: string; descripcion?: string; categorias: string[] }[];
  paqueteIds: string[];
  totalAmount: number;
};

type OnboardingStripeFormProps = {
  amountUsd: number;
  /** Se llama antes de confirmar el pago; debe guardar el payload en localStorage y en el servidor para completar al volver de Stripe. */
  getPayloadToSave: () => OnboardingStripePayload;
  disabled?: boolean;
};

function StripePaymentForm({
  amountUsd,
  getPayloadToSave,
  disabled,
  paymentIntentId,
}: OnboardingStripeFormProps & { paymentIntentId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = getPayloadToSave();
      const key = payloadKey(paymentIntentId);
      localStorage.setItem(key, JSON.stringify(payload));
      await fetch("/api/onboarding/save-stripe-payload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, payload }),
        credentials: "include",
      });
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL ?? "";
      const returnUrl = `${baseUrl}/onboarding?stripe=done`;
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {},
          },
        },
      });
      if (confirmError) {
        setError(confirmError.message ?? "Error al confirmar el pago");
        localStorage.removeItem(key);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago");
      localStorage.removeItem(payloadKey(paymentIntentId));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={!stripe || isSubmitting || disabled}
        className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
      >
        {isSubmitting ? "Procesando…" : "Pagar con tarjeta y acceder"}
      </Button>
    </form>
  );
}

export function OnboardingStripeForm({ amountUsd, getPayloadToSave, disabled }: OnboardingStripeFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripeAppearance, setStripeAppearance] = useState<StripeAppearance | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const fetchRunRef = useRef(0);

  useEffect(() => {
    if (!publishableKey || amountUsd <= 0) {
      setLoading(false);
      return;
    }
    const runId = ++fetchRunRef.current;
    setLoading(true);
    setFetchError(null);
    setStripeAppearance(null);
    setPaymentIntentId(null);
    setClientSecret(null);
    fetch("/api/onboarding/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountUsd }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (runId !== fetchRunRef.current) return;
        if (data.error) {
          setFetchError(data.error);
          setClientSecret(null);
          setPaymentIntentId(null);
          setStripeAppearance(null);
        } else {
          setClientSecret(data.clientSecret ?? null);
          setPaymentIntentId(data.paymentIntentId ?? null);
          setStripeAppearance(getStripeAppearanceFromDOM());
          setFetchError(null);
        }
      })
      .catch(() => {
        if (runId !== fetchRunRef.current) return;
        setFetchError("No se pudo conectar con el servidor de pagos.");
        setClientSecret(null);
        setPaymentIntentId(null);
        setStripeAppearance(null);
      })
      .finally(() => {
        if (runId === fetchRunRef.current) setLoading(false);
      });
  }, [amountUsd]);

  if (!publishableKey) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
        Stripe no está configurado. Añade NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en .env para habilitar pagos con tarjeta.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--muted-foreground)]">
        Cargando formulario de pago…
      </div>
    );
  }

  if (fetchError || !clientSecret || !paymentIntentId) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{fetchError ?? "No se pudo crear la sesión de pago."}</p>
      </div>
    );
  }

  if (!stripeAppearance) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-sm text-[var(--muted-foreground)]">
        Cargando formulario de pago…
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: stripeAppearance,
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <Elements stripe={stripePromise} options={options}>
        <StripePaymentForm
          amountUsd={amountUsd}
          getPayloadToSave={getPayloadToSave}
          disabled={disabled}
          paymentIntentId={paymentIntentId}
        />
      </Elements>
    </div>
  );
}

/** Para usar en la página de onboarding al volver de Stripe (return_url). paymentIntentId opcional: si se pasa, lee la clave por id; si no, lee la clave legacy. */
export function getOnboardingStripePayloadFromStorage(paymentIntentId?: string | null): OnboardingStripePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const key = payloadKey(paymentIntentId ?? null);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingStripePayload;
  } catch {
    return null;
  }
}

export function clearOnboardingStripePayload(paymentIntentId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(payloadKey(paymentIntentId ?? null));
}
