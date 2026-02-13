"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { ChangeEmailSchema, ChangePasswordSchema, type ChangeEmailSchemaType, type ChangePasswordSchemaType } from "@/schemas";
import { authClient } from "@/lib/better-auth-client";
import { clearRequiresEmailChange, clearRequiresPasswordChange } from "@/lib/actions/users";
import { ESCRITORIO_PATH } from "@/routes";
import { Eye, EyeOff } from "lucide-react";

export function ActualizarCredencialesForm({
  currentEmail,
  requireEmail,
  requirePassword,
}: {
  currentEmail: string;
  requireEmail: boolean;
  requirePassword: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const emailForm = useForm<ChangeEmailSchemaType>({
    resolver: zodResolver(ChangeEmailSchema),
    defaultValues: { newEmail: currentEmail },
  });

  const passwordForm = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onEmailSubmit = (values: ChangeEmailSchemaType) => {
    if (values.newEmail === currentEmail) {
      setError("El nuevo correo debe ser distinto al actual.");
      return;
    }
    setError("");
    setSuccess("");
    startTransition(async () => {
      const { error: err } = await authClient.changeEmail({
        newEmail: values.newEmail,
        callbackURL: ESCRITORIO_PATH,
      });
      if (err) {
        setError(err.message ?? "No se pudo cambiar el correo.");
        return;
      }
      await clearRequiresEmailChange();
      setSuccess("Correo actualizado. Redirigiendo…");
      router.refresh();
      router.push(ESCRITORIO_PATH);
    });
  };

  const onPasswordSubmit = (values: ChangePasswordSchemaType) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const { error: err } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: false,
      });
      if (err) {
        setError(err.message ?? "No se pudo cambiar la contraseña.");
        return;
      }
      await clearRequiresPasswordChange();
      setSuccess("Contraseña actualizada. Redirigiendo…");
      router.refresh();
      router.push(ESCRITORIO_PATH);
    });
  };

  return (
    <div className="space-y-6">
      <FormError message={error} />
      <FormSuccess message={success} />

      {requireEmail && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-black">Nuevo correo electrónico</h2>
          <p className="mb-3 text-xs text-zinc-600">
            Correo actual: <strong className="text-black">{currentEmail}</strong>
          </p>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-3">
              <FormField
                control={emailForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} type="email" placeholder="nuevo@correo.com" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full bg-black text-white hover:bg-zinc-800">
                {isPending ? "Guardando…" : "Cambiar correo"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {requirePassword && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-black">Nueva contraseña</h2>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showCurrent ? "text" : "password"}
                          placeholder="Contraseña actual (temporal)"
                          disabled={isPending}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black"
                        >
                          {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showNew ? "text" : "password"}
                          placeholder="Nueva contraseña (mín. 8 caracteres)"
                          disabled={isPending}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black"
                        >
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full bg-black text-white hover:bg-zinc-800">
                {isPending ? "Guardando…" : "Cambiar contraseña"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {!requireEmail && !requirePassword && (
        <p className="text-sm text-zinc-600">Ya actualizaste tus credenciales. Redirigiendo…</p>
      )}
    </div>
  );
}
