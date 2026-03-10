"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Project = { id: string; titulo: string };

export function ServiciosFilter({
  projects,
  projectIdFilter,
}: {
  projects: Project[];
  projectIdFilter: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(projectId: string) {
    const next = new URLSearchParams(searchParams);
    if (projectId && projectId !== "" && projectId !== "all") {
      next.set("projectId", projectId);
    } else {
      next.set("projectId", "all");
    }
    router.push(`/escritorio/servicios?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="filter-project" className="text-sm font-medium text-[var(--muted-foreground)]">
        Proyecto:
      </label>
      <select
        id="filter-project"
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
        value={projectIdFilter ?? "all"}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">Todos los proyectos</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.titulo}
          </option>
        ))}
      </select>
    </div>
  );
}
