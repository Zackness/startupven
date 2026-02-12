import Image from "next/image";
import { TicketTypeOption } from "./types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TicketCategory } from "@/lib/generated/prisma/enums";

const CategoryLabels: Record<string, string> = {
  ALMUERZO: "Almuerzo",
  DESAYUNO: "Desayuno",
  CENA: "Cena",
};

const LugarLabels: Record<string, string> = {
  COMEDOR: "Comedor",
  CANTINA: "Cantina",
};

interface MenuCardProps {
    type: TicketTypeOption;
    selected: boolean;
    onSelect: (typeId: string) => void;
}

const CategoryColors: Record<TicketCategory, string> = {
    ALMUERZO: "bg-amber-100 text-amber-800 border-amber-200",
    DESAYUNO: "bg-blue-100 text-blue-800 border-blue-200",
    CENA: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export function MenuCard({ type, selected, onSelect }: MenuCardProps) {
    const isDateSpecific = !!type.availableForDate;
    // Fecha solo día (DB DATE): mostrar en UTC para no restar un día en zonas UTC-
    const dateStr = type.availableForDate
        ? new Date(type.availableForDate).toLocaleDateString("es-VE", {
            weekday: "short",
            day: "numeric",
            month: "short",
            timeZone: "UTC",
        })
        : null;

    return (
        <div
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md",
                selected ? "border-black ring-1 ring-black" : "border-zinc-200"
            )}
            onClick={() => onSelect(type.id)}
        >
            {/* Image Area */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                {type.image ? (
                    <Image
                        src={type.image}
                        alt={type.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-300">
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}

                {/* Category + Lugar Badges */}
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <span
                        className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm border",
                            CategoryColors[type.category as TicketCategory] || "bg-zinc-100 text-zinc-800 border-zinc-200"
                        )}
                    >
                        {CategoryLabels[type.category] ?? type.category}
                    </span>
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800 border border-sky-200 shadow-sm">
                        {LugarLabels[type.lugar] ?? type.lugar}
                    </span>
                </div>

                {/* Date Badge */}
                {isDateSpecific && dateStr && (
                    <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                            📅 {dateStr}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-black line-clamp-1" title={type.name}>
                        {type.name}
                    </h3>
                    <span className="font-medium text-black">
                        Bs. {type.price.toFixed(2)}
                    </span>
                </div>

                {type.description && (
                    <p className="mt-2 text-sm text-zinc-500 line-clamp-2">
                        {type.description}
                    </p>
                )}

                <div className="mt-auto pt-4">
                    <Button
                        size="sm"
                        variant={selected ? "default" : "outline"}
                        className={cn("w-full text-white hover:text-white bg-blue-800 hover:bg-blue-600", selected && "bg-blue-800 text-white")}
                    >
                        {selected ? "Seleccionado" : "Seleccionar"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
