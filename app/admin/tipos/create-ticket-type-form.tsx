"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createTicketType } from "@/lib/actions/tickets";

export function CreateTicketTypeForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await createTicketType(formData);
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
      <div className="min-w-[180px]">
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-black">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ej. Comida"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
        />
      </div>
      <div className="min-w-[120px]">
        <label htmlFor="price" className="mb-1 block text-sm font-medium text-black">
          Precio
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="0.00"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
        />
      </div>
      <div className="min-w-[200px]">
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-black">
          Descripción (opcional)
        </label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Ej. Menú del día"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
        />
      </div>
      <Button type="submit" disabled={isPending} className="bg-black text-white hover:bg-zinc-800">
        {isPending ? "Creando..." : "Crear tipo"}
      </Button>
    </form>
  );
}
