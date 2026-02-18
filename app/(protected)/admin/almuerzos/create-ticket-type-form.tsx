"use client";

import { createTicketType } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";

export function CreateTicketTypeForm() {
  const [isPending, startTransition] = useTransition();
  const [lugar, setLugar] = useState<"COMEDOR" | "CANTINA">("COMEDOR");
  const [imageUrl, setImageUrl] = useState("");

  async function handleSubmit(formData: FormData) {
    const lugarValue = (formData.get("lugar") as string) || "COMEDOR";
    if (lugarValue === "CANTINA") {
      formData.delete("availableForDate");
    }

    startTransition(async () => {
      try {
        await createTicketType(formData);
        toast.success("Tipo de ticket creado");
        // Reset form manually or via key
        const form = document.getElementById("create-type-form") as HTMLFormElement;
        form.reset();
        setLugar("COMEDOR");
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
          <label htmlFor="lugar" className="block text-sm font-medium text-black">Lugar</label>
          <select
            id="lugar"
            name="lugar"
            required
            value={lugar}
            onChange={(e) => setLugar(e.target.value as "COMEDOR" | "CANTINA")}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
          >
            <option value="COMEDOR">Comedor</option>
            <option value="CANTINA">Cantina</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-black">Precio (Bs.)</label>
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
        <div className="space-y-2">
          <label htmlFor="maxQuantity" className="block text-sm font-medium text-black">
            Cantidad máxima de comidas (opcional)
          </label>
          <input
            id="maxQuantity"
            name="maxQuantity"
            type="number"
            min="1"
            placeholder="Sin límite"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
          />
          <p className="text-xs text-zinc-500">
            Límite de tickets que se pueden vender para este plato (por fecha). Dejar vacío = sin límite.
          </p>
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

      {lugar === "COMEDOR" && (
        <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <label htmlFor="availableForDate" className="block text-sm font-medium text-black">
            Fecha del menú (obligatoria para comedor)
          </label>
          <input
            id="availableForDate"
            name="availableForDate"
            type="date"
            required={lugar === "COMEDOR"}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black sm:w-auto"
          />
          <p className="text-xs text-zinc-500">
            Los usuarios solo podrán comprar este plato para esta fecha.
          </p>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="bg-blue-800 hover:bg-blue-600 text-white">
        {isPending ? "Creando..." : "Crear Almuerzo"}
      </Button>
    </form>
  );
}
