"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Rocket, Layers, TrendingUp, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const serviciosItems = [
  { href: "/servicios/launch", label: "Launch", desc: "Valida ideas. Presencia digital con arquitectura definida desde el día uno.", icon: Rocket },
  { href: "/servicios/build", label: "Build", desc: "Editor visual, CMS y ecommerce. Más control y autonomía dentro de la plataforma.", icon: Layers },
  { href: "/servicios/scale", label: "Scale", desc: "Sistemas a medida, SaaS e infraestructura escalable. Arquitectura premium.", icon: TrendingUp },
] as const;

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/contacto", label: "Contacto" },
];

const HOVER_DELAY_MS = 120;

export function Header() {
  const pathname = usePathname();
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const serviciosRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openServicios = () => {
    clearCloseTimeout();
    setServiciosOpen(true);
  };

  const closeServicios = () => {
    closeTimeoutRef.current = setTimeout(() => setServiciosOpen(false), HOVER_DELAY_MS);
  };

  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  const isServiciosActive = pathname.startsWith("/servicios");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-[var(--foreground)] shrink-0 transition-opacity hover:opacity-80"
        >
          stvn
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/"
            className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-[var(--accent)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
            }`}
          >
            Inicio
          </Link>
          <div
            className="relative"
            ref={serviciosRef}
            onMouseEnter={openServicios}
            onMouseLeave={closeServicios}
          >
            <button
              type="button"
              onClick={() => setServiciosOpen((v) => !v)}
              className={`inline-flex items-center gap-0.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors md:pointer-events-none ${
                isServiciosActive
                  ? "bg-[var(--accent)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              }`}
              aria-expanded={serviciosOpen}
              aria-haspopup="true"
            >
              Servicios
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${serviciosOpen ? "rotate-180" : ""}`} />
            </button>
            {serviciosOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-0 w-[min(90vw,640px)] -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xl">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {serviciosItems.map(({ href, label, desc, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="group flex flex-col gap-3 rounded-lg border border-transparent p-4 transition-colors hover:border-[var(--border)] hover:bg-[var(--accent)]/50"
                      onClick={() => setServiciosOpen(false)}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--muted)] transition-colors group-hover:bg-[var(--primary)]/20">
                        <Icon className="h-5 w-5 text-[var(--foreground)]" />
                      </span>
                      <div>
                        <span className="font-semibold text-[var(--foreground)]">{label}</span>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">{desc}</p>
                      </div>
                      <span className="inline-flex items-center text-xs font-medium text-[var(--primary)]">
                        Ver servicio
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 flex justify-end border-t border-[var(--border)] pt-3">
                  <Link
                    href="/servicios"
                    className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    onClick={() => setServiciosOpen(false)}
                  >
                    Ver todos los servicios →
                  </Link>
                </div>
              </div>
            )}
          </div>
          {nav.filter(({ href }) => href !== "/").map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-[var(--accent)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
          <div className="ml-2 flex gap-1.5 border-l border-[var(--border)] pl-3">
            <Link
              href="/login"
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Entrar
            </Link>
            <Link
              href="/escritorio"
              className="rounded-md border border-[var(--primary)] bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            >
              Mi cuenta
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
