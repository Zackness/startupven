import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { OnboardingStripePayload } from "@/app/(protected)/onboarding/_components/onboarding-stripe-form";

/** Guarda el payload de onboarding por payment_intent id para recuperarlo al volver de Stripe. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: { paymentIntentId: string; payload: OnboardingStripePayload };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { paymentIntentId, payload } = body;
  if (!paymentIntentId || typeof paymentIntentId !== "string" || !payload || typeof payload !== "object") {
    return NextResponse.json({ error: "paymentIntentId y payload requeridos" }, { status: 400 });
  }

  try {
    await db.stripeOnboardingPayload.upsert({
      where: { paymentIntentId },
      create: {
        paymentIntentId,
        payload: payload as object,
        userId: session.user.id,
      },
      update: {
        payload: payload as object,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al guardar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
