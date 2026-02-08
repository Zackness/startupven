"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { USER_GREMIOS, USER_ROLES } from "@/routes";
import { createAdminUser } from "@/lib/actions/users";
import type { Gremio, UserRole } from "@/lib/generated/prisma/enums";

export function CreateUserForm() {
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

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const role = String(formData.get("role") ?? "CLIENTE") as UserRole;
    const gremioRaw = String(formData.get("gremio") ?? "").trim();
    const gremio = (gremioRaw ? (gremioRaw as Gremio) : null) satisfies Gremio | null;

    startTransition(async () => {
      try {
        await createAdminUser({
          email,
          password,
          name,
          role,
          gremio,
        });
        setSuccess("Usuario creado correctamente.");
        form.reset();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo crear el usuario");
      }
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-black">Crear usuario</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Crea una cuenta con email/contraseña y asigna rol/gremio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-black">
              Nombre
            </label>
            <Input id="name" name="name" placeholder="Ej. Juan Pérez" disabled={isPending} />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-black">
              Email
            </label>
            <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" disabled={isPending} />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-black">
              Contraseña
            </label>
            <Input id="password" name="password" type="password" placeholder="••••••••" disabled={isPending} />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-black">
              Rol
            </label>
            <select
              id="role"
              name="role"
              defaultValue="CLIENTE"
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50"
              disabled={isPending}
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="gremio" className="text-sm font-medium text-black">
              Gremio (opcional)
            </label>
            <select
              id="gremio"
              name="gremio"
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50"
              disabled={isPending}
            >
              <option value="">— Sin gremio —</option>
              {USER_GREMIOS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending} className="bg-blue-800 text-white hover:text-white hover:bg-blue-600">
            {isPending ? "Creando..." : "Crear usuario"}
          </Button>
        </div>
      </form>
    </div>
  );
}

