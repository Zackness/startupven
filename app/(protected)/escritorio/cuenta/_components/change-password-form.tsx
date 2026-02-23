"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { ChangePasswordSchema, type ChangePasswordSchemaType } from "@/schemas";
import { authClient } from "@/lib/better-auth-client";
import { clearRequiresPasswordChange } from "@/lib/actions/users";
import { Eye, EyeOff } from "lucide-react";

export function ChangePasswordForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onSubmit = (values: ChangePasswordSchemaType) => {
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
      setSuccess("Contraseña actualizada correctamente.");
      form.reset({ currentPassword: "", newPassword: "" });
    });
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        Seguridad
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
        Cambiar contraseña
      </h2>
      <p className="mt-2 text-[15px] text-[var(--muted-foreground)] leading-relaxed">
        Usa una contraseña segura y no la compartas.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showCurrent ? "text" : "password"}
                      placeholder="Contraseña actual"
                      disabled={isPending}
                      className="border-[var(--border)] bg-[var(--background)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
            control={form.control}
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
                      className="border-[var(--border)] bg-[var(--background)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            type="submit"
            disabled={isPending}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
          >
            {isPending ? "Guardando…" : "Cambiar contraseña"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
