"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { HeroMonitor } from "./hero-monitor";

gsap.registerPlugin(ScrollTrigger);

export function HeroWithScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const monitorWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const monitorWrap = monitorWrapRef.current;
    if (!section || !content || !monitorWrap) return;

    const ctx = gsap.context(() => {
      // Pin la sección mientras hacemos scroll para controlar el efecto
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=80vh",
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
      });

      // Contenido (título, subtítulo, botones): se va al fondo y desaparece
      gsap.to(content, {
        opacity: 0,
        y: -50,
        scale: 0.96,
        zIndex: 0,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=80vh",
          scrub: 1.2,
        },
      });

      // Monitor: sube y queda por encima del contenido
      gsap.fromTo(
        monitorWrap,
        { y: 80, zIndex: 1, scale: 0.92 },
        {
          y: -120,
          zIndex: 10,
          scale: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=80vh",
            scrub: 1.2,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col justify-center border-b border-[var(--border)] px-4 py-16 sm:px-6 md:py-24"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        {/* Contenido que pasará al fondo al hacer scroll */}
        <div
          ref={contentRef}
          className="relative z-[2]"
        >
          <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            Construimos ecosistemas digitales escalables
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
            Diseñamos y desarrollamos infraestructura tecnológica a largo plazo. Plataformas SaaS, sistemas modulares y un único punto de contacto.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/contacto"
              className="rounded-md border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
            >
              Contactar
            </Link>
            <Link
              href="/"
              className="rounded-md border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Ver página principal actual
            </Link>
          </div>
        </div>

        {/* Monitor: al hacer scroll sube y queda por encima del texto y botones */}
        <div ref={monitorWrapRef} className="relative z-[1] mt-14 w-full">
          <HeroMonitor />
        </div>
      </div>
    </section>
  );
}
