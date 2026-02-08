"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function reportPayment(amount: number, bank: string, reference: string, method: "PAGO_MOVIL" | "STRIPE" = "PAGO_MOVIL") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("No autenticado");

    if (amount <= 0) throw new Error("Monto inválido");
    if (!bank || !reference) throw new Error("Faltan datos");

    await db.paymentReport.create({
        data: {
            userId: session.user.id,
            amount,
            bank: method === "PAGO_MOVIL" ? bank : null,
            reference,
            method,
            status: "PENDIENTE",
        },
    });

    revalidatePath("/escritorio/billetera");
}

export async function getPaymentReports(status?: "PENDIENTE" | "APROBADO" | "RECHAZADO") {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const user = session.user as unknown as { role?: string };
    if (user.role !== "ADMIN") throw new Error("No autorizado");

    return await db.paymentReport.findMany({
        where: status ? { status } : undefined,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
    });
}

export async function approvePaymentReport(reportId: string) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const user = session.user as unknown as { role?: string };
    if (user.role !== "ADMIN") throw new Error("No autorizado");

    await db.$transaction(async (tx) => {
        const report = await tx.paymentReport.findUnique({ where: { id: reportId } });
        if (!report || report.status !== "PENDIENTE") throw new Error("Reporte no válido");

        // Approve report
        await tx.paymentReport.update({
            where: { id: reportId },
            data: { status: "APROBADO" },
        });

        // Add balance to user
        await tx.user.update({
            where: { id: report.userId },
            data: { balance: { increment: report.amount } },
        });

        // Create wallet transaction
        await tx.walletTransaction.create({
            data: {
                userId: report.userId,
                amount: report.amount,
                type: "DEPOSITO",
                reference: `Recarga Aprobada #${report.reference}`,
            },
        });
    });

    revalidatePath("/admin/pagos");
}

export async function rejectPaymentReport(reportId: string) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const user = session.user as unknown as { role?: string };
    if (user.role !== "ADMIN") throw new Error("No autorizado");

    await db.paymentReport.update({
        where: { id: reportId },
        data: { status: "RECHAZADO" },
    });

    revalidatePath("/admin/pagos");
}
