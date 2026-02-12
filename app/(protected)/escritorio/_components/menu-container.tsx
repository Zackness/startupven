"use client";

import { useState } from "react";
import { TicketTypeOption } from "./types";
import { MenuCard } from "./menu-card";
import { MenuList } from "./menu-list";
import { BuyTicketForm } from "./buy-ticket-form";
import { DemoTicketButton } from "@/app/(protected)/escritorio/components/demo-ticket-button";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List as ListIcon } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

interface MenuContainerProps {
    types: TicketTypeOption[];
    balance: number;
}

export function MenuContainer({ types, balance }: MenuContainerProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedTicket, setSelectedTicket] = useState<TicketTypeOption | null>(null);

    const handleSelect = (typeId: string) => {
        const type = types.find((t) => t.id === typeId);
        if (type) setSelectedTicket(type);
    };

    // Sort: Almuerzos first, then others
    const sortedTypes = [...types].sort((a, b) => {
        if (a.category === "ALMUERZO" && b.category !== "ALMUERZO") return -1;
        if (a.category !== "ALMUERZO" && b.category === "ALMUERZO") return 1;
        return 0; // Keep original alphabetical order from backend
    });

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-black">Menú universitario</h2>
                    <p className="mt-1 text-zinc-600">
                        Elige tu comida para el comedor.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode("grid")}
                            className={viewMode === "grid" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className={viewMode === "list" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}
                        >
                            <ListIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Demo Ticket Option */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-zinc-600">
                    ¿Solo probando? Genera un ticket de demostración.
                </p>
                <DemoTicketButton />
            </div>

            {/* Content */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sortedTypes.map((type) => (
                        <MenuCard
                            key={type.id}
                            type={type}
                            selected={selectedTicket?.id === type.id}
                            onSelect={handleSelect}
                        />
                    ))}
                </div>
            ) : (
                <MenuList
                    types={sortedTypes}
                    selectedTypeId={selectedTicket?.id || ""}
                    onSelect={handleSelect}
                />
            )}

            {/* Purchase Sheet */}
            <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Detalles del pedido</SheetTitle>
                        <SheetDescription>
                            Configura tu pedido para <strong>{selectedTicket?.name}</strong>.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedTicket && (
                        <div className="space-y-6">
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200 relative">
                                {selectedTicket.image ? (
                                    <img src={selectedTicket.image} alt={selectedTicket.name} className="absolute inset-0 h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-zinc-300 text-3xl">🍽️</div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-black">{selectedTicket.name}</h3>
                                <p className="text-xl font-medium text-black">Bs. {selectedTicket.price.toFixed(2)}</p>
                                {selectedTicket.description && <p className="mt-2 text-zinc-600">{selectedTicket.description}</p>}
                            </div>

                            <div className="border-t border-zinc-100 pt-6">
                                <BuyTicketForm
                                    types={types}
                                    preSelectedId={selectedTicket!.id}
                                    balance={balance}
                                    onSuccess={() => setSelectedTicket(null)}
                                />
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
