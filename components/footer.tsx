import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[var(--border)] bg-[var(--muted)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-[var(--foreground)] transition-opacity hover:opacity-80"
            >
              stvn
            </Link>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
              Alimentación sana y accesible para la comunidad universitaria.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Enlaces</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted-foreground)]">
              <li><Link href="/servicios" className="transition-colors hover:text-[var(--foreground)]">Servicios</Link></li>
              <li><Link href="/proyectos" className="transition-colors hover:text-[var(--foreground)]">Proyectos</Link></li>
              <li><Link href="/contacto" className="transition-colors hover:text-[var(--foreground)]">Contacto</Link></li>
              <li><Link href="/escritorio" className="transition-colors hover:text-[var(--foreground)]">Área de clientes</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Legal</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted-foreground)]">
              <li><Link href="/aviso-legal" className="transition-colors hover:text-[var(--foreground)]">Aviso legal</Link></li>
              <li><Link href="/privacidad" className="transition-colors hover:text-[var(--foreground)]">Privacidad</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} stvn. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
