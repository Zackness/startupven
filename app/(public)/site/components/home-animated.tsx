"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/components/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProyectoCard } from "@/components/proyecto-card";
import { Button } from "@/components/ui/button";
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

const COMPLEMENTOS_ITEMS = [
  {
    title: "Marketing",
    description: "Estrategia, campañas, analítica y optimización para adquisición y crecimiento.",
  },
  {
    title: "Diseño gráfico",
    description: "Identidad, piezas para campañas y sistema visual consistente para tu marca.",
  },
  {
    title: "Redes sociales",
    description: "Planificación, contenido y métricas para presencia constante y efectiva.",
  },
  {
    title: "Branding",
    description: "Identidad de marca, naming, logotipo y sistema visual para posicionar tu proyecto.",
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
  const complementosRef = useRef<HTMLElement>(null);
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
    const complementos = complementosRef.current;
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

      // Complementos: título + cards en stagger
      sectionWithStagger(complementos, ".complementos-card", { stagger: 0.12, y: 32 });

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
        className="relative border-t border-[var(--border)] px-6 py-20 sm:px-8 md:py-28"
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Infraestructura digital
          </span>
          <h1 ref={heroTitleRef} className="mt-6 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            Construimos ecosistemas digitales escalables
          </h1>
          <p ref={heroSubtitleRef} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
            Diseñamos y desarrollamos infraestructura tecnológica a largo plazo. Plataformas SaaS, sistemas modulares y un único punto de contacto.
          </p>
          <div ref={heroBtnsRef} className="mt-12 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
              <Link href="#ai-launch">Iniciar arquitectura</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-[var(--border)]">
              <Link href="/servicios">Explorar ecosistema</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-[var(--border)]">
              <Link href="/contacto">Contactar</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-[var(--border)]">
              <Link href="/dashboard">Área de clientes</Link>
            </Button>
          </div>
          <p ref={heroTaglineRef} className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            Launch → Build → Scale
          </p>
        </div>
      </section>

      {/* Why STARTUPVEN — confianza y autoridad de entrada */}
      <section ref={whyRef} className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-6 py-20 sm:px-8 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Por qué STARTUPVEN
          </h2>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            <li className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]">
              Diseñamos sistemas.
            </li>
            <li className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]">
              Estructuramos el crecimiento.
            </li>
            <li className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]">
              Construimos infraestructura.
            </li>
            <li className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]">
              No improvisamos.
            </li>
          </ul>
        </div>
      </section>

      {/* Digital Maturity Ladder — Launch → Builder → Custom */}
      <section ref={ladderRef} className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Evolución dentro del ecosistema
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--muted-foreground)]">
            No abandonas la plataforma. Evolucionas en ella.
          </p>
          <div className="mt-14 flex flex-col items-stretch gap-6 sm:flex-row sm:justify-center sm:gap-8">
            <div className="ladder-card flex flex-1 flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center transition-transform duration-300 hover:translate-y-[-2px]">
              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Nivel 1</span>
              <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">Launch</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Validar ideas. Primera presencia digital con arquitectura definida.
              </p>
            </div>
            <div className="hidden shrink-0 self-center sm:block sm:w-6 text-[var(--muted-foreground)]" aria-hidden>→</div>
            <div className="ladder-card flex flex-1 flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center transition-transform duration-300 hover:translate-y-[-2px]">
              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Nivel 2</span>
              <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">Builder</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Más control. Editor visual. CMS, ecommerce, módulos. Autonomía dentro de límites.
              </p>
            </div>
            <div className="hidden shrink-0 self-center sm:block sm:w-6 text-[var(--muted-foreground)]" aria-hidden>→</div>
            <div className="ladder-card flex flex-1 flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center transition-transform duration-300 hover:translate-y-[-2px]">
              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Nivel 3</span>
              <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">Custom</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Sistemas a medida. SaaS, multi-tenant, infraestructura escalable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proyectos — prueba social antes de pedir acción */}
      <section ref={proyectosRef} className="border-t border-[var(--border)] px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="proyectos-header">
            <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Proyectos
            </span>
            <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
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
            <Button asChild size="lg" className="rounded-xl border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
              <Link href="/proyectos">Ver todos los proyectos</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-[var(--border)]">
              <Link href="/contacto">Contactar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Launch — acción de conversión tras ver prueba social */}
      <section ref={aiLaunchRef} id="ai-launch" className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Iniciar arquitectura
          </h2>
          <div className="ai-launch-block mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <label htmlFor="ai-prompt" className="sr-only">
              Describir la arquitectura digital a iniciar
            </label>
            <textarea
              id="ai-prompt"
              rows={4}
              placeholder="Describe la arquitectura digital que quieres iniciar."
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                size="lg"
                className="rounded-xl border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
              >
                Generar base estructural
              </Button>
              <p className="text-sm text-[var(--muted-foreground)]">
                Ideal para validar ideas y lanzar tu primera presencia digital.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={enfoqueRef} className="border-t border-[var(--border)] px-4 py-20 sm:px-6 md:py-24">
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
                className="enfoque-card rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]"
              >
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/servicios"
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Ver todos los servicios →
            </Link>
          </div>
        </div>
      </section>

      {/* Complementos del ecosistema — visible solo en landing + /servicios */}
      <section
        ref={complementosRef}
        className="border-t border-[var(--border)] bg-[var(--muted)]/20 px-4 py-20 sm:px-6 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Complementos
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Servicios complementarios
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--muted-foreground)]">
              Marketing, diseño y redes para potenciar tu presencia y crecimiento sobre la infraestructura.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COMPLEMENTOS_ITEMS.map((item) => (
              <div
                key={item.title}
                className="complementos-card rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--card-foreground)] transition-transform duration-300 hover:translate-y-[-2px]"
              >
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="rounded-xl border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
              <Link href="/contacto">Solicitar complemento</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-[var(--border)]">
              <Link href="/servicios#complementarios">Ver detalle</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Evolution Statement — cierre y refuerzo */}
      <section ref={evolutionRef} className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Empieza simple. Evoluciona de forma estructurada.
          </p>
          <div className="evolution-btns mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
              <Link href="#ai-launch">Iniciar arquitectura</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-[var(--border)]">
              <Link href="/contacto">Consulta personalizada</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        ref={clientesRef}
        className="border-t border-[var(--border)] bg-[var(--muted)]/20 px-4 py-20 sm:px-6 md:py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            Área de clientes
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Gestión de proyectos, facturación y soporte. Un único panel para tu relación con nosotros.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-xl border border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
            <Link href="/dashboard">Acceder</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
