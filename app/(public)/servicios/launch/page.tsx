import Link from "next/link";
import { BRAND_NAME } from "@/components/marca/brand";
import { Rocket, Zap, Globe, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiLaunchChat } from "@/components/ai-launch-chat";

export const metadata = {
  title: `Launch | Servicios | ${BRAND_NAME}`,
  description: "Valida ideas e inicia tu presencia digital. Arquitectura definida desde el día uno.",
};

const features = [
  { icon: Zap, title: "Arquitectura guiada", desc: "Definición clara de estructura. Presencia operativa en poco tiempo." },
  { icon: Layout, title: "Layouts definidos", desc: "Sistema de plantillas estructurado." },
  { icon: Globe, title: "Hosting y dominio", desc: "Hosting incluido. Dominio opcional." },
];

export default function ServiciosLaunchPage() {
  return (
    <div className="min-h-screen">
      <div className="border-t border-[var(--border)] px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Link href="/servicios" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← Servicios</Link>
        </div>
      </div>

      <section className="relative mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="relative z-10 flex min-h-[320px] flex-col items-center justify-center pt-8 pb-8 text-center sm:min-h-[360px] sm:pt-10 sm:pb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            <Rocket className="h-3.5 w-3.5" /> Nivel 1
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:mt-5 sm:text-4xl md:text-5xl">Launch</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)] leading-relaxed sm:mt-5">
            Valida ideas e inicia tu presencia digital. Arquitectura definida desde el día uno.
          </p>
          <div className="mt-8 w-full max-w-2xl sm:mt-10">
            <AiLaunchChat />
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">Qué incluye</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
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
          <h2 className="text-xl font-semibold text-[var(--foreground)] sm:text-2xl">¿Listo para lanzar?</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">Cuéntanos tu idea y te preparamos la presencia inicial.</p>
          <Button asChild size="lg" className="mt-6 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90">
            <Link href="/contacto">Contactar</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
