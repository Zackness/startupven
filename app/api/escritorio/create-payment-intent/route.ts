import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";

const stripeSecretKey = process.env.STRIPE_API_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

/** Crea un PaymentIntent para crear proyecto desde escritorio (pago con tarjeta). amount = total en USD. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado. Añade STRIPE_API_KEY en .env." },
      { status: 503 }
    );
  }

  let body: { amount: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const amountUsd = Number(body.amount);
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }

  const amountCents = Math.round(amountUsd * 100);
  if (amountCents < 50) {
    return NextResponse.json({ error: "El monto mínimo es 0.50 USD" }, { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { userId: session.user.id, source: "escritorio_crear_proyecto" },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear el pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
