import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { EscritorioCrearProyectoPayload } from "@/lib/escritorio-stripe-payload";

/** Guarda el payload de crear proyecto por payment_intent id para recuperarlo al volver de Stripe. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: { paymentIntentId: string; payload: EscritorioCrearProyectoPayload };
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
    await db.stripeEscritorioPayload.upsert({
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
