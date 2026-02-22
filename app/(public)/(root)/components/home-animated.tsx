"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProyectoCard } from "@/components/proyecto-card";
import type { Proyecto } from "@/data/proyectos";

gsap.registerPlugin(ScrollTrigger);

const ENFOQUE_ITEMS = [
  {
    title: "Plataformas SaaS",
    description:
      "Diseño y desarrollo de plataformas software como servicio. Sistemas centralizados y escalables.",
  },
  {
    title: "Ecosistemas digitales",
    description:
      "Arquitectura de ventures digitales. Módulos integrados e infraestructura pensada a largo plazo.",
  },
  {
    title: "Infraestructura y operación",
    description:
      "Hosting, dominios y mantenimiento continuo. Un único punto de contacto.",
  },
];

type HomeAnimatedProps = { destacados: Proyecto[] };

export function HomeAnimated({ destacados }: HomeAnimatedProps) {
  const heroRef = useRef<HTMLElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroBtnsRef = useRef<HTMLDivElement>(null);
  const heroTaglineRef = useRef<HTMLParagraphElement>(null);
  const ladderRef = useRef<HTMLElement>(null);
  const aiLaunchRef = useRef<HTMLElement>(null);
  const enfoqueRef = useRef<HTMLElement>(null);
  const whyRef = useRef<HTMLElement>(null);
  const proyectosRef = useRef<HTMLElement>(null);
  const evolutionRef = useRef<HTMLElement>(null);
  const clientesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const heroTitle = heroTitleRef.current;
    const heroSubtitle = heroSubtitleRef.current;
    const heroBtns = heroBtnsRef.current;
    const heroTagline = heroTaglineRef.current;
    const ladder = ladderRef.current;
    const aiLaunch = aiLaunchRef.current;
    const enfoque = enfoqueRef.current;
    const why = whyRef.current;
    const proyectos = proyectosRef.current;
    const evolution = evolutionRef.current;
    const clientes = clientesRef.current;
    if (!hero) return;

    const ctx = gsap.context(() => {
      // Hero: entrada escalonada (título → subtítulo → botones → tagline)
      const heroEls = [heroTitle, heroSubtitle, heroBtns, heroTagline].filter(Boolean);
      gsap.fromTo(
        heroEls,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.14,
          ease: "power3.out",
          delay: 0.15,
        }
      );
      gsap.fromTo(heroTitle, { scale: 0.98 }, { scale: 1, duration: 1, ease: "power2.out", delay: 0.15 });

      // Sección + hijos con stagger al entrar en viewport
      const sectionWithStagger = (
        sectionEl: HTMLElement | null,
        childSelector: string,
        opts: { stagger?: number; y?: number } = {}
      ) => {
        if (!sectionEl) return;
        const stagger = opts.stagger ?? 0.1;
        const y = opts.y ?? 36;
        gsap.fromTo(
          sectionEl,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: { trigger: sectionEl, start: "top 82%", toggleActions: "play none none none" },
          }
        );
        const children = sectionEl.querySelectorAll(childSelector);
        if (children.length) {
          gsap.fromTo(
            children,
            { opacity: 0, y },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger,
              ease: "power3.out",
              scrollTrigger: { trigger: sectionEl, start: "top 82%", toggleActions: "play none none none" },
            }
          );
        }
      };

      // Why: título + 4 ítems en stagger
      sectionWithStagger(why, "ul li", { stagger: 0.12, y: 28 });

      // Ladder: título + 3 bloques (solo los que tienen "Nivel")
      if (ladder) {
        gsap.fromTo(
          ladder,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            scrollTrigger: { trigger: ladder, start: "top 82%", toggleActions: "play none none none" },
          }
        );
        const cards = ladder.querySelectorAll(".ladder-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: ladder, start: "top 82%", toggleActions: "play none none none" },
          }
        );
      }

      // Proyectos: encabezado + grid de cards en stagger
      if (proyectos) {
        const header = proyectos.querySelector(".proyectos-header");
        const grid = proyectos.querySelector(".proyectos-grid");
        if (header) {
          gsap.fromTo(
            header,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: "power3.out",
              scrollTrigger: { trigger: proyectos, start: "top 82%", toggleActions: "play none none none" },
            }
          );
        }
        if (grid?.children.length) {
          gsap.fromTo(
            grid.children,
            { opacity: 0, y: 48 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: { trigger: proyectos, start: "top 82%", toggleActions: "play none none none" },
            }
          );
        }
      }

      // AI Launch: sección + bloque del formulario
      if (aiLaunch) {
        gsap.fromTo(
          aiLaunch,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            scrollTrigger: { trigger: aiLaunch, start: "top 82%", toggleActions: "play none none none" },
          }
        );
        const formBlock = aiLaunch.querySelector(".ai-launch-block");
        if (formBlock) {
          gsap.fromTo(
            formBlock,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: { trigger: aiLaunch, start: "top 82%", toggleActions: "play none none none" },
            }
          );
        }
      }

      // Enfoque: título + 3 cards en stagger
      if (enfoque) {
        const header = enfoque.querySelector("h2");
        const cards = enfoque.querySelectorAll(".enfoque-card");
        if (header) {
          gsap.fromTo(
            header,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              scrollTrigger: { trigger: enfoque, start: "top 82%", toggleActions: "play none none none" },
            }
          );
        }
        gsap.fromTo(
          cards,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.13,
            ease: "power3.out",
            scrollTrigger: { trigger: enfoque, start: "top 82%", toggleActions: "play none none none" },
          }
        );
      }

      // Evolution: texto + botones
      if (evolution) {
        const text = evolution.querySelector("p");
        const btns = evolution.querySelector(".evolution-btns");
        if (text) {
          gsap.fromTo(
            text,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: evolution, start: "top 82%", toggleActions: "play none none none" },
            }
          );
        }
        if (btns) {
          gsap.fromTo(
            btns,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: 0.15,
              ease: "power3.out",
              scrollTrigger: { trigger: evolution, start: "top 82%", toggleActions: "play none none none" },
            }
          );
        }
      }

      // Área clientes: bloque único
      if (clientes) {
        gsap.fromTo(
          clientes,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: { trigger: clientes, start: "top 82%", toggleActions: "play none none none" },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={heroRef}
        className="relative px-4 py-20 sm:px-6 md:py-28"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1 ref={heroTitleRef} className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            Construimos ecosistemas digitales escalables
          </h1>
          <p ref={heroSubtitleRef} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
            Diseñamos y desarrollamos infraestructura tecnológica a largo plazo. Plataformas SaaS, sistemas modulares y un único punto de contacto.
          </p>
          <div ref={heroBtnsRef} className="mt-12 flex flex-wrap justify-center gap-3">
            <Link
              href="#ai-launch"
              className="rounded-md border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
            >
              Iniciar arquitectura
            </Link>
            <Link
              href="/servicios"
              className="rounded-md border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Explorar ecosistema
            </Link>
            <Link
              href="/contacto"
              className="rounded-md border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Contactar
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Área de clientes
            </Link>
          </div>
          <p ref={heroTaglineRef} className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            Lauch -{">"} Build -{">"} Scale
          </p>
        </div>
      </section>

      {/* Why STARTUPVEN — confianza y autoridad de entrada */}
      <section ref={whyRef} className="px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Por qué STARTUPVEN
          </h2>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            <li className="bg-[var(--card)] p-5 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]">
              Diseñamos sistemas.
            </li>
            <li className="bg-[var(--card)] p-5 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]">
              Estructuramos el crecimiento.
            </li>
            <li className="bg-[var(--card)] p-5 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]">
              Construimos infraestructura.
            </li>
            <li className="bg-[var(--card)] p-5 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]">
              No improvisamos.
            </li>
          </ul>
        </div>
      </section>

      {/* Digital Maturity Ladder — Launch → Builder → Custom */}
      <section ref={ladderRef} className="bg-[var(--muted)]/40 px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Evolución dentro del ecosistema
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--muted-foreground)]">
            No abandonas la plataforma. Evolucionas en ella.
          </p>
          <div className="mt-14 flex flex-col items-stretch gap-6 sm:flex-row sm:justify-center sm:gap-8">
            <div className="ladder-card flex flex-1 flex-col items-center bg-[var(--card)] p-6 text-center transition-transform duration-300 hover:translate-y-[-2px]">
              <span className="text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">Nivel 1</span>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Launch</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Validar ideas. Páginas iniciales con IA. Presencia digital estructurada.
              </p>
            </div>
            <div className="hidden shrink-0 self-center sm:block sm:w-6 text-[var(--muted-foreground)]" aria-hidden>→</div>
            <div className="ladder-card flex flex-1 flex-col items-center bg-[var(--card)] p-6 text-center transition-transform duration-300 hover:translate-y-[-2px]">
              <span className="text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">Nivel 2</span>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Builder</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Más control. Editor visual. CMS, ecommerce, módulos. Autonomía dentro de límites.
              </p>
            </div>
            <div className="hidden shrink-0 self-center sm:block sm:w-6 text-[var(--muted-foreground)]" aria-hidden>→</div>
            <div className="ladder-card flex flex-1 flex-col items-center bg-[var(--card)] p-6 text-center transition-transform duration-300 hover:translate-y-[-2px]">
              <span className="text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">Nivel 3</span>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Custom</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Sistemas a medida. SaaS, multi-tenant, infraestructura escalable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proyectos — prueba social antes de pedir acción */}
      <section ref={proyectosRef} className="px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="proyectos-header">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
              Proyectos
            </p>
            <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Sistemas en producción
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--muted-foreground)]">
              Plataformas y sistemas que hemos diseñado y construido. Infraestructura digital operativa.
            </p>
          </div>
          <div className="proyectos-grid mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((proyecto) => (
              <ProyectoCard
                key={proyecto.id}
                proyecto={proyecto}
                variant="featured"
                linkToProyectos
              />
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/proyectos"
              className="rounded-md border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
            >
              Ver todos los proyectos
            </Link>
            <Link
              href="/contacto"
              className="rounded-md border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Contactar
            </Link>
          </div>
        </div>
      </section>

      {/* AI Launch — acción de conversión tras ver prueba social */}
      <section ref={aiLaunchRef} id="ai-launch" className="bg-[var(--muted)]/40 px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Iniciar arquitectura
          </h2>
          <div className="ai-launch-block mt-10 bg-[var(--card)] p-6">
            <label htmlFor="ai-prompt" className="sr-only">
              Describir la arquitectura digital a iniciar
            </label>
            <textarea
              id="ai-prompt"
              rows={4}
              placeholder="Describe la arquitectura digital que quieres iniciar."
              className="w-full resize-none bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="rounded-md border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
              >
                Generar base estructural
              </button>
              <p className="text-sm text-[var(--muted-foreground)]">
                Ideal para validar ideas y lanzar tu primera presencia digital.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={enfoqueRef} className="px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Enfoque
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--muted-foreground)]">
            Sistemas e infraestructura, no proyectos aislados
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ENFOQUE_ITEMS.map((item) => (
              <div
                key={item.title}
                className="enfoque-card bg-[var(--card)] p-5 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/servicios"
              className="text-sm font-medium text-[var(--foreground)] hover:underline"
            >
              Ver todos los servicios →
            </Link>
          </div>
        </div>
      </section>

      {/* Evolution Statement — cierre y refuerzo */}
      <section ref={evolutionRef} className="px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Empieza simple. Evoluciona de forma estructurada.
          </p>
          <div className="evolution-btns mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="#ai-launch"
              className="rounded-md border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
            >
              Iniciar arquitectura
            </Link>
            <Link
              href="/contacto"
              className="rounded-md border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Consulta personalizada
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={clientesRef}
        className="bg-[var(--muted)] px-4 py-20 sm:px-6 md:py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            Área de clientes
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Gestión de proyectos, facturación y soporte. Un único panel para tu relación con nosotros.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
          >
            Acceder
          </Link>
        </div>
      </section>
    </>
  );
}
