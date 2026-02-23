"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { USER_ROLES } from "@/routes";
import { createAdminUser } from "@/lib/actions/users";
import type { UserRole } from "@/lib/generated/prisma/enums";

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

    startTransition(async () => {
      try {
        await createAdminUser({
          email,
          password,
          name,
          role,
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
    <section>
      <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        Alta manual
      </p>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Crear usuario</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Crea una cuenta con email/contraseña y asigna rol.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-[var(--foreground)]">
                Nombre
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Ej. Juan Pérez"
                disabled={isPending}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                disabled={isPending}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-[var(--foreground)]">
                Rol
              </label>
              <select
                id="role"
                name="role"
                defaultValue="CLIENTE"
                className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50"
                disabled={isPending}
              >
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>
          </div>
        </div>

          <FormError message={error} />
          <FormSuccess message={success} />

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            >
              {isPending ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

