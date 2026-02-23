"use client";

/**
 * Renderiza la página del proyecto en un iframe como vista previa.
 * Si el sitio no permite ser incrustado (X-Frame-Options), se verá en blanco;
 * en ese caso conviene usar una URL de imagen en el proyecto.
 */
export function ProyectoPreviewIframe({
  url,
  title,
  className = "",
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const src = url.startsWith("http") ? url : `https://${url}`;
  return (
    <iframe
      src={src}
      title={title}
      className={`w-full h-full min-h-[200px] border-0 ${className}`}
      sandbox="allow-scripts allow-same-origin"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
