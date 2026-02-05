"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ExitIcon } from "@radix-ui/react-icons";
import { authClient } from "@/lib/better-auth-client";

export const UserButton = () => {
    const user = useCurrentUser();

    const onClick = async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/login";
            },
          },
        });
        window.location.href = "/login";
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="border-none w-8 h-8 mt-2 mr-4 outline-none focus:ring-0 focus:ring-offset-0">
                <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.image ?? ""} />
                    <AvatarFallback className="bg-primary">
                        <FaUser className="text-white/90" />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 border border-border bg-popover text-popover-foreground rounded-xl p-1 shadow-lg" align="end">
                <DropdownMenuItem onClick={onClick} className="cursor-pointer">
                    <ExitIcon className="h-4 w-4 mr-2" />
                    Salir
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};