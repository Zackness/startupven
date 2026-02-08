"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getWalletBalance() {
    const session = await auth();
    if (!session?.user?.id) return { balance: 0, transactions: [] };

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true },
    });

    const transactions = await db.walletTransaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    return {
        balance: Number(user?.balance || 0),
        transactions: transactions.map((t) => ({
            id: t.id,
            amount: Number(t.amount),
            type: t.type,
            reference: t.reference,
            createdAt: t.createdAt,
        })),
    };
}

// Dev/Admin tool to add funds
export async function adminTopUpWallet(userId: string, amount: number) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    // In a real app, check for ADMIN role. For now, assuming dev use or protected route.

    await db.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: { balance: { increment: amount } },
        });

        await tx.walletTransaction.create({
            data: {
                userId,
                amount,
                type: "DEPOSITO",
                reference: "Recarga Manual Admin",
            },
        });
    });

    revalidatePath("/escritorio");
}
