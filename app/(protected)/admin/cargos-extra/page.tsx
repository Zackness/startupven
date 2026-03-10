import { auth } from "@/lib/auth";
import { getAdminUsers } from "@/lib/actions/users";
import {
  createExtraCharge,
  getAdminExtraCharges,
  updateExtraChargeStatus,
  type ExtraChargeStatus,
} from "@/lib/actions/extra-charges";
import { ESCRITORIO_PAGOS_PATH } from "@/routes";

const CATEGORY_LABEL: Record<string, string> = {
  WEB: "Scale / Web",
  MARKETING: "Marketing",
  REDES_SOCIALES: "Redes sociales",
};

const STATUS_LABEL: Record<ExtraChargeStatus, string> = {
  PENDIENTE: "Pendiente",
  FACTURADO: "Facturado",
  PAGADO: "Pagado",
  CANCELADO: "Cancelado",
};

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string })?.role;
  if (role !== "ADMIN") {
    return null;
  }
  return session;
}

export default async function AdminCargosExtraPage() {
  const session = await requireAdmin();
  if (!session) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Cargos extra</h1>
        <p className="text-[15px] text-[var(--muted-foreground)]">
          No tienes permisos para ver esta sección.
        </p>
      </div>
    );
  }

  const [users, charges] = await Promise.all([
    getAdminUsers(null),
    getAdminExtraCharges(),
  ]);

  const clientUsers = users.filter((u) => u.role === "CLIENTE");

  async function handleCreate(formData: FormData) {
    "use server";
    await createExtraCharge({
      userId: String(formData.get("userId") || ""),
      category: String(formData.get("category") || ""),
      label: String(formData.get("label") || ""),
      description: String(formData.get("description") || ""),
      amount: Number(formData.get("amount") || "0"),
    });
  }

  async function handleMarkStatus(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const status = String(formData.get("status") || "") as ExtraChargeStatus;
    await updateExtraChargeStatus(id, status);
  }

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Cargos extra
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
          Registra cargos adicionales para servicios de Scale, marketing o redes sociales que no estén en los
          paquetes estándar. Estos cargos se mostrarán al cliente en su sección de pagos del escritorio.
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Crear cargo extra
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Elige el cliente, la categoría del servicio y el monto del cargo. Puedes usar esto para horas extra,
          entregables adicionales o servicios especiales.
        </p>
        <form action={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Cliente
            </label>
            <select
              name="userId"
              className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              required
            >
              <option value="">Selecciona un cliente…</option>
              {clientUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Categoría del servicio
            </label>
            <select
              name="category"
              className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              required
            >
              <option value="">Selecciona…</option>
              <option value="WEB">Scale / Web</option>
              <option value="MARKETING">Marketing</option>
              <option value="REDES_SOCIALES">Redes sociales</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Monto (USD)
            </label>
            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              required
              className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Título del cargo
            </label>
            <input
              type="text"
              name="label"
              maxLength={191}
              placeholder="Ej. Landing adicional, campaña especial, horas extra diseño…"
              required
              className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Detalle (opcional)
            </label>
            <textarea
              name="description"
              rows={3}
              className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
              placeholder="Describe brevemente qué incluye este cargo extra."
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90"
            >
              Guardar cargo extra
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Cargos extra registrados
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Historial de cargos extra por cliente. El cliente verá estos montos en su página de pagos (
              <span className="font-mono text-xs">{ESCRITORIO_PAGOS_PATH}</span>).
            </p>
          </div>
        </div>
        <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          {charges.length === 0 ? (
            <div className="px-6 py-10 text-center text-[15px] text-[var(--muted-foreground)]">
              Aún no hay cargos extra registrados.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {charges.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {c.label} ·{" "}
                      <span className="font-semibold">
                        USD {c.amount.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {CATEGORY_LABEL[c.category] ?? c.category} ·{" "}
                      {c.userName || c.userEmail || "Cliente sin nombre"}{" "}
                      {c.userEmail ? `(${c.userEmail})` : ""}
                    </p>
                    {c.description && (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {c.description}
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Creado el{" "}
                      {new Date(c.createdAt).toLocaleString("es-VE", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <form action={handleMarkStatus} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <select
                      name="status"
                      defaultValue={c.status}
                      className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs text-[var(--foreground)]"
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="FACTURADO">Facturado</option>
                      <option value="PAGADO">Pagado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]/40"
                    >
                      Actualizar estado
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

