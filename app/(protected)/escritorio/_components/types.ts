import { TicketCategory } from "@/lib/generated/prisma/enums";

export type TicketTypeOption = {
    id: string;
    name: string;
    category: TicketCategory;
    price: number;
    description: string | null;
    image: string | null;
    availableForDate: Date | null;
};
