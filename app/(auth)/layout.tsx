import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-lg font-bold text-black"
          >
            Comedor UNEXPO Carora
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-black"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
