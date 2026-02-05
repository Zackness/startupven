"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createDemoTicket } from "@/lib/actions/tickets";
import { ESCRITORIO_PATH } from "@/routes";

export function DemoTicketButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await createDemoTicket();
      router.push(`escritorio-2/mis-tickets`);
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="border-zinc-300 text-black hover:bg-zinc-50"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? "Generando..." : "Compra de ejemplo"}
    </Button>
  );
}
