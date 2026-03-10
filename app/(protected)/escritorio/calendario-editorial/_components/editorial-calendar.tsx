"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PROJECT_CATEGORY_VALUES, PROJECT_CATEGORY_LABELS } from "@/lib/project-categories";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, FileQuestion } from "lucide-react";

type Platform = "Instagram" | "Facebook" | "TikTok" | "X" | "LinkedIn" | "YouTube" | "Blog" | "Otro";
type PostType = "Reel" | "Post" | "Historia" | "Carrusel" | "Video" | "Artículo" | "Otro";
type FormatKind = "BTS" | "Lifestyle" | "Educativo" | "Promoción" | "Testimonial" | "Otro";
type Status =
  | "Publicado"
  | "Programado"
  | "Aprobado"
  | "Pendiente de aprobación"
  | "Pendiente de diseño"
  | "Pendiente de grabación"
  | "Pendiente de edición"
  | "Borrador";

export type EditorialItem = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  platform: Platform;
  type: PostType;
  /** Título / tema del post */
  title: string;
  /** Copy principal del contenido */
  caption?: string;
  /** Semana editorial (ej. Semana 1, Semana 2) */
  week?: string;
  /** Formato: BTS, lifestyle, etc. */
  format?: FormatKind;
  /** Objetivo de la pieza */
  objective?: string;
  /** Llamado a la acción principal */
  cta?: string;
  /** KPI que se quiere mover/medir */
  kpi?: string;
  status: Status;
  link?: string;
};

const ALL_PLATFORMS_VALUE = "Todas" as const;
type PlatformFilter = typeof ALL_PLATFORMS_VALUE | Platform;

// Clave para posibles integraciones de guardado local (no se usa en el flujo actual de API,
// pero mantiene compatibilidad con las funciones safeLoad/safeSave).
const STORAGE_KEY = "editorial-calendar-items";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMondayIndex(jsDay: number) {
  // JS: 0 domingo..6 sábado → queremos 0 lunes..6 domingo
  return (jsDay + 6) % 7;
}

function startOfCalendarGrid(month: Date) {
  const first = startOfMonth(month);
  const offset = getMondayIndex(first.getDay());
  const d = new Date(first);
  d.setDate(first.getDate() - offset);
  return d;
}

function formatMonthTitle(d: Date) {
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

function getWeekOfMonthLabel(d: Date) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const offset = getMondayIndex(first.getDay());
  const day = d.getDate();
  const weekIndex = Math.floor((offset + day - 1) / 7) + 1;
  return `Semana ${weekIndex}`;
}

function safeLoad(): EditorialItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EditorialItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x?.id === "string" && typeof x?.date === "string");
  } catch {
    return [];
  }
}

