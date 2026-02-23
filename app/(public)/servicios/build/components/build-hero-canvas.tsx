"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const BLOCKS = [
  { id: "titulo", label: "Título", width: 72 },
  { id: "texto", label: "Texto", width: 56 },
  { id: "boton", label: "Botón", width: 64 },
  { id: "imagen", label: "Imagen", width: 68 },
];

export function BuildHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !cursorRef.current) return;
    const container = containerRef.current;
    const cursor = cursorRef.current;
    const blocks = blockRefs.current.filter(Boolean) as HTMLDivElement[];
    if (blocks.length === 0) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const centerX = w / 2;
    const centerY = h / 2;
    // Radio del marco: más alejado del centro para no tapar badge, Build ni texto
    const radiusX = w * 0.42;
    const radiusY = h * 0.36;

    // Posiciones en un anillo alrededor del centro: arriba-izq, arriba-der, abajo-izq, abajo-der
    const positions = [
      { x: centerX - radiusX, y: centerY - radiusY },
      { x: centerX + radiusX, y: centerY - radiusY },
      { x: centerX - radiusX, y: centerY + radiusY },
      { x: centerX + radiusX, y: centerY + radiusY },
    ];

    const startX = centerX - radiusX + 40;
    const startY = centerY - radiusY - 20;

    gsap.set(cursor, { x: startX, y: startY });
    blocks.forEach((el, i) => {
      gsap.set(el, { x: startX, y: startY, opacity: 0.3, scale: 0.6 });
    });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });

    // Fase 1: cursor se mueve y va "soltando" cada bloque en su sitio
    blocks.forEach((el, i) => {
      const pos = positions[i];
      tl.to(cursor, {
        x: pos.x,
        y: pos.y,
        duration: 0.5,
        ease: "power2.inOut",
      });
      tl.to(
        el,
        {
          x: pos.x,
          y: pos.y,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.2)",
        },
        "<0.1"
      );
    });

    // Fase 2: cursor recorre el anillo alrededor del hero (sin pasar por el centro)
    tl.to(cursor, {
      x: centerX + radiusX - 20,
      y: centerY - radiusY,
      duration: 0.55,
      ease: "sine.inOut",
    });
    tl.to(cursor, {
      x: centerX + radiusX,
      y: centerY + radiusY - 20,
      duration: 0.5,
      ease: "sine.inOut",
    });
    tl.to(cursor, {
      x: centerX - radiusX + 20,
      y: centerY + radiusY,
      duration: 0.55,
      ease: "sine.inOut",
    });
    tl.to(cursor, {
      x: centerX - radiusX,
      y: centerY - radiusY + 20,
      duration: 0.5,
      ease: "sine.inOut",
    });
    tl.to(cursor, {
      x: startX,
      y: startY,
      duration: 0.5,
      ease: "power2.inOut",
    });

    // Reset bloques a origen para el siguiente ciclo
    tl.set(blocks, { x: startX, y: startY, opacity: 0.3, scale: 0.6 }, "+=0.2");

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
      aria-hidden
    >
      {/* Cursor */}
      <div
        ref={cursorRef}
        className="absolute left-0 top-0 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--background)] shadow-md"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
      </div>

      {/* Bloques que el cursor "coloca" */}
      {BLOCKS.map((block, i) => (
        <div
          key={block.id}
          ref={(el) => {
            blockRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 z-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] shadow-sm"
          style={{ width: block.width }}
        >
          {block.label}
        </div>
      ))}
    </div>
  );
}
