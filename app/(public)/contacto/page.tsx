export const metadata = {
  title: "Contacto | Startupven",
  description: "Para definir alcance, plazos y condiciones. Respondemos con información concreta.",
};

export default function ContactoPage() {
  return (
    <div className="border-t border-[var(--border)] px-6 py-12 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Contacto
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Iniciar conversación
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] leading-relaxed">
          Para definir alcance, plazos y condiciones. Respondemos con información concreta.
        </p>
        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <form className="space-y-6" action="#" method="post">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-[var(--foreground)]">
                Nombre / Empresa
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-[var(--foreground)]">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={5}
                required
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:opacity-90"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}