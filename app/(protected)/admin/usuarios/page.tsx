import { getAdminUsers } from "@/lib/actions/users";
import Link from "next/link";
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

const gremioLabels: Record<string, string> = {
  ESTUDIANTIL: "Estudiantil",
  OBRERO: "Obrero",
  PROFESORES: "Profesores",
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

export default async function AdminUsuariosPage() {
  const users = await getAdminUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">
          Usuarios
        </h1>
        <p className="mt-1 text-zinc-600">
          Gestiona gremios, roles y datos de los usuarios
        </p>
      </div>

      <CreateUserForm />

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 font-semibold text-black">
                  Nombre
                </th>
                <th className="px-4 py-3 font-semibold text-black">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold text-black">
                  Cédula
                </th>
                <th className="px-4 py-3 font-semibold text-black">
                  Expediente
                </th>
                <th className="px-4 py-3 font-semibold text-black">
                  Gremio
                </th>
                <th className="px-4 py-3 font-semibold text-black">
                  Rol
                </th>
                <th className="w-[100px] px-4 py-3 font-semibold text-black">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3 text-black">
                    {fullName(u)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {u.cedula ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {u.expediente ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {u.gremio ? gremioLabels[u.gremio] ?? u.gremio : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.role === "ADMIN"
                          ? "rounded bg-amber-100 px-2 py-0.5 text-amber-800"
                          : "rounded bg-zinc-100 px-2 py-0.5 text-zinc-700"
                      }
                    >
                      {roleLabels[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`${ADMIN_PATH}/usuarios/${u.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-600 hover:text-black"
                      >
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
          <p className="px-4 py-12 text-center text-zinc-600">
            No hay usuarios registrados.
          </p>
        )}
      </div>
    </div>
  );
}
