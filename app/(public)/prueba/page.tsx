import { HeroWithScroll } from "./components/hero-with-scroll";

export const metadata = {
  title: "Prueba | Hero con monitor",
  description: "Página de prueba: hero con monitor y GSAP mostrando proyectos.",
};

export default function PruebaPage() {
  return (
    <div className="relative min-h-full">
      <HeroWithScroll />

      <section className="border-t border-[var(--border)] px-4 py-12 text-center text-sm text-[var(--muted-foreground)]">
        <p>Página de prueba: hero con monitor + GSAP. Al hacer scroll, el monitor pasa por encima del texto y los botones.</p>
      </section>
    </div>
  );
}
