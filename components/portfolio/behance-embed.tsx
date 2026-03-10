"use client";

import { useEffect, useState } from "react";

const BEHANCE_OEMBED = "https://www.behance.net/v2/oembed";

/**
 * Extrae el ID de un proyecto de Behance de la URL.
 */
export function getBehanceProjectId(url: string): string | null {
  try {
    const match = url.match(/behance\.net\/gallery\/(\d+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

type OEmbedState = "loading" | "success" | "error";

/**
 * Embed de Behance: intenta oEmbed primero (HTML oficial); si falla, usa iframe por ID o enlace.
 */
export function BehanceEmbed({ url }: { url: string }) {
  const [state, setState] = useState<OEmbedState>("loading");
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const encoded = encodeURIComponent(url);
    fetch(`${BEHANCE_OEMBED}?url=${encoded}`)
      .then((res) => {
        if (!res.ok) throw new Error("oEmbed no disponible");
        return res.json();
      })
      .then((data: { html?: string }) => {
        if (cancelled) return;
        if (data.html && typeof data.html === "string") {
          setEmbedHtml(data.html);
          setState("success");
        } else {
          setState("error");
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (state === "loading") {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--muted)]/20">
        <span className="text-sm text-[var(--muted-foreground)]">Cargando Behance…</span>
      </div>
    );
  }

  if (state === "success" && embedHtml) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 [&_iframe]:max-w-full">
        <div
          className="behance-oembed-wrapper [&_iframe]:min-h-[400px] [&_iframe]:w-full"
          dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-t border-[var(--border)] bg-[var(--card)] px-4 py-2 text-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          Abrir en Behance
        </a>
      </div>
    );
  }

  // Fallback: iframe por ID o enlace
  const projectId = getBehanceProjectId(url);
  if (projectId) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/20">
        <iframe
          src={`https://www.behance.net/embed/project/${projectId}?ilo0=1`}
          title="Behance project"
          className="h-[400px] w-full border-0"
          allowFullScreen
          loading="lazy"
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-t border-[var(--border)] bg-[var(--card)] px-4 py-2 text-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          Abrir en Behance
        </a>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-6 text-center text-sm text-[var(--primary)] underline"
    >
      Ver proyecto en Behance
    </a>
  );
}
