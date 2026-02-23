"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUser, setUserPasswordAsAdmin } from "@/lib/actions/users";
import { ADMIN_PATH } from "@/routes";
import { USER_ROLES } from "@/routes";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useState } from "react";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  cedula: string | null;
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
  const [passwordError, setPasswordError] = useState<string | undefined>("");
  const [passwordSuccess, setPasswordSuccess] = useState<string | undefined>("");
  const [passwordPending, setPasswordPending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const manualName = (formData.get("name") as string)?.trim() || "";
    const primerNombre = (formData.get("primerNombre") as string)?.trim() || null;
    const segundoNombre = (formData.get("segundoNombre") as string)?.trim() || null;
    const primerApellido = (formData.get("primerApellido") as string)?.trim() || null;
    const segundoApellido = (formData.get("segundoApellido") as string)?.trim() || null;
    const derivedName =
      [primerNombre, segundoNombre, primerApellido, segundoApellido].filter(Boolean).join(" ") ||
      user.name ||
      user.email;
    const name = manualName || derivedName;

    startTransition(async () => {
      try {
        await updateUser(user.id, {
          role: formData.get("role") as "CLIENTE" | "VENDEDOR" | "EDITOR" | "ADMIN",
          cedula: (formData.get("cedula") as string)?.trim() || null,
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

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    const form = e.currentTarget;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement)?.value ?? "";
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement)?.value ?? "";
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirm) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }
    setPasswordPending(true);
    setUserPasswordAsAdmin(user.id, newPassword)
      .then(() => {
        setPasswordSuccess("Contraseña actualizada. El usuario ya puede iniciar sesión con la nueva contraseña.");
        form.reset();
      })
      .catch((err) => {
        setPasswordError(err instanceof Error ? err.message : "Error al actualizar la contraseña.");
      })
      .finally(() => {
        setPasswordPending(false);
      });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="name" className="text-sm font-medium text-[var(--foreground)]">
              Nombre completo
            </label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name ?? ""}
              placeholder="Ej. Juan Carlos Pérez López"
              disabled={isPending}
              className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              Si lo dejas vacío, se calculará automáticamente con los campos de nombre/apellido.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="primerNombre" className="text-sm font-medium text-[var(--foreground)]">
              Primer nombre
            </label>
            <Input
              id="primerNombre"
              name="primerNombre"
              defaultValue={user.primerNombre ?? ""}
              placeholder="Ej. Juan"
              disabled={isPending}
              className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="segundoNombre" className="text-sm font-medium text-[var(--foreground)]">
              Segundo nombre
            </label>
            <Input
              id="segundoNombre"
              name="segundoNombre"
              defaultValue={user.segundoNombre ?? ""}
              placeholder="Ej. Carlos"
              disabled={isPending}
              className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="primerApellido" className="text-sm font-medium text-[var(--foreground)]">
              Primer apellido
            </label>
            <Input
              id="primerApellido"
              name="primerApellido"
              defaultValue={user.primerApellido ?? ""}
              placeholder="Ej. Pérez"
              disabled={isPending}
              className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="segundoApellido" className="text-sm font-medium text-[var(--foreground)]">
              Segundo apellido
            </label>
            <Input
              id="segundoApellido"
              name="segundoApellido"
              defaultValue={user.segundoApellido ?? ""}
              placeholder="Ej. López"
              disabled={isPending}
              className="border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cedula" className="text-sm font-medium text-[var(--foreground)]">
              Cédula
            </label>
            <Input
              id="cedula"
              name="cedula"
              defaultValue={user.cedula ?? ""}
              placeholder="Ej. V-12345678"
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
              required
              defaultValue={user.role}
              className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50"
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
        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-2 text-sm text-[var(--muted-foreground)]">
          Email (solo lectura): <strong className="text-[var(--foreground)]">{user.email}</strong>
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
          >
            {isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`${ADMIN_PATH}/usuarios`)}
            disabled={isPending}
            className="border-[var(--border)]"
          >
            Volver a la lista
          </Button>
        </div>
      </form>

      <div className="mt-10 border-t border-[var(--border)] pt-8">
        <h3 className="mb-2 text-base font-semibold text-[var(--foreground)]">Cambiar contraseña</h3>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          Si el usuario olvidó su contraseña, puedes establecer una nueva. No necesitas la contraseña actual.
        </p>
        <form onSubmit={handlePasswordSubmit} className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-[var(--foreground)]">
              Nueva contraseña
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              disabled={passwordPending}
              className="w-56 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--foreground)]">
              Confirmar contraseña
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repetir contraseña"
              disabled={passwordPending}
              className="w-56 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={passwordPending}
            className="border-[var(--border)]"
          >
            {passwordPending ? "Guardando…" : "Establecer nueva contraseña"}
          </Button>
        </form>
        {passwordError && (
          <p className="mt-2 text-sm text-destructive">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>
        )}
      </div>
    </>
  );
}
