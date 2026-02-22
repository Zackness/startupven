"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const pathname = usePathname();

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
          {nav.map(({ href, label }) => (
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
