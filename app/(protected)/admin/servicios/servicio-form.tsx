"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { PROJECT_CATEGORY_VALUES, PROJECT_CATEGORY_LABELS, type ProjectCategory } from "@/lib/project-categories";
import { createServicePackage, updateServicePackage } from "@/lib/actions/admin-service-packages";

type ServicePackageFormProps =
  | {
      mode: "create";
      initialData?: null;
      packageId?: null;
    }
  | {
      mode: "edit";
      initialData: { name: string; price: number; category: string; description: string | null };
      packageId: string;
    };

export function ServicePackageForm(props: ServicePackageFormProps) {
  const { mode } = props;
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [id, setId] = useState(mode === "create" ? "" : props.packageId);
  const [name, setName] = useState(mode === "edit" ? props.initialData.name : "");
  const [price, setPrice] = useState(mode === "edit" ? String(props.initialData.price) : "");
  const [category, setCategory] = useState<string>(
    mode === "edit" ? props.initialData.category : PROJECT_CATEGORY_VALUES[0]
  );
  const [description, setDescription] = useState(
    mode === "edit" ? props.initialData.description ?? "" : ""
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Precio no válido.");
      return;
    }
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createServicePackage({
            id: id.trim(),
            name: name.trim(),
            price: priceNum,
            category: category as ProjectCategory,
            description: description.trim() || null,
          });
          router.push("/admin/servicios");
          router.refresh();
        } else {
          await updateServicePackage(props.packageId, {
            name: name.trim(),
            price: priceNum,
            category: category as ProjectCategory,
            description: description.trim() || null,
          });
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormError message={error || undefined} />
      {mode === "create" && (
        <div className="grid gap-2">
          <Label htmlFor="servicio-id">ID (clave única, ej. LAUNCH_BASICO) *</Label>
          <Input
            id="servicio-id"
            value={id}
            onChange={(e) => setId(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
            placeholder="LAUNCH_BASICO"
            disabled={isPending}
            required
            className="font-mono"
          />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="servicio-name">Nombre *</Label>
        <Input
          id="servicio-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Plan Básico Launch"
          disabled={isPending}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="servicio-price">Precio (USD) *</Label>
        <Input
          id="servicio-price"
          type="number"
          min={0}
          step={0.01}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
          disabled={isPending}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="servicio-category">Categoría *</Label>
        <select
          id="servicio-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isPending}
          className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {PROJECT_CATEGORY_VALUES.map((val) => (
            <option key={val} value={val}>
              {PROJECT_CATEGORY_LABELS[val]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="servicio-description">Descripción (opcional)</Label>
        <Input
          id="servicio-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descripción del paquete"
          disabled={isPending}
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
          {isPending ? "Guardando…" : mode === "create" ? "Crear paquete" : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className="border-[var(--border)]"
          onClick={() => router.push("/admin/servicios")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
