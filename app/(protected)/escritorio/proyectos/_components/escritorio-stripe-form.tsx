"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import type { EscritorioCrearProyectoPayload } from "@/lib/escritorio-stripe-payload";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type StripeAppearance = {
  theme: "stripe" | "night" | "flat";
  variables: Record<string, string>;
  rules?: Record<string, Record<string, string>>;
};

function getStripeAppearanceFromDOM(): StripeAppearance {
  if (typeof document === "undefined") {
    return { theme: "flat", variables: { colorPrimary: "#0a0a0a", colorBackground: "#ffffff", colorText: "#0a0a0a", colorTextSecondary: "#737373", colorDanger: "#dc2626", fontFamily: "system-ui, sans-serif", borderRadius: "6px", spacingUnit: "4px", buttonColorBackground: "#0a0a0a", buttonColorText: "#ffffff", accessibleColorOnColorPrimary: "#ffffff" } };
  }
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const getVar = (name: string) => style.getPropertyValue(name).trim() || undefined;
  return {
    theme: "flat",
    variables: {
      colorPrimary: getVar("--primary") || "#0a0a0a",
      colorBackground: getVar("--card") || getVar("--background") || "#ffffff",
      colorText: getVar("--foreground") || "#0a0a0a",
      colorTextSecondary: getVar("--muted-foreground") || "#737373",
      colorDanger: getVar("--destructive") || "#dc2626",
      fontFamily: "system-ui, sans-serif",
      borderRadius: getVar("--radius") || "6px",
      spacingUnit: "4px",
      buttonColorBackground: getVar("--primary") || "#0a0a0a",
      buttonColorText: getVar("--primary-foreground") || "#ffffff",
      accessibleColorOnColorPrimary: getVar("--primary-foreground") || "#ffffff",
    },
    rules: {
      ".Input": { border: `1px solid ${getVar("--border") || "#e5e5e5"}`, boxShadow: "none" },
      ".Input:focus": { border: `1px solid ${getVar("--ring") || getVar("--primary") || "#0a0a0a"}`, boxShadow: `0 0 0 2px ${getVar("--background") || "#ffffff"}, 0 0 0 4px ${getVar("--ring") || "rgba(10,10,10,0.2)"}` },
      ".Label": { color: getVar("--foreground") || "#0a0a0a" },
      ".Tab": { border: `1px solid ${getVar("--border") || "#e5e5e5"}` },
      ".Tab--selected": { backgroundColor: getVar("--primary") || "#0a0a0a", color: getVar("--primary-foreground") || "#ffffff", borderColor: getVar("--primary") || "#0a0a0a" },
      ".Block": { backgroundColor: getVar("--card") || getVar("--muted") || "#fafafa", border: `1px solid ${getVar("--border") || "#e5e5e5"}` },
    },
  };
}

type EscritorioStripeFormProps = {
  amountUsd: number;
  getPayloadToSave: () => EscritorioCrearProyectoPayload;
  disabled?: boolean;
};

function StripePaymentFormInner({
  getPayloadToSave,
  disabled,
  paymentIntentId,
}: EscritorioStripeFormProps & { paymentIntentId: string }) {
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
      await fetch("/api/escritorio/save-stripe-payload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, payload }),
        credentials: "include",
      });
      const baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? "";
      const returnUrl = `${baseUrl}/escritorio/proyectos?stripe=done`;
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: { billing_details: {} },
        },
      });
      if (confirmError) setError(confirmError.message ?? "Error al confirmar el pago");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago");
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
        {isSubmitting ? "Procesando…" : "Pagar con tarjeta y crear proyecto"}
      </Button>
    </form>
  );
}

export function EscritorioStripeForm({ amountUsd, getPayloadToSave, disabled }: EscritorioStripeFormProps) {
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
    fetch("/api/escritorio/create-payment-intent", {
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

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
        <StripePaymentFormInner
          amountUsd={amountUsd}
          getPayloadToSave={getPayloadToSave}
          disabled={disabled}
          paymentIntentId={paymentIntentId}
        />
      </Elements>
    </div>
  );
}
