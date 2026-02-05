"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUser } from "@/lib/actions/users";
import { ADMIN_PATH } from "@/routes";
import { USER_ROLES, USER_GREMIOS } from "@/routes";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useState } from "react";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  gremio: string | null;
  cedula: string | null;
  expediente: string | null;
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
};

export function EditUserForm({ user }: { user: User }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const primerNombre = (formData.get("primerNombre") as string)?.trim() || null;
    const segundoNombre = (formData.get("segundoNombre") as string)?.trim() || null;
    const primerApellido = (formData.get("primerApellido") as string)?.trim() || null;
    const segundoApellido = (formData.get("segundoApellido") as string)?.trim() || null;
    const name =
      [primerNombre, segundoNombre, primerApellido, segundoApellido]
        .filter(Boolean)
        .join(" ") || user.name || user.email;

    startTransition(async () => {
      try {
        await updateUser(user.id, {
          role: formData.get("role") as "CLIENTE" | "VENDEDOR" | "EDITOR" | "ADMIN",
          gremio: (formData.get("gremio") as string) || null,
          cedula: (formData.get("cedula") as string)?.trim() || null,
          expediente: (formData.get("expediente") as string)?.trim() || null,
          primerNombre,
          segundoNombre,
          primerApellido,
          segundoApellido,
          name,
        });
        setSuccess("Usuario actualizado.");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al actualizar");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="primerNombre" className="text-sm font-medium text-black">
            Primer nombre
          </label>
          <Input
            id="primerNombre"
            name="primerNombre"
            defaultValue={user.primerNombre ?? ""}
            placeholder="Ej. Juan"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="segundoNombre" className="text-sm font-medium text-black">
            Segundo nombre
          </label>
          <Input
            id="segundoNombre"
            name="segundoNombre"
            defaultValue={user.segundoNombre ?? ""}
            placeholder="Ej. Carlos"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="primerApellido" className="text-sm font-medium text-black">
            Primer apellido
          </label>
          <Input
            id="primerApellido"
            name="primerApellido"
            defaultValue={user.primerApellido ?? ""}
            placeholder="Ej. Pérez"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="segundoApellido" className="text-sm font-medium text-black">
            Segundo apellido
          </label>
          <Input
            id="segundoApellido"
            name="segundoApellido"
            defaultValue={user.segundoApellido ?? ""}
            placeholder="Ej. López"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="cedula" className="text-sm font-medium text-black">
            Cédula
          </label>
          <Input
            id="cedula"
            name="cedula"
            defaultValue={user.cedula ?? ""}
            placeholder="Ej. V-12345678"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="expediente" className="text-sm font-medium text-black">
            Expediente (si es estudiante)
          </label>
          <Input
            id="expediente"
            name="expediente"
            defaultValue={user.expediente ?? ""}
            placeholder="Ej. 2024-12345"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="gremio" className="text-sm font-medium text-black">
            Gremio
          </label>
          <select
            id="gremio"
            name="gremio"
            defaultValue={user.gremio ?? ""}
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50"
            disabled={isPending}
          >
            <option value="">— Sin gremio —</option>
            {USER_GREMIOS.map((g) => (
              <option key={g} value={g}>
                {g === "ESTUDIANTIL" ? "Estudiantil" : g === "OBRERO" ? "Obrero" : "Profesores"}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-black">
            Rol
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue={user.role}
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50"
            disabled={isPending}
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "CLIENTE"
                  ? "Cliente"
                  : r === "VENDEDOR"
                    ? "Vendedor"
                    : r === "EDITOR"
                      ? "Editor"
                      : "Administrador"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-600">
        Email (solo lectura): <strong className="text-black">{user.email}</strong>
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="bg-black text-white hover:bg-zinc-800">
          {isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`${ADMIN_PATH}/usuarios`)}
          disabled={isPending}
        >
          Volver a la lista
        </Button>
      </div>
    </form>
  );
}
