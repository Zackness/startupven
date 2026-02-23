import { Link } from "@/components/link";
import { auth } from "@/lib/auth";
import { getProjects } from "@/lib/actions/projects";
import { getAdminUsers } from "@/lib/actions/users";
import { ADMIN_PATH } from "@/routes";
import { FolderKanban, Users, ArrowRight, QrCode, UtensilsCrossed, Cog, Settings } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string })?.role;
  const isAdmin = role === "ADMIN";

  const [projects, usersResult] = await Promise.all([
    getProjects(),
    isAdmin ? getAdminUsers(null) : Promise.resolve([]),
  ]);
  const totalUsers = Array.isArray(usersResult) ? usersResult.length : 0;

  if (!isAdmin) {
    return (
      <div className="space-y-14 sm:space-y-16">
        <section>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Panel editor
          </h1>
          <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
            Gestiona proyectos web, escaneo y platos.
          </p>
        </section>
        <section>
          <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Acceso rápido
          </p>
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            <Link
              href={`${ADMIN_PATH}/proyectos`}
              className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-[var(--muted)] p-3">
                  <FolderKanban className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Proyectos web</p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">{projects.length}</p>
              </div>
            </Link>
            <Link
              href={`${ADMIN_PATH}/escaneo`}
              className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-[var(--muted)] p-3">
                  <QrCode className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Escanear QR</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">Validar tickets</p>
              </div>
            </Link>
            <Link
              href={`${ADMIN_PATH}/almuerzos`}
              className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-[var(--muted)] p-3">
                  <UtensilsCrossed className="h-6 w-6 text-[var(--foreground)]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Platos</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">Gestionar menú</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-14 sm:space-y-16">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Panel de administración
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Plataforma e infraestructura digital. Proyectos, usuarios y configuración.
        </p>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Plataforma
        </p>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <Link
            href={`${ADMIN_PATH}/proyectos`}
            className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <FolderKanban className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Proyectos web</p>
              <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">{projects.length}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Publicados en /proyectos</p>
            </div>
          </Link>

          <Link
            href={`${ADMIN_PATH}/usuarios`}
            className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <Users className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Usuarios</p>
              <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">{totalUsers}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Gestión de roles y acceso</p>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Acceso rápido
        </p>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <Link
            href={`${ADMIN_PATH}/operacion`}
            className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <Cog className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Operación</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Tickets, ventas, escaneo y platos</p>
            </div>
          </Link>

          <Link
            href={`${ADMIN_PATH}/configuracion`}
            className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--foreground)]/20 hover:shadow-sm sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-[var(--muted)] p-3">
                <Settings className="h-6 w-6 text-[var(--foreground)]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Configuración</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Marca y sitio</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
