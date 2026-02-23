"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { ChangeEmailSchema, type ChangeEmailSchemaType } from "@/schemas";
import { authClient } from "@/lib/better-auth-client";
import { clearRequiresEmailChange } from "@/lib/actions/users";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangeEmailSchemaType>({
    resolver: zodResolver(ChangeEmailSchema),
    defaultValues: { newEmail: currentEmail },
  });

  const onSubmit = (values: ChangeEmailSchemaType) => {
    if (values.newEmail === currentEmail) {
      setError("El nuevo correo debe ser distinto al actual.");
      return;
    }
    setError("");
    setSuccess("");
    startTransition(async () => {
      const { error: err } = await authClient.changeEmail({
        newEmail: values.newEmail,
        callbackURL: window.location.pathname,
      });
      if (err) {
        setError(err.message ?? "No se pudo cambiar el correo.");
        return;
      }
      await clearRequiresEmailChange();
      setSuccess("Correo actualizado correctamente.");
      form.reset({ newEmail: values.newEmail });
    });
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        Correo
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
        Cambiar correo
      </h2>
      <p className="mt-2 text-[15px] text-[var(--muted-foreground)] leading-relaxed">
        Correo actual: <strong className="text-[var(--foreground)]">{currentEmail}</strong>
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <FormField
            control={form.control}
            name="newEmail"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="nuevo@correo.com"
                    disabled={isPending}
                    className="border-[var(--border)] bg-[var(--background)]"
                  />
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
            {isPending ? "Guardando…" : "Cambiar correo"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
