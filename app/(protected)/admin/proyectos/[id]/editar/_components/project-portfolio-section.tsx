"use client";

import { useTransition, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  addPortfolioItem,
  deletePortfolioItem,
  reorderPortfolioItems,
} from "@/lib/actions/project-portfolio";
import {
  PORTFOLIO_ITEM_TYPES,
  PORTFOLIO_ITEM_TYPE_LABELS,
  detectPortfolioTypeFromUrl,
  type PortfolioItemType,
} from "@/lib/portfolio-item-types";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";

type PortfolioItem = {
  id: string;
  type: string;
  url: string;
  orden: number;
  caption?: string;
};

export function ProjectPortfolioSection({
  projectId,
  initialItems,
  projectTitle,
}: {
  projectId: string;
  initialItems: PortfolioItem[];
  projectTitle?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [newType, setNewType] = useState<PortfolioItemType>("IMAGE");
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      setDragOverIndex(null);
      setDraggedIndex(null);
      if (draggedIndex === null || draggedIndex === dropIndex) return;
      const newOrder = [...items];
      const [removed] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(dropIndex, 0, removed);
      setItems(newOrder);
      const orderedIds = newOrder.map((i) => i.id).filter(Boolean);
      if (orderedIds.length === 0) return;
      startTransition(async () => {
        try {
          await reorderPortfolioItems(projectId, orderedIds);
          toast.success("Orden actualizado.");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error al reordenar.");
          setItems(initialItems);
        }
      });
    },
    [items, draggedIndex, projectId, initialItems, router]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) {
      toast.error("Escribe la URL del enlace.");
      return;
    }
    startTransition(async () => {
      try {
        const detected = detectPortfolioTypeFromUrl(url);
        const type = detected ?? newType;
        await addPortfolioItem(projectId, { type, url, caption: newCaption.trim() || undefined });
        toast.success("Enlace agregado al portafolio.");
        setNewUrl("");
        setNewCaption("");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al agregar.");
      }
    });
  }

  useEffect(() => {
    setItems(initialItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialItems.length, initialItems.map((i) => i.id).join(",")]);

  function handleDelete(itemId: string) {
    if (!confirm("¿Eliminar este ítem del portafolio?")) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    startTransition(async () => {
      try {
        await deletePortfolioItem(itemId);
        toast.success("Eliminado.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al eliminar.");
        setItems(initialItems);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Portafolio de fotos y redes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Añade enlaces a publicaciones de Instagram, Behance, imágenes o vídeos. Se mostrarán al ver el proyecto en la web.
          Arrastra un ítem por el icono de barras para reordenar.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/10 p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">Tipo</span>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as PortfolioItemType)}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            {PORTFOLIO_ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {PORTFOLIO_ITEM_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[200px] flex-1 flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">URL</span>
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://www.instagram.com/p/... o https://www.behance.net/gallery/..."
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-xs font-medium text-[var(--muted-foreground)]">Caption (opcional)</span>
          <input
            type="text"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder="Pie de foto"
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
          />
        </label>
        <Button type="submit" disabled={pending} size="sm" className="shrink-0 bg-[var(--primary)] text-[var(--primary-foreground)]">
          <Plus className="mr-1.5 h-4 w-4" />
          Agregar
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] py-8 text-center text-sm text-[var(--muted-foreground)]">
          No hay ítems en el portafolio. Añade enlaces arriba para que se muestren al ver el proyecto.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id || index}
              draggable={!!item.id}
              onDragStart={() => item.id && handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 transition-colors ${
                draggedIndex === index ? "opacity-50" : ""
              } ${dragOverIndex === index ? "ring-2 ring-[var(--primary)]/50" : ""}`}
            >
              {item.id ? (
                <span
                  className="flex h-8 w-8 shrink-0 cursor-grab active:cursor-grabbing items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"
                  aria-label="Arrastrar para reordenar"
                >
                  <GripVertical className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-xs font-medium text-[var(--muted-foreground)]">
                  {index + 1}
                </span>
              )}
              <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
                {PORTFOLIO_ITEM_TYPE_LABELS[item.type as PortfolioItemType] ?? item.type}
              </span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm text-[var(--primary)] underline hover:no-underline"
              >
                {item.url}
              </a>
              {item.caption && (
                <span className="w-full text-xs text-[var(--muted-foreground)] sm:w-auto">{item.caption}</span>
              )}
              {item.id && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-red-600 hover:bg-red-500/10 hover:text-red-600"
                  onClick={() => handleDelete(item.id)}
                  disabled={pending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-[var(--muted-foreground)]">
        Al guardar, los ítems se verán en la página del proyecto (enlace &quot;Ver proyecto&quot; en la web). Puedes usar enlaces de
        Instagram (p/reel/reels), Behance (gallery), YouTube, Vimeo o URLs directas de imagen/vídeo.
      </p>
    </div>
  );
}
