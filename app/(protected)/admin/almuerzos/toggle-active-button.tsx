"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleTicketTypeActive } from "@/lib/actions/tickets";

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await toggleTicketTypeActive(id);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleClick}
      className="text-white hover:text-white bg-red-800 hover:bg-red-600"
    >
      {isPending ? "..." : active ? "Desactivar" : "Activar"}
    </Button>
  );
}
