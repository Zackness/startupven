"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/better-auth-client";

export function SignOutButton() {
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
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      className="w-full gap-2 border-zinc-300 text-zinc-700 hover:bg-zinc-50"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Saliendo…" : "Salir"}
    </Button>
  );
}
