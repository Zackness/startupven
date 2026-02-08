import { TicketTypeOption } from "./types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TicketCategory } from "@/lib/generated/prisma/enums";

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
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <ul className="divide-y divide-zinc-200">
                {types.map((type) => {
                    const selected = type.id === selectedTypeId;
                    const isDateSpecific = !!type.availableForDate;

                    return (
                        <li
                            key={type.id}
                            className={cn(
                                "flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors cursor-pointer",
                                selected && "bg-zinc-50"
                            )}
                            onClick={() => onSelect(type.id)}
                        >
                            {/* Thumbnail */}
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 border border-zinc-200">
                                {type.image ? (
                                    <img src={type.image} alt={type.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-zinc-300 text-xl">🍽️</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", CategoryColors[type.category as TicketCategory] || "bg-gray-100 text-gray-800")}>
                                        {type.category}
                                    </span>
                                    {isDateSpecific && (
                                        <span className="text-xs text-zinc-500">
                                            📅 {new Date(type.availableForDate!).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-semibold text-black truncate">{type.name}</h4>
                                {type.description && <p className="text-sm text-zinc-500 truncate">{type.description}</p>}
                            </div>

                            {/* Price & Action */}
                            <div className="text-right">
                                <p className="font-bold text-black mb-2">${type.price.toFixed(2)}</p>
                                <Button
                                    size="sm"
                                    variant={selected ? "default" : "outline"}
                                    className={cn("w-full text-white bg-blue-800 hover:bg-blue-600 hover:text-white", selected && "bg-blue-800 text-white")}
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
