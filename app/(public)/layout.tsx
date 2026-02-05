import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-black"
          >
            Comedor UNEXPO Carora
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 hover:text-black"
            >
              Inicio
            </Link>
            <Link
              href="/nosotros"
              className="text-sm font-medium text-zinc-600 hover:text-black"
            >
              Nosotros
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-zinc-600">
              Comedor Universitario — UNEXPO Extensión Carora
            </p>
            <div className="flex gap-6">
              <Link
                href="/nosotros"
                className="text-sm text-zinc-600 hover:text-black"
              >
                Nosotros
              </Link>
              <Link
                href="/login"
                className="text-sm text-zinc-600 hover:text-black"
              >
                Acceso
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
