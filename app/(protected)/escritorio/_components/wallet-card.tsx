"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Wallet, History } from "lucide-react";

interface WalletCardProps {
    balance: number;
}

export function WalletCard({ balance }: WalletCardProps) {
    return (
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-100">
                    Mi Billetera
                </CardTitle>
                <Wallet className="h-4 w-4 text-indigo-100" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{balance.toFixed(2)} Ref.</div>
                <p className="text-xs text-indigo-100 mt-1">
                    Saldo disponible para compras
                </p>
            </CardContent>
        </Card>
    );
}
