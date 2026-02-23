import { getAdminUsers } from "@/lib/actions/users";
import { Link } from "@/components/link";
import { ADMIN_PATH } from "@/routes";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { CreateUserForm } from "./create-user-form";

const roleLabels: Record<string, string> = {
  CLIENTE: "Cliente",
  VENDEDOR: "Vendedor",
  EDITOR: "Editor",
  ADMIN: "Administrador",
};

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

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await getAdminUsers(q ?? null);

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Plataforma
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Usuarios
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Gestiona roles y datos de los usuarios.
        </p>
      </section>

      <CreateUserForm />

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Buscar
        </p>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
          <form action={`${ADMIN_PATH}/usuarios`} method="GET" className="flex gap-2">
            <label htmlFor="usuarios-search" className="sr-only">
              Buscar usuario
            </label>
            <input
              id="usuarios-search"
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por nombre, email o cédula..."
              className="flex h-10 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
            <Button type="submit" variant="secondary" className="shrink-0 border-[var(--border)]">
              Buscar
            </Button>
            {q && (
              <Link
                href={`${ADMIN_PATH}/usuarios`}
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
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Nombre</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Email</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Cédula</th>
                  <th className="px-4 py-3 font-semibold text-[var(--foreground)]">Rol</th>
                  <th className="w-[100px] px-4 py-3 font-semibold text-[var(--foreground)]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="px-4 py-3 text-[var(--foreground)]">{fullName(u)}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{u.email}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{u.cedula ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          u.role === "ADMIN"
                            ? "rounded bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                            : "rounded bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]"
                        }
                      >
                        {roleLabels[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`${ADMIN_PATH}/usuarios/${u.id}`}>
                        <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="px-4 py-12 text-center text-[var(--muted-foreground)]">
              No hay usuarios registrados.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
