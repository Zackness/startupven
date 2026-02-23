import { Link } from "@/components/link";
import { createSupportTicketAndRedirect } from "@/lib/actions/support-tickets";

export default function NuevoTicketPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/escritorio/tickets"
          className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          ← Volver a tickets
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Nuevo ticket de soporte
        </h1>
        <p className="mt-2 text-[15px] text-[var(--muted-foreground)]">
          Describe tu consulta o solicitud. El equipo te responderá aquí.
        </p>
      </div>

      <form
        action={createSupportTicketAndRedirect}
        className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8"
      >
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-[var(--foreground)]">
            Asunto
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            maxLength={200}
            placeholder="Ej. Cambio de texto en página de contacto"
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-[var(--foreground)]">
            Mensaje
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={6}
            placeholder="Describe tu solicitud con detalle..."
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
          >
            Enviar ticket
          </button>
          <Link
            href="/escritorio/tickets"
            className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
