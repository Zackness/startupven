"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { proyectos } from "@/data/proyectos";
import Image from "next/image";

export function HeroMonitor() {
  const screenRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !screenRef.current) return;

    const slides = slidesRef.current.filter(Boolean);
    if (slides.length === 0) return;

    const durationVisible = 3;
    const durationCrossfade = 0.6;

    const tl = gsap.timeline({ repeat: -1 });
    slides.forEach((slide) => {
      tl.set(slides, { opacity: 0 });
      tl.set(slide, { opacity: 1 });
      tl.to(slide, { opacity: 1, duration: durationCrossfade });
      tl.to({}, { duration: durationVisible });
      tl.to(slide, { opacity: 0, duration: durationCrossfade });
    });

    return () => {
      tl.kill();
    };
  }, []);

  const slides = proyectos.slice(0, 3);

  return (
    <div className="flex justify-center">
      {/* Marco del monitor */}
      <div className="relative w-full max-w-2xl">
        {/* Pantalla */}
        <div
          className="relative overflow-hidden rounded-lg border-4 border-[var(--foreground)]/20 bg-[var(--foreground)]/5"
          style={{ aspectRatio: "16/10" }}
        >
          <div
            ref={screenRef}
            className="absolute inset-2 overflow-hidden rounded-md bg-[var(--muted)]"
          >
            {slides.map((proyecto, i) => (
              <div
                key={proyecto.id}
                ref={(el) => {
                  if (el) slidesRef.current[i] = el;
                }}
                className="absolute inset-0 flex items-center justify-center bg-[var(--muted)]"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {proyecto.imagen ? (
                  <Image
                    src={proyecto.imagen}
                    alt={proyecto.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-width: 672px) 100vw, 672px"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
                    <div className="h-24 w-32 rounded bg-[var(--primary)]/10" />
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      {proyecto.titulo}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Base del monitor */}
        <div className="mx-auto mt-1 h-3 w-24 rounded-b-md bg-[var(--foreground)]/15" />
        <div className="mx-auto mt-0.5 h-1 w-32 rounded-full bg-[var(--foreground)]/10" />
      </div>
    </div>
  );
}
