export const metadata = {
  title: "Aviso legal | Startupven",
};

export default function AvisoLegalPage() {
  return (
    <div className="border-t border-[var(--border)] px-6 py-12 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Legal
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Aviso legal
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] leading-relaxed">
          Información legal del sitio. Datos de la empresa y condiciones de uso.
        </p>
        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
          <p className="text-[15px] text-[var(--muted-foreground)] leading-relaxed">
            Contenido del aviso legal.
          </p>
        </div>
      </div>
    </div>
  );
}
