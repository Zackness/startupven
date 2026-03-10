"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createProject, updateProject } from "@/lib/actions/projects";
import { PROJECT_CATEGORY_LABELS } from "@/lib/project-categories";
import { CategoriesCombobox } from "@/app/(protected)/onboarding/_components/categories-combobox";
import { ClientsCombobox } from "./_components/clients-combobox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus, Check } from "lucide-react";

type CatalogPackage = { id: string; name: string; price: number; category: string };

type ProjectFormProps = {
  mode: "create" | "edit";
  projectId?: string;
  /** Lista de usuarios (clientes) para asignar al proyecto. */
  clients: { id: string; name: string; email: string }[];
  /** Catálogo de servicios (solo para mode create) para asignar al proyecto con duración. */
  catalogPackages?: CatalogPackage[];
  initialData?: {
    titulo: string;
    descripcion: string;
    tipo: string;
    año: string;
    imagen?: string;
    url?: string;
    orden?: number;
    categorias?: string[];
    public?: boolean;
    assignedUserIds?: string[];
  };
};

export function ProjectForm({ mode, projectId, clients, catalogPackages = [], initialData }: ProjectFormProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [categorias, setCategorias] = useState<string[]>(initialData?.categorias ?? []);
  const [selectedPackages, setSelectedPackages] = useState<{ packageId: string; durationMonths: number }[]>([]);
  const [isPublic, setIsPublic] = useState(initialData?.public ?? true);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const titulo = (formData.get("titulo") as string)?.trim();
    const descripcion = (formData.get("descripcion") as string)?.trim();
    const tipo = (formData.get("tipo") as string)?.trim();
    const año = (formData.get("año") as string)?.trim();
    const imagen = (formData.get("imagen") as string)?.trim() || undefined;
    const url = (formData.get("url") as string)?.trim() || undefined;
    const orden = parseInt((formData.get("orden") as string) || "0", 10);
    const assignedUserIds = formData.getAll("assignedUserIds") as string[];

    if (!titulo || !descripcion || !tipo || !año) {
      toast.error("Completa título, descripción, tipo y año.");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProject({
            titulo,
            descripcion,
            tipo,
            año,
            imagen,
            url,
            orden,
            categorias,
            public: isPublic,
            assignedUserIds: assignedUserIds.filter(Boolean),
            packages: selectedPackages.length > 0 ? selectedPackages : undefined,
          });
          toast.success("Proyecto creado.");
          router.push("/admin/proyectos");
          router.refresh();
        } else if (projectId) {
          await updateProject(projectId, {
            titulo,
            descripcion,
            tipo,
            año,
            imagen: imagen || null,
            url: url || null,
            orden,
            categorias: categorias.length > 0 ? categorias : null,
            public: isPublic,
            assignedUserIds: assignedUserIds.filter(Boolean),
          });
          toast.success("Proyecto actualizado.");
          router.push("/admin/proyectos");
          router.refresh();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al guardar.");
      }
    });
  }

  const filteredCatalog =
    catalogPackages.length > 0 && categorias.length > 0
      ? catalogPackages.filter((p) => categorias.includes(p.category))
      : [];
  const selectedSet = new Set(selectedPackages.map((p) => p.packageId));

  function addPackage(packageId: string) {
    if (selectedSet.has(packageId)) return;
    const category = catalogPackages.find((c) => c.id === packageId)?.category;
    const withoutSameCategory =
      category != null
        ? selectedPackages.filter((p) => {
            const cat = catalogPackages.find((c) => c.id === p.packageId)?.category;
            return cat !== category;
          })
        : selectedPackages;
    setSelectedPackages([...withoutSameCategory, { packageId, durationMonths: 1 }]);
  }

  function removePackage(packageId: string) {
    setSelectedPackages((prev) => prev.filter((p) => p.packageId !== packageId));
  }

  function setDuration(packageId: string, durationMonths: number) {
    const n = Math.max(1, Math.floor(durationMonths));
    setSelectedPackages((prev) =>
      prev.map((p) => (p.packageId === packageId ? { ...p, durationMonths: n } : p))
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <Label htmlFor="titulo" className="text-[var(--foreground)]">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          defaultValue={initialData?.titulo}
          required
          placeholder="Ej. Portal de cliente"
          className="mt-2 border-[var(--border)] bg-[var(--background)]"
        />
      </div>
      <div>
        <Label htmlFor="descripcion" className="text-[var(--foreground)]">Descripción</Label>
        <textarea
          id="descripcion"
          name="descripcion"
          defaultValue={initialData?.descripcion}
          required
          rows={4}
          placeholder="Breve descripción del proyecto."
          className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div>
        <Label className="text-[var(--foreground)]">Categorías</Label>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Clasificación del proyecto. Elige una o más para poder asignar servicios.
        </p>
        <div className="mt-2">
          <CategoriesCombobox
            selectedIds={categorias}
            onSelectionChange={setCategorias}
            disabled={pending}
          />
        </div>
      </div>

      {mode === "create" && catalogPackages.length > 0 && (
        <div>
          <Label className="text-[var(--foreground)]">Servicios del proyecto</Label>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Elige categorías arriba y asigna un servicio por categoría (por ejemplo solo Launch Básico o solo Launch Pro). Indica la duración en meses.
          </p>
          {categorias.length === 0 ? (
            <p className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
              Selecciona al menos una categoría para ver los servicios disponibles.
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Servicios disponibles para: {categorias.map((c) => PROJECT_CATEGORY_LABELS[c as keyof typeof PROJECT_CATEGORY_LABELS] ?? c).join(", ")}
              </p>

              {/* Móvil: lista compacta — clic en la fila selecciona/deselecciona */}
              <ul className="space-y-2 md:hidden">
                {filteredCatalog.map((pkg) => {
                  const isSelected = selectedSet.has(pkg.id);
                  const sel = selectedPackages.find((p) => p.packageId === pkg.id);
                  return (
                    <li
                      key={pkg.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => !pending && (isSelected ? removePackage(pkg.id) : addPackage(pkg.id))}
                      onKeyDown={(e) => {
                        if (pending) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          isSelected ? removePackage(pkg.id) : addPackage(pkg.id);
                        }
                      }}
                      className={cn(
                        "flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition-colors cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
                        isSelected && "border-[var(--primary)] bg-[var(--primary)]/5",
                        pending && "pointer-events-none opacity-60"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-[var(--foreground)]">{pkg.name}</span>
                        <span className="ml-2 text-sm text-[var(--muted-foreground)]">
                          {PROJECT_CATEGORY_LABELS[pkg.category as keyof typeof PROJECT_CATEGORY_LABELS] ?? pkg.category} · USD {pkg.price}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Label htmlFor={`duration-mob-${pkg.id}`} className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                            Duración (meses):
                          </Label>
                          <Input
                            id={`duration-mob-${pkg.id}`}
                            type="number"
                            min={1}
                            value={sel?.durationMonths ?? 1}
                            onChange={(e) => setDuration(pkg.id, e.target.valueAsNumber || 1)}
                            className="w-20 h-9 border-[var(--border)] bg-[var(--background)]"
                          />
                        </div>
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border)]" />
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Desktop: tarjetas — clic en la tarjeta selecciona/deselecciona */}
              <div className="hidden grid-cols-1 gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                {filteredCatalog.map((pkg) => {
                  const isSelected = selectedSet.has(pkg.id);
                  const sel = selectedPackages.find((p) => p.packageId === pkg.id);
                  return (
                    <Card
                      key={pkg.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => !pending && (isSelected ? removePackage(pkg.id) : addPackage(pkg.id))}
                      onKeyDown={(e) => {
                        if (pending) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          isSelected ? removePackage(pkg.id) : addPackage(pkg.id);
                        }
                      }}
                      className={cn(
                        "cursor-pointer transition-colors hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
                        isSelected && "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md",
                        pending && "pointer-events-none opacity-60"
                      )}
                    >
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
                        <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                          {PROJECT_CATEGORY_LABELS[pkg.category as keyof typeof PROJECT_CATEGORY_LABELS] ?? pkg.category}
                        </span>
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                            isSelected ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)]"
                          )}
                        >
                          {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <h3 className="font-semibold leading-tight text-[var(--foreground)]">{pkg.name}</h3>
                        <p className="text-lg font-bold text-[var(--primary)]">USD {pkg.price}</p>
                        {isSelected && (
                          <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Label htmlFor={`duration-desk-${pkg.id}`} className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                              Duración (meses):
                            </Label>
                            <Input
                              id={`duration-desk-${pkg.id}`}
                              type="number"
                              min={1}
                              value={sel?.durationMonths ?? 1}
                              onChange={(e) => setDuration(pkg.id, e.target.valueAsNumber || 1)}
                              className="w-20 h-9 border-[var(--border)] bg-[var(--background)]"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredCatalog.length === 0 && (
                <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
                  No hay servicios en el catálogo para las categorías elegidas.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="tipo" className="text-[var(--foreground)]">Tipo</Label>
          <Input
            id="tipo"
            name="tipo"
            defaultValue={initialData?.tipo}
            required
            placeholder="Ej. Página web, Plataforma, E-commerce"
            className="mt-2 border-[var(--border)] bg-[var(--background)]"
          />
        </div>
        <div>
          <Label htmlFor="año" className="text-[var(--foreground)]">Año</Label>
          <Input
            id="año"
            name="año"
            defaultValue={initialData?.año}
            required
            placeholder="Ej. 2024"
            className="mt-2 border-[var(--border)] bg-[var(--background)]"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="url" className="text-[var(--foreground)]">URL del sitio (vista previa en vivo)</Label>
        <Input
          id="url"
          name="url"
          type="url"
          defaultValue={initialData?.url}
          placeholder="https://ejemplo.com"
          className="mt-2 border-[var(--border)] bg-[var(--background)]"
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Si rellenas esto, en la web se mostrará la página del proyecto como vista previa (sin subir foto). Si el sitio no permite incrustarse, usa la URL de imagen abajo.
        </p>
      </div>
      <div>
        <Label htmlFor="imagen" className="text-[var(--foreground)]">URL de la imagen (opcional)</Label>
        <Input
          id="imagen"
          name="imagen"
          type="url"
          defaultValue={initialData?.imagen}
          placeholder="https://..."
          className="mt-2 border-[var(--border)] bg-[var(--background)]"
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Si no usas URL del sitio, puedes poner aquí una imagen del proyecto.</p>
      </div>
      <div>
        <Label htmlFor="orden" className="text-[var(--foreground)]">Orden (para destacados en inicio)</Label>
        <Input
          id="orden"
          name="orden"
          type="number"
          min={0}
          defaultValue={initialData?.orden ?? 0}
          className="mt-2 w-24 border-[var(--border)] bg-[var(--background)]"
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Menor número = más arriba en la web.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4">
        <div className="flex items-center gap-3">
          <Switch
            id="project-public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={pending}
          />
          <Label htmlFor="project-public" className="text-sm font-medium text-[var(--foreground)] cursor-pointer">
            Visible en la página principal (público)
          </Label>
        </div>
        <p className="w-full text-xs text-[var(--muted-foreground)] sm:w-auto">
          Si está activado, el proyecto se muestra en /proyectos y en los destacados del inicio. Desactívalo para trabajar en él sin publicarlo.
        </p>
      </div>

      <div>
        <Label className="text-[var(--foreground)]">Clientes asignados</Label>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Busca y selecciona uno o más clientes para asignar a este proyecto. Solo se listan usuarios con rol Cliente.
        </p>
        {clients.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">No hay clientes registrados. Crea usuarios con rol Cliente para asignarlos.</p>
        ) : (
          <div className="mt-2">
            <ClientsCombobox
              clients={clients}
              initialSelectedIds={initialData?.assignedUserIds ?? []}
              disabled={pending}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
        >
          {pending ? "Guardando…" : mode === "create" ? "Crear proyecto" : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-[var(--border)]"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
