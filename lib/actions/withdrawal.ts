"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * El usuario solicita un retiro de su saldo (ingresos de clientes).
 * La solicitud queda PENDIENTE hasta que admin la procese.
 */
export async function requestWithdrawal(amount: number, bankName: string, bankAccount: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  if (amount <= 0) throw new Error("El monto debe ser mayor a 0");
  if (!bankAccount?.trim()) throw new Error("Indica la cuenta o datos bancarios para el retiro");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true },
  });
  const balance = Number(user?.balance ?? 0);
  if (amount > balance) throw new Error("No tienes saldo suficiente para este retiro");

  await db.withdrawalRequest.create({
    data: {
      userId: session.user.id,
      amount,
      bankName: bankName?.trim() || null,
      bankAccount: bankAccount.trim(),
      status: "PENDIENTE",
    },
  });

  revalidatePath("/escritorio");
  revalidatePath("/escritorio/billetera");
}
