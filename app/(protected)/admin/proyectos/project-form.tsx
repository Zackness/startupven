"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProject, updateProject } from "@/lib/actions/projects";
import { toast } from "sonner";

type ProjectFormProps = {
  mode: "create" | "edit";
  projectId?: string;
  initialData?: {
    titulo: string;
    descripcion: string;
    tipo: string;
    año: string;
    imagen?: string;
    url?: string;
    orden?: number;
  };
};

export function ProjectForm({ mode, projectId, initialData }: ProjectFormProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function submit(formData: FormData) {
    const titulo = (formData.get("titulo") as string)?.trim();
    const descripcion = (formData.get("descripcion") as string)?.trim();
    const tipo = (formData.get("tipo") as string)?.trim();
    const año = (formData.get("año") as string)?.trim();
    const imagen = (formData.get("imagen") as string)?.trim() || undefined;
    const url = (formData.get("url") as string)?.trim() || undefined;
    const orden = parseInt((formData.get("orden") as string) || "0", 10);

    if (!titulo || !descripcion || !tipo || !año) {
      toast.error("Completa título, descripción, tipo y año.");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProject({ titulo, descripcion, tipo, año, imagen, url, orden });
          toast.success("Proyecto creado.");
          router.push("/admin/proyectos");
          router.refresh();
        } else if (projectId) {
          await updateProject(projectId, { titulo, descripcion, tipo, año, imagen: imagen || null, url: url || null, orden });
          toast.success("Proyecto actualizado.");
          router.push("/admin/proyectos");
          router.refresh();
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al guardar.");
      }
    });
  }

  return (
    <form action={submit} className="space-y-6">
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
