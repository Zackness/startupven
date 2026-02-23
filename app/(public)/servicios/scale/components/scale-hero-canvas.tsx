"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const NODE_COUNT = 8;

export function ScaleHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<HTMLDivElement[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);

  const cx = 50;
  const cy = 50;
  const radius = 44;
  const nodePositionsForSvg = Array.from({ length: NODE_COUNT }, (_, i) => {
    const angle = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

    const nodes = nodeRefs.current.filter(Boolean);
    if (nodes.length) {
      tl.fromTo(nodes, { scale: 1, opacity: 0.7 }, {
        scale: 1.12,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.inOut",
      }, "<0.2");
      tl.to(nodes, {
        scale: 1,
        opacity: 0.85,
        duration: 0.5,
        stagger: 0.03,
        ease: "power2.inOut",
      }, "-=0.3");
    }

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0.28,
        scale: 1.12,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl"
      aria-hidden
    >
      {/* Glow central: suave en su máximo */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[65%] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16]"
        style={{
          background: "radial-gradient(circle, var(--primary) 0%, transparent 72%)",
          filter: "blur(36px)",
        }}
      />

      {/* Nodos: posiciones en % para que escalen */}
      {nodePositionsForSvg.map((pos, i) => (
        <div
          key={i}
          ref={(el) => { if (el) nodeRefs.current[i] = el; }}
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--primary)] bg-[var(--background)] shadow-[0_0_14px_var(--primary)] sm:h-4 sm:w-4"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        />
      ))}
    </div>
  );
}
