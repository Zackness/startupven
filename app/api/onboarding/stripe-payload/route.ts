import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Recupera el payload de onboarding por payment_intent (y lo borra tras leerlo). Si no hay por id, intenta el más reciente del usuario (fallback por doble PaymentIntent). */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const paymentIntentId = searchParams.get("payment_intent");
  if (!paymentIntentId) {
    return NextResponse.json({ error: "payment_intent requerido" }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    let row = await db.stripeOnboardingPayload.findUnique({
      where: { paymentIntentId },
    });
    if (!row || row.userId !== userId) {
      const since = new Date(Date.now() - 15 * 60 * 1000);
      row = await db.stripeOnboardingPayload.findFirst({
        where: { userId, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
      });
    }
    if (!row || row.userId !== userId) {
      return NextResponse.json({ error: "Payload no encontrado" }, { status: 404 });
    }
    await db.stripeOnboardingPayload.delete({
      where: { paymentIntentId: row.paymentIntentId },
    });
    return NextResponse.json({ payload: row.payload });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al recuperar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
