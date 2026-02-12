"use client";

import { updateTicketType } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";
type Plato = {
  id: string;
  name: string;
  category: string;
  lugar: string;
  price: number;
  description: string | null;
  image: string | null;
  availableForDate: Date | null;
  active: boolean;
};

export function EditTicketTypeForm({ plato }: { plato: Plato }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(plato.image ?? "");
  const [lugar, setLugar] = useState<"COMEDOR" | "CANTINA">(
    (plato.lugar === "CANTINA" ? "CANTINA" : "COMEDOR") as "COMEDOR" | "CANTINA"
  );

  const defaultDate = plato.availableForDate
    ? new Date(plato.availableForDate).toISOString().slice(0, 10)
    : "";

  async function handleSubmit(formData: FormData) {
    const lugarValue = (formData.get("lugar") as string) || "COMEDOR";
    if (lugarValue === "CANTINA") {
      formData.delete("availableForDate");
    }

    startTransition(async () => {
      try {
        await updateTicketType(plato.id, formData);
        toast.success("Plato actualizado");
        router.push("/admin/almuerzos");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al actualizar");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-black">Imagen del plato</label>
          <ImageUpload
            defaultImage={plato.image ?? undefined}
            onUploadComplete={(url) => setImageUrl(url)}
          />
          <input type="hidden" name="image" value={imageUrl} />
        </div>
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-black">
            Nombre del plato
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={plato.name}
            placeholder="Nombre de la comida"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-black">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={plato.category}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
          >
            <option value="ALMUERZO">Almuerzo</option>
            <option value="DESAYUNO">Desayuno</option>
            <option value="CENA">Cena</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="lugar" className="block text-sm font-medium text-black">
            Lugar
          </label>
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
          <label htmlFor="price" className="block text-sm font-medium text-black">
            Precio (Bs.)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={plato.price}
            placeholder="0.00"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-black">
          Descripción (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={plato.description ?? ""}
          placeholder="Detalles del menú..."
          className="min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black"
        />
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active-check"
            name="active"
            value="true"
            defaultChecked={plato.active}
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="active-check" className="cursor-pointer text-sm font-medium text-black">
            Plato activo (visible para compra)
          </label>
        </div>
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
            defaultValue={defaultDate}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black sm:w-auto"
          />
        </div>
      )}

      <Button type="submit" disabled={isPending} className="bg-blue-800 text-white hover:bg-blue-600">
        {isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
