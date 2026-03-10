import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Recupera el payload de crear proyecto por payment_intent (y lo borra tras leerlo). */
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

  try {
    const row = await db.stripeEscritorioPayload.findUnique({
      where: { paymentIntentId },
    });
    if (!row || row.userId !== session.user.id) {
      return NextResponse.json({ error: "Payload no encontrado" }, { status: 404 });
    }
    await db.stripeEscritorioPayload.delete({
      where: { paymentIntentId },
    });
    return NextResponse.json({ payload: row.payload });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al recuperar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
