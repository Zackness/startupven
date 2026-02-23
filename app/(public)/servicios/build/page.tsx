import Link from "next/link";
import { BRAND_NAME } from "@/components/marca/brand";
import { Layers, Edit3, ShoppingCart, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuildHeroCanvas } from "./components/build-hero-canvas";

export const metadata = {
  title: `Build | Servicios | ${BRAND_NAME}`,
  description: "Editor visual, CMS, ecommerce y módulos. Autonomía estructurada.",
};

const features = [
  { icon: Edit3, title: "Editor visual", desc: "Control directo sobre diseño y contenido." },
  { icon: Layers, title: "CMS y blog", desc: "Sistema de contenido estructurado." },
  { icon: ShoppingCart, title: "Ecommerce", desc: "Módulo de tienda integrado." },
  { icon: Plug, title: "Integraciones", desc: "Conexiones y gestión de pagos." },
];

export default function ServiciosBuildPage() {
  return (
    <div className="min-h-screen">
      <div className="border-t border-[var(--border)] px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Link href="/servicios" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← Servicios</Link>
        </div>
      </div>
      <section className="relative mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-24">
        {/* Capa de animación: ocupa todo el bloque, elementos alrededor del centro */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <BuildHeroCanvas />
        </div>
        {/* Hero en el centro, encima de la animación (no se mueve) */}
        <div className="relative z-10 flex min-h-[320px] flex-col items-center justify-center pb-24 pt-8 text-center sm:min-h-[360px] sm:py-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            <Layers className="h-3.5 w-3.5" /> Nivel 2
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:mt-5 sm:text-4xl md:text-5xl">Build</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)] leading-relaxed sm:mt-5">
            Más control con editor visual, CMS y ecommerce. Autonomía dentro de límites arquitectónicos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10">
            <Button asChild size="lg" className="rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
              <Link href="/contacto">Solicitar Build</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-[var(--border)]">
              <Link href="/servicios">Ver todos los servicios</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">Qué incluye</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--muted)]">
                  <Icon className="h-6 w-6 text-[var(--foreground)]" />
                </span>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">{title}</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-semibold text-[var(--foreground)] sm:text-2xl">¿Quieres más control?</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">Build es el siguiente paso después de Launch.</p>
          <Button asChild size="lg" className="mt-6 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
            <Link href="/contacto">Contactar</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
