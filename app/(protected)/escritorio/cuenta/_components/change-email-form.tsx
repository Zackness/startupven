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
      setSuccess("Correo actualizado correctamente.");
      form.reset({ newEmail: values.newEmail });
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-black">Cambiar correo</h2>
      <p className="mb-4 text-sm text-zinc-600">
        Correo actual: <strong className="text-black">{currentEmail}</strong>
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" disabled={isPending} className="bg-black text-white hover:bg-zinc-800">
            {isPending ? "Guardando…" : "Cambiar correo"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
