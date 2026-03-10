import { getAgencyClients } from "@/lib/actions/users";
import { Link } from "@/components/link";
import { AGENCY_CLIENTES_PATH, ESCRITORIO_PARA_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

function fullName(u: {
  name: string | null;
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
}) {
  if (u.primerNombre || u.primerApellido) {
    const parts = [
      u.primerNombre,
      u.segundoNombre,
      u.primerApellido,
      u.segundoApellido,
    ].filter(Boolean);
    return parts.join(" ") || u.name || "—";
  }
  return u.name || "—";
}

export default async function AgencyClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getAgencyClients(q ?? null);

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Agency
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Clientes
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted-foreground)]">
          Listado de clientes. Usa <strong>Trabajar</strong> para abrir el escritorio de ese cliente y gestionar sus proyectos, calendario editorial, dominios, etc.
        </p>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Buscar
        </p>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
          <form action={AGENCY_CLIENTES_PATH} method="GET" className="flex gap-2">
            <label htmlFor="agency-clientes-search" className="sr-only">
              Buscar cliente
            </label>
            <input
              id="agency-clientes-search"
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por nombre o email..."
              className="flex h-10 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
            <Button type="submit" variant="secondary" className="shrink-0 border-[var(--border)]">
              Buscar
            </Button>
            {q && (
              <Link
                href={AGENCY_CLIENTES_PATH}
                className="flex h-10 items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                Limpiar
              </Link>
            )}
          </form>
        </div>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Listado
        </p>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Nombre</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Email</th>
                  <th className="w-[140px] px-4 py-3 font-semibold text-[var(--foreground)]">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {clients.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3 text-[var(--foreground)]">{fullName(u)}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{u.email}</td>
                    <td className="px-4 py-3">
                      <Link href={`${ESCRITORIO_PARA_PATH}/${u.id}`}>
                        <Button variant="default" size="sm" className="gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          Trabajar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {clients.length === 0 && (
            <p className="px-4 py-12 text-center text-[var(--muted-foreground)]">
              No hay clientes o no coincide la búsqueda.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