function safeSave(items: EditorialItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function statusStyles(status: Status) {
  switch (status) {
    case "Publicado":
    case "Aprobado":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
    case "Programado":
      return "bg-[var(--primary)]/10 text-[var(--foreground)] border-[var(--border)]";
    default:
      // Pendientes / borrador
      return "bg-[var(--muted)]/50 text-[var(--foreground)] border-[var(--border)]";
  }
}

function typeColorStyles(type: PostType) {
  switch (type) {
    case "Reel":
      return "border-violet-500/50 bg-violet-500/15 text-violet-100";
    case "Post":
      return "border-sky-500/50 bg-sky-500/15 text-sky-100";
    case "Historia":
      return "border-amber-500/50 bg-amber-500/15 text-amber-100";
    case "Carrusel":
      return "border-pink-500/50 bg-pink-500/15 text-pink-100";
    case "Video":
      return "border-indigo-500/50 bg-indigo-500/15 text-indigo-100";
    case "Artículo":
      return "border-emerald-500/50 bg-emerald-500/15 text-emerald-100";
    default:
      return "border-[var(--border)] bg-[var(--muted)]/40 text-[var(--foreground)]";
  }
}

export function EditorialCalendar({
  className,
  canEdit = true,
  projectId: projectIdProp,
  assignedProjects = [],
  createProjectAction,
}: {
  className?: string;
  canEdit?: boolean;
  /** Si se define, se muestra y edita el cronograma de este proyecto (solo EDITOR/ADMIN). */
  projectId?: string;
  /** Proyectos asignados al usuario (cliente). Si hay más de uno, se muestra selector para cambiar de proyecto. */
  assignedProjects?: { id: string; titulo: string }[];
  /** Acción para crear proyecto como cliente (solo se usa cuando no hay proyectos). */
  createProjectAction?: (data: { titulo: string; descripcion?: string; categoria?: string }) => Promise<{ id: string; titulo: string }>;
}) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [createTitulo, setCreateTitulo] = useState("");
  const [createDescripcion, setCreateDescripcion] = useState("");
  const [createCategoria, setCreateCategoria] = useState("LAUNCH");
  const [createError, setCreateError] = useState("");
  const [createPending, setCreatePending] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const effectiveProjectId =
    assignedProjects.length > 0
      ? (selectedProjectId || undefined)
      : projectIdProp;
  const showProjectSection = assignedProjects.length > 0 || projectIdProp == null;
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [items, setItems] = useState<EditorialItem[]>([]);
  const readOnly = !canEdit;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>(ALL_PLATFORMS_VALUE);
  const [form, setForm] = useState<Omit<EditorialItem, "id" | "date"> & { date: string }>({
    date: toYmd(new Date()),
    time: "",
    platform: "Instagram",
    type: "Post",
    title: "",
    caption: "",
    week: getWeekOfMonthLabel(new Date()),
    format: "Otro",
    objective: "",
    cta: "",
    kpi: "",
    status: "Pendiente de diseño",
    link: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = effectiveProjectId
          ? `/api/editorial-posts?projectId=${encodeURIComponent(effectiveProjectId)}`
          : "/api/editorial-posts";
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as EditorialItem[];
        if (!cancelled) setItems(data);
      } catch {
        // silencio: en el peor caso no se cargan publicaciones
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveProjectId]);

  useEffect(() => {
    // Si cambias de mes, selecciona el primer día del mes si la fecha actual queda muy fuera.
    const monthStart = startOfMonth(currentMonth);
    if (selectedDate.getMonth() !== monthStart.getMonth() || selectedDate.getFullYear() !== monthStart.getFullYear()) {
      setSelectedDate(new Date(monthStart));
    }
  }, [currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const gridDays = useMemo(() => {
    const start = startOfCalendarGrid(currentMonth);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentMonth]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, EditorialItem[]>();
    for (const it of items) {
      const arr = map.get(it.date) ?? [];
      arr.push(it);
      map.set(it.date, arr);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    }
    return map;
  }, [items]);

  function openCreate(forDate: Date) {
    if (!canEdit) return;
    const ymd = toYmd(forDate);
    setEditingId(null);
    setForm({
      date: ymd,
      time: "",
      platform: "Instagram",
      type: "Post",
      title: "",
      caption: "",
      week: getWeekOfMonthLabel(forDate),
      format: "Otro",
      objective: "",
      cta: "",
      kpi: "",
      status: "Pendiente de diseño",
      link: "",
    });
    setDialogOpen(true);
  }

  function openEdit(it: EditorialItem) {
    setEditingId(it.id);
    setForm({
      date: it.date,
      time: it.time ?? "",
      platform: it.platform,
      type: it.type,
      title: it.title,
      caption: it.caption ?? "",
      week: it.week ?? getWeekOfMonthLabel(new Date(it.date)),
      format: it.format ?? "Otro",
      objective: it.objective ?? "",
      cta: it.cta ?? "",
      kpi: it.kpi ?? "",
      status: it.status,
      link: it.link ?? "",
    });
    setDialogOpen(true);
  }

  function submit() {
    if (!canEdit) return;
    const title = form.title.trim();
    if (!title) return;

    const payload: Omit<EditorialItem, "id"> = {
      date: form.date,
      time: form.time?.trim() ? form.time.trim() : undefined,
      platform: form.platform,
      type: form.type,
      title,
      caption: form.caption?.trim() ? form.caption.trim() : undefined,
      week: form.week?.trim() ? form.week.trim() : undefined,
      format: form.format,
      objective: form.objective?.trim() ? form.objective.trim() : undefined,
      cta: form.cta?.trim() ? form.cta.trim() : undefined,
      kpi: form.kpi?.trim() ? form.kpi.trim() : undefined,
      status: form.status,
      link: form.link?.trim() ? form.link.trim() : undefined,
    };

    (async () => {
      try {
        const url = editingId ? `/api/editorial-posts/${editingId}` : "/api/editorial-posts";
        const body = effectiveProjectId ? { ...payload, projectId: effectiveProjectId } : payload;
        const res = await fetch(url, {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) return;
        const saved = (await res.json()) as EditorialItem;
        setItems((prev) => {
          if (editingId) return prev.map((x) => (x.id === saved.id ? saved : x));
          return [...prev, saved];
        });
        setDialogOpen(false);
      } catch {
        // silencio: podríamos añadir toast de error más adelante
      }
    })();
  }

  function remove(id: string) {
    if (!canEdit) return;
    (async () => {
      try {
        const res = await fetch(`/api/editorial-posts/${id}`, { method: "DELETE" });
        if (!res.ok) return;
        setItems((prev) => prev.filter((x) => x.id !== id));
      } catch {
        // silencio
      }
    })();
  }

  function submitCreateProject(titulo: string, descripcion: string, categoria: string) {
    if (!createProjectAction) return;
    setCreateError("");
    const t = titulo.trim();
    if (!t) {
      setCreateError("El nombre del proyecto es obligatorio.");
      return;
    }
    setCreatePending(true);
    createProjectAction({
      titulo: t,
      descripcion: descripcion.trim() || undefined,
      categoria: PROJECT_CATEGORY_VALUES.includes(categoria as (typeof PROJECT_CATEGORY_VALUES)[number]) ? categoria : undefined,
    })
      .then(() => {
        router.refresh();
        setCreateProjectDialogOpen(false);
        setCreateTitulo("");
        setCreateDescripcion("");
        setCreateCategoria("LAUNCH");
      })
      .catch((err) => {
        setCreateError(err instanceof Error ? err.message : "Error al crear el proyecto");
      })
      .finally(() => setCreatePending(false));
  }

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
  const monthTitle = formatMonthTitle(currentMonth);
  const today = new Date();

  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]",
        className
      )}
    >
      {/* Overlay bloqueante cuando no hay proyectos: mensaje + formulario crear proyecto */}
      {showProjectSection && assignedProjects.length === 0 && createProjectAction && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--card)]/95 p-4"
          aria-modal="true"
          role="alertdialog"
          aria-labelledby="no-project-title"
          aria-describedby="no-project-desc"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/20 p-3">
                <FileQuestion className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 id="no-project-title" className="text-lg font-semibold text-[var(--foreground)]">
                  No tienes proyecto
                </h2>
                <p id="no-project-desc" className="text-sm text-[var(--muted-foreground)]">
                  Crea uno para usar el calendario editorial.
                </p>
              </div>
            </div>
            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                submitCreateProject(createTitulo, createDescripcion, createCategoria);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="create-project-categoria">Tipo de servicio / categoría</Label>
                <select
                  id="create-project-categoria"
                  value={createCategoria}
                  onChange={(e) => setCreateCategoria(e.target.value)}
                  disabled={createPending}
                  className="flex h-9 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-1 text-sm text-[var(--foreground)]"
                >
                  {PROJECT_CATEGORY_VALUES.map((val) => (
                    <option key={val} value={val}>
                      {PROJECT_CATEGORY_LABELS[val]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-project-titulo">Nombre del proyecto *</Label>
                <Input
                  id="create-project-titulo"
                  value={createTitulo}
                  onChange={(e) => setCreateTitulo(e.target.value)}
                  placeholder="Ej. Mi sitio web, Redes sociales..."
                  disabled={createPending}
                  className="border-[var(--border)] bg-[var(--background)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-project-descripcion">Descripción (opcional)</Label>
                <Input
                  id="create-project-descripcion"
                  value={createDescripcion}
                  onChange={(e) => setCreateDescripcion(e.target.value)}
                  placeholder="Breve descripción del proyecto"
                  disabled={createPending}
                  className="border-[var(--border)] bg-[var(--background)]"
                />
              </div>
              {createError && (
                <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
              )}
              <Button type="submit" disabled={createPending} className="w-full">
                {createPending ? "Creando…" : "Crear proyecto"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Toolbar (tipo Google Calendar) */}
      <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--background)]/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {showProjectSection && (
            assignedProjects.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  Proyecto
                </span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)]"
                >
                  <option value="">General</option>
                  {assignedProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titulo}
                    </option>
                  ))}
                </select>
                {createProjectAction && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 border-[var(--border)]"
                    onClick={() => {
                    setCreateTitulo("");
                    setCreateDescripcion("");
                    setCreateError("");
                    setCreateProjectDialogOpen(true);
                    setCreateCategoria("LAUNCH");
                    }}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Crear proyecto
                  </Button>
                )}
              </div>
            ) : null
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const t = new Date();
              setCurrentMonth(startOfMonth(t));
              setSelectedDate(t);
            }}
          >
            Hoy
          </Button>
          <div className="ml-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Calendario editorial</p>
            <p className="text-lg font-semibold text-[var(--foreground)] capitalize">{monthTitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              RRSS
            </span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
              className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)]"
            >
              <option value={ALL_PLATFORMS_VALUE}>Todas</option>
              {(
                ["Instagram", "Facebook", "TikTok", "X", "LinkedIn", "YouTube", "Blog", "Otro"] as Platform[]
              ).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          {canEdit && (
            <Button type="button" onClick={() => openCreate(selectedDate)}>
              <Plus className="h-4 w-4" />
              Nueva publicación
            </Button>
          )}
        </div>
      </div>

      {/* Body: grilla del mes a ancho completo (sin panel derecho) */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Week header */}
        <div className="grid grid-cols-7 gap-px border-b border-[var(--border)] bg-[var(--border)]">
          {weekDays.map((d) => (
            <div
              key={d}
              className="bg-[var(--background)] px-3 py-2 text-center text-xs font-semibold text-[var(--muted-foreground)]"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Month grid (full width) */}
        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-px bg-[var(--border)]">
            {gridDays.map((d) => {
              const ymd = toYmd(d);
              const inMonth = d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
              const isSelected = isSameDay(d, selectedDate);
              const isToday = isSameDay(d, today);
              const dayItems = (itemsByDate.get(ymd) ?? []).filter(
                (it) => platformFilter === ALL_PLATFORMS_VALUE || it.platform === platformFilter
              );
              const visible = dayItems.slice(0, 3);
              const remaining = Math.max(0, dayItems.length - visible.length);

              return (
                <div
                  key={ymd}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDate(d)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedDate(d);
                  }}
                  className={cn(
                    "group relative min-h-0 bg-[var(--background)] p-2 transition-colors",
                    "hover:bg-[var(--accent)]",
                    !inMonth && "opacity-50",
                    isSelected && "bg-[var(--primary)]/8"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold",
                        isToday && "border border-[var(--primary)] text-[var(--primary)]",
                        isSelected && "bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--primary)]",
                        !isSelected && "text-[var(--foreground)]"
                      )}
                    >
                      {d.getDate()}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreate(d);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] opacity-0 transition-opacity hover:bg-[var(--muted)] group-hover:opacity-100"
                        aria-label="Añadir publicación"
                        title="Añadir publicación"
                      >
                        <Plus className="h-4 w-4 text-[var(--muted-foreground)]" />
                      </button>
                    )}
                  </div>

                  {/* Eventos del día (tipo Google Calendar) */}
                  <div className="mt-2 space-y-1">
                    {visible.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(d);
                          openEdit(it);
                        }}
                        className={cn(
                          "w-full truncate rounded-md border px-2 py-1 text-left text-[11px] leading-tight",
                          typeColorStyles(it.type)
                        )}
                        title={it.title}
                      >
                        {(it.time ? `${it.time} · ` : "") + it.title}
                      </button>
                    ))}
                    {remaining > 0 && (
                      <div className="text-[11px] font-medium text-[var(--muted-foreground)]">
                        +{remaining} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar publicación" : "Nueva publicación"}</DialogTitle>
            <DialogDescription>
              Define plataforma, tipo, hora y el contenido. Se guarda en este navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[60vh] min-w-0 gap-4 overflow-y-auto pr-3 sm:max-h-[70vh] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--muted)]/50">
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" value={form.date} readOnly className="min-w-0" />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className="min-w-0"
                />
              </div>
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="week">Semana</Label>
                <Input
                  id="week"
                  value={form.week ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, week: e.target.value }))}
                  placeholder="Semana 1, Semana 2..."
                  className="min-w-0"
                />
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="platform">Plataforma</Label>
                <select
                  id="platform"
                  value={form.platform}
                  onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as Platform }))}
                  className="h-10 min-w-0 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
                >
                  {(["Instagram", "Facebook", "TikTok", "X", "LinkedIn", "YouTube", "Blog", "Otro"] as Platform[]).map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PostType }))}
                  className="h-10 min-w-0 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
                >
                  {(["Reel", "Post", "Historia", "Carrusel", "Video", "Artículo", "Otro"] as PostType[]).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="format">Formato</Label>
                <select
                  id="format"
                  value={form.format ?? "Otro"}
                  onChange={(e) => setForm((f) => ({ ...f, format: e.target.value as FormatKind }))}
                  className="h-10 min-w-0 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
                >
                  {(["BTS", "Lifestyle", "Educativo", "Promoción", "Testimonial", "Otro"] as FormatKind[]).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
                  className="h-10 min-w-0 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
                >
                  <option value="Publicado">Publicado</option>
                  <option value="Programado">Programado</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Pendiente de aprobación">Pendiente de aprobación</option>
                  <option value="Pendiente de diseño">Pendiente de diseño</option>
                  <option value="Pendiente de grabación">Pendiente de grabación</option>
                  <option value="Pendiente de edición">Pendiente de edición</option>
                  <option value="Borrador">Borrador</option>
                </select>
              </div>
            </div>

            <div className="grid min-w-0 gap-2">
              <Label htmlFor="title">Título del post (tema)</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ej: Reel: beneficios del servicio Build"
                className="min-w-0"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Consejo: usa un título corto que permita identificar la pieza desde el calendario.
              </p>
            </div>

            <div className="grid min-w-0 gap-2">
              <Label htmlFor="caption">Copy</Label>
              <textarea
                id="caption"
                value={form.caption ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                rows={4}
                placeholder="Escribe el copy, hashtags, CTA..."
                className="min-w-0 w-full resize-none rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            <div className="grid min-w-0 gap-2">
              <Label htmlFor="objective">Objetivo</Label>
              <textarea
                id="objective"
                value={form.objective ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                rows={3}
                placeholder="Ej: aumentar awareness de Launch, llevar tráfico al blog, generar leads..."
                className="min-w-0 w-full resize-none rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="cta">CTA</Label>
                <Input
                  id="cta"
                  value={form.cta ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
                  placeholder="Ej: Reservar llamada, ir al link de la bio..."
                  className="min-w-0"
                />
              </div>
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="kpi">KPI</Label>
                <Input
                  id="kpi"
                  value={form.kpi ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, kpi: e.target.value }))}
                  placeholder="Ej: clics al enlace, guardados, formularios enviados..."
                  className="min-w-0"
                />
              </div>
            </div>

            <div className="grid min-w-0 gap-2">
              <Label htmlFor="link">Enlace (opcional)</Label>
              <Input
                id="link"
                value={form.link ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="https://..."
                className="min-w-0"
              />
            </div>
          </div>

          <DialogFooter className="mt-2 flex flex-wrap items-center justify-between gap-3">
            {canEdit && editingId && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (!editingId) return;
                  const ok = window.confirm("¿Eliminar esta publicación del calendario?");
                  if (!ok) return;
                  remove(editingId);
                  setDialogOpen(false);
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Eliminar
              </Button>
            )}
            <div className="flex flex-1 justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              {canEdit && (
                <Button type="button" onClick={submit} disabled={!form.title.trim()}>
                  {editingId ? "Guardar cambios" : "Crear publicación"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Crear proyecto (cuando ya tiene proyectos) */}
      {createProjectAction && (
        <Dialog open={createProjectDialogOpen} onOpenChange={setCreateProjectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear proyecto</DialogTitle>
              <DialogDescription>
                Añade un nuevo proyecto para organizar el calendario editorial. Según los proyectos se te facturará el servicio.
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitCreateProject(createTitulo, createDescripcion, createCategoria);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="dialog-create-categoria">Tipo de servicio / categoría</Label>
                <select
                  id="dialog-create-categoria"
                  value={createCategoria}
                  onChange={(e) => setCreateCategoria(e.target.value)}
                  disabled={createPending}
                  className="flex h-9 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-1 text-sm text-[var(--foreground)]"
                >
                  {PROJECT_CATEGORY_VALUES.map((val) => (
                    <option key={val} value={val}>
                      {PROJECT_CATEGORY_LABELS[val]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-create-titulo">Nombre del proyecto *</Label>
                <Input
                  id="dialog-create-titulo"
                  value={createTitulo}
                  onChange={(e) => setCreateTitulo(e.target.value)}
                  placeholder="Ej. Mi sitio web, Redes sociales..."
                  disabled={createPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-create-descripcion">Descripción (opcional)</Label>
                <Input
                  id="dialog-create-descripcion"
                  value={createDescripcion}
                  onChange={(e) => setCreateDescripcion(e.target.value)}
                  placeholder="Breve descripción del proyecto"
                  disabled={createPending}
                />
              </div>
              {createError && (
                <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateProjectDialogOpen(false)} disabled={createPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPending}>
                  {createPending ? "Creando…" : "Crear proyecto"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

