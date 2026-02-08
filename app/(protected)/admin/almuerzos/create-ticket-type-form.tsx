"use client";

import { createTicketType } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";

export function CreateTicketTypeForm() {
  const [isPending, startTransition] = useTransition();
  const [isSpecificDate, setIsSpecificDate] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  async function handleSubmit(formData: FormData) {
    if (!isSpecificDate) {
      formData.delete("availableForDate");
    }

    startTransition(async () => {
      try {
        await createTicketType(formData);
        toast.success("Tipo de ticket creado");
        // Reset form manually or via key
        const form = document.getElementById("create-type-form") as HTMLFormElement;
        form.reset();
        setIsSpecificDate(false);
      } catch (error) {
        toast.error("Error al crear tipo");
      }
    });
  }

  return (
    <form
      id="create-type-form"
      action={handleSubmit}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-black">Imagen del plato</label>
          <ImageUpload onUploadComplete={(url) => setImageUrl(url)} />
          <input type="hidden" name="image" value={imageUrl} />
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-black">Nombre del plato (ej. Pabellón)</label>
          <input
            id="name"
            name="name"
            required
            placeholder="Nombre de la comida"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-black">Categoría</label>
          <select
            id="category"
            name="category"
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
          >
            <option value="ALMUERZO">Almuerzo</option>
            <option value="DESAYUNO">Desayuno</option>
            <option value="CENA">Cena</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-black">Precio</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-black">Descripción (Opcional)</label>
        <textarea
          id="description"
          name="description"
          placeholder="Detalles del menú..."
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black min-h-[80px]"
        />
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 p-3 bg-zinc-50">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="specific-date-check"
            checked={isSpecificDate}
            onChange={(e) => setIsSpecificDate(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="specific-date-check" className="cursor-pointer font-medium text-sm text-black">
            Es para una fecha específica (Ticket de un solo día)
          </label>
        </div>

        {isSpecificDate && (
          <div className="space-y-2 pl-6">
            <label htmlFor="availableForDate" className="block text-sm font-medium text-black">Fecha del evento/comida</label>
            <input
              id="availableForDate"
              name="availableForDate"
              type="date"
              required={isSpecificDate}
              className="w-full sm:w-auto rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
            />
            <p className="text-xs text-zinc-500">
              Los usuarios solo podrán comprar este plato para esta fecha exacta.
            </p>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="bg-blue-800 hover:bg-blue-600 text-white">
        {isPending ? "Creando..." : "Crear Almuerzo"}
      </Button>
    </form>
  );
}
