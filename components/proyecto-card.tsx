"use client";

import { Link } from "@/components/link";
import Image from "next/image";
import type { Proyecto } from "@/data/proyectos";
import { ProyectoPreviewIframe } from "@/components/proyecto-preview-iframe";

type Variant = "featured" | "grid";

interface ProyectoCardProps {
  proyecto: Proyecto;
  variant?: Variant;
  /** Si es true, la tarjeta enlaza a la lista /proyectos. */
  linkToProyectos?: boolean;
  /** Si es true, la tarjeta enlaza a la página del proyecto /proyectos/[id]. Requiere proyecto.id. */
  linkToProjectDetail?: boolean;
}

export function ProyectoCard({
  proyecto,
  variant = "grid",
  linkToProyectos = false,
  linkToProjectDetail = false,
}: ProyectoCardProps) {
  const isFeatured = variant === "featured";
  const content = (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-colors hover:border-[var(--foreground)]/15 hover:shadow-sm ${
        isFeatured
          ? "min-h-[300px] sm:min-h-[340px]"
          : "min-h-[260px] sm:min-h-[300px]"
      }`}
    >
      {/* Imagen, vista previa del sitio (iframe) o placeholder */}
      <div className={`relative w-full overflow-hidden bg-[var(--muted)] ${isFeatured ? "h-48 sm:h-52" : "h-40 sm:h-44"}`}>
        {proyecto.imagen ? (
          <Image
            src={proyecto.imagen}
            alt={proyecto.titulo}
            fill
            className="object-cover"
            sizes={isFeatured ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 33vw, 100vw"}
          />
        ) : proyecto.url ? (
          <ProyectoPreviewIframe
            url={proyecto.url}
            title={proyecto.titulo}
            className="absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--muted)]" />
        )}
        {/* Etiquetas tipo y año */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded bg-[var(--background)]/95 px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
            {proyecto.tipo}
          </span>
          <span className="rounded bg-[var(--background)]/95 px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
            {proyecto.año}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5">
        <h3 className={`font-semibold text-[var(--card-foreground)] ${isFeatured ? "text-lg sm:text-xl" : "text-base sm:text-lg"}`}>
          {proyecto.titulo}
        </h3>
        <p className={`mt-1.5 text-[var(--muted-foreground)] line-clamp-2 leading-relaxed ${isFeatured ? "text-sm" : "text-xs sm:text-sm"}`}>
          {proyecto.descripcion}
        </p>
        {linkToProyectos && (
          <span className="mt-2 inline-flex items-center text-xs font-medium text-[var(--primary)]">
            Ver proyectos →
          </span>
        )}
        {linkToProjectDetail && proyecto.id && (
          <span className="mt-2 inline-flex items-center text-xs font-medium text-[var(--primary)]">
            Ver proyecto →
          </span>
        )}
      </div>
    </article>
  );

  if (linkToProjectDetail && proyecto.id) {
    return (
      <Link
        href={`/proyectos/${proyecto.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-md"
      >
        {content}
      </Link>
    );
  }

  if (linkToProyectos) {
    return (
      <Link href="/proyectos" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
