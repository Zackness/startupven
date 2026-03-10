"use client";

import { useEffect, useRef } from "react";

/**
 * Instagram no ofrece un iframe público simple; el embed oficial usa blockquote + script.
 * Cargamos el script de Instagram una sola vez y renderizamos el blockquote con la URL del post.
 */
export function InstagramEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!url || !containerRef.current) return;
    const blockquote = document.createElement("blockquote");
    blockquote.className = "instagram-media";
    blockquote.setAttribute("data-instgrm-permalink", url.replace(/\/$/, ""));
    blockquote.setAttribute("data-instgrm-version", "14");
    blockquote.setAttribute("data-instgrm-captioned", "");
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(blockquote);

    if (typeof window !== "undefined" && !loaded.current) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "//www.instagram.com/embed.js";
      script.onload = () => {
        loaded.current = true;
        const w = window as Window & { instgrm?: { Embeds?: { process: () => void } } };
        w.instgrm?.Embeds?.process?.();
      };
      document.body.appendChild(script);
      return () => {
        script.remove();
      };
    } else {
      const w = window as Window & { instgrm?: { Embeds?: { process: () => void } } };
      if (w.instgrm?.Embeds) {
        w.instgrm.Embeds.process();
      }
    }
  }, [url]);

  return (
    <div
      ref={containerRef}
      className="min-h-[400px] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 [&_iframe]:max-w-full"
    />
  );
}
