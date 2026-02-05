import { getAdminTicketTypes } from "@/lib/actions/tickets";
import { CreateTicketTypeForm } from "./create-ticket-type-form";
import { ToggleActiveButton } from "./toggle-active-button";

export default async function AdminTiposPage() {
  const types = await getAdminTicketTypes();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Tipos de ticket
        </h1>
        <p className="mt-1 text-zinc-600">
          Gestiona los tipos de comida y precios del comedor
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-black">
          Crear nuevo tipo
        </h2>
        <CreateTicketTypeForm />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <h2 className="border-b border-zinc-200 px-4 py-3 text-lg font-semibold text-black">
          Tipos existentes
        </h2>
        <ul className="divide-y divide-zinc-200">
          {types.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="font-medium text-black">
                  {t.name}
                  {!t.active && (
                    <span className="ml-2 text-sm text-zinc-500">(inactivo)</span>
                  )}
                </p>
                <p className="text-sm text-zinc-600">
                  ${Number(t.price).toFixed(2)}
                  {t.description && ` · ${t.description}`}
                </p>
              </div>
              <ToggleActiveButton id={t.id} active={t.active} />
            </li>
          ))}
        </ul>
        {types.length === 0 && (
          <p className="px-4 py-8 text-center text-zinc-600">
            No hay tipos de ticket. Crea el primero arriba.
          </p>
        )}
      </div>
    </div>
  );
}
