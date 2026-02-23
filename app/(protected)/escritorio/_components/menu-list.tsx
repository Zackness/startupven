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

interface MenuListProps {
    types: TicketTypeOption[];
    selectedTypeId: string;
    onSelect: (typeId: string) => void;
}

const CategoryColors: Record<TicketCategory, string> = {
    ALMUERZO: "bg-amber-100 text-amber-800",
    DESAYUNO: "bg-blue-100 text-blue-800",
    CENA: "bg-indigo-100 text-indigo-800",
};

export function MenuList({ types, selectedTypeId, onSelect }: MenuListProps) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <ul className="divide-y divide-[var(--border)]">
                {types.map((type) => {
                    const selected = type.id === selectedTypeId;
                    const isDateSpecific = !!type.availableForDate;

                    return (
                        <li
                            key={type.id}
                            className={cn(
                                "flex items-center gap-4 p-4 hover:bg-[var(--muted)]/50 transition-colors cursor-pointer",
                                selected && "bg-[var(--muted)]/50"
                            )}
                            onClick={() => onSelect(type.id)}
                        >
                            {/* Thumbnail */}
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[var(--muted)] border border-[var(--border)]">
                                {type.image ? (
                                    <img src={type.image} alt={type.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)] text-xl">🍽️</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", CategoryColors[type.category as TicketCategory] || "bg-gray-100 text-gray-800")}>
                                        {CategoryLabels[type.category] ?? type.category}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-sky-800 bg-sky-100">
                                        {LugarLabels[type.lugar] ?? type.lugar}
                                    </span>
                                    {isDateSpecific && type.availableForDate && (
                                        <span className="text-xs text-zinc-500">
                                            📅 {new Date(type.availableForDate).toLocaleDateString("es-VE", { day: "numeric", month: "short", timeZone: "UTC" })}
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-semibold text-[var(--foreground)] truncate">{type.name}</h4>
                                {type.description && <p className="text-sm text-[var(--muted-foreground)] truncate">{type.description}</p>}
                            </div>

                            {/* Price & Action */}
                            <div className="text-right">
                                <p className="font-bold text-[var(--foreground)] mb-2">Bs. {type.price.toFixed(2)}</p>
                                <Button
                                    size="sm"
                                    variant={selected ? "default" : "outline"}
                                    className={cn("w-full border-[var(--border)]", selected && "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90")}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(type.id);
                                    }}
                                >
                                    {selected ? "Seleccionado" : "Seleccionar"}
                                </Button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
