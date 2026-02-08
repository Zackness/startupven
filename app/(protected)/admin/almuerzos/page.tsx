import { getAdminTicketTypes } from "@/lib/actions/tickets";
import { CreateTicketTypeForm } from "./create-ticket-type-form";
import { ToggleActiveButton } from "./toggle-active-button";

export default async function AdminTiposPage() {
  const types = await getAdminTicketTypes();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Platos
        </h1>
        <p className="mt-1 text-zinc-600">
          Crea platos para días específicos o platos permanentes generales.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-black">
          Crear nuevo plato
        </h2>
        <CreateTicketTypeForm />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <h2 className="border-b border-zinc-200 px-4 py-3 text-lg font-semibold text-black">
          Platos existentes
        </h2>
        <ul className="divide-y divide-zinc-200">
          {types.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="font-medium text-black flex items-center gap-2">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 border border-zinc-200">
                    {t.category}
                  </span>
                  {t.name}
                  {!t.active && (
                    <span className="ml-2 text-sm text-zinc-500">(inactivo)</span>
                  )}
                </p>
                <div className="text-sm text-zinc-600">
                  <span>${Number(t.price).toFixed(2)}</span>
                  {t.availableForDate && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                      📅 {t.availableForDate.toLocaleDateString()}
                    </span>
                  )}
                  {t.description && <span className="block text-xs text-zinc-500 mt-0.5">{t.description}</span>}
                </div>
              </div>
              <ToggleActiveButton id={t.id} active={t.active} />
            </li>
          ))}
        </ul>
        {types.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-600">
            No hay platos. Crea el primero arriba.
          </p>
        )}
      </div>
    </div>
  );
}
