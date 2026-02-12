import { TicketCategory, LugarComida } from "@/lib/generated/prisma/enums";

export type TicketTypeOption = {
    id: string;
    name: string;
    category: TicketCategory;
    lugar: keyof typeof LugarComida;
    price: number;
    description: string | null;
    image: string | null;
    availableForDate: Date | null;
};
