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
            {/* Header — tono estratégico, claridad (identidad STARTUPVEN) */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                        Oferta disponible
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        Selecciona tu ticket para el comedor.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-md border border-[var(--border)] bg-[var(--muted)]/50 p-0.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode("grid")}
                            className={viewMode === "grid" ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className={viewMode === "list" ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}
                        >
                            <ListIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Demo Ticket */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                    Ticket de demostración.
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
                        <SheetTitle className="text-[var(--foreground)]">Detalles del pedido</SheetTitle>
                        <SheetDescription className="text-[var(--muted-foreground)]">
                            Configura tu pedido para <strong>{selectedTicket?.name}</strong>.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedTicket && (
                        <div className="space-y-6">
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-[var(--muted)] border border-[var(--border)] relative">
                                {selectedTicket.image ? (
                                    <img src={selectedTicket.image} alt={selectedTicket.name} className="absolute inset-0 h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-zinc-300 text-3xl">🍽️</div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-[var(--foreground)]">{selectedTicket.name}</h3>
                                <p className="text-xl font-medium text-[var(--foreground)]">Bs. {selectedTicket.price.toFixed(2)}</p>
                                {selectedTicket.description && <p className="mt-2 text-sm text-[var(--muted-foreground)]">{selectedTicket.description}</p>}
                            </div>

                            <div className="border-t border-[var(--border)] pt-6">
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
