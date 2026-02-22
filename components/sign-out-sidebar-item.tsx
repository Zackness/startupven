"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/better-auth-client";

type Props = {
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

export function SignOutSidebarItem({
  className,
  activeClassName = "bg-[var(--primary)] text-[var(--primary-foreground)]",
  inactiveClassName = "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/login";
          },
        },
      });
      window.location.href = "/login";
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
        inactiveClassName,
        className
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {isPending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
