"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Input from "@/components/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { CardWrapper } from "@/components/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { authClient } from "@/lib/better-auth-client";

const LoginSchema = z.object({
  email: z.string().email({
    message: "El correo electrónico es requerido",
  }),
  password: z.string().min(1, {
    message: "La contraseña es requerida",
  }),
});

export const LoginForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const { data, error: signInError } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: DEFAULT_LOGIN_REDIRECT,
      });

      if (signInError) {
        setError(signInError.message ?? "Credenciales inválidas");
        return;
      }

      setSuccess("¡Inicio de sesión exitoso!");
      const url = data?.url ?? DEFAULT_LOGIN_REDIRECT;
      router.push(url);
    });
  };

  return (
    <CardWrapper className="w-full border border-zinc-200 bg-white shadow-xl text-black">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof LoginSchema>, "email"> }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      {...field} 
                      disable={isPending} 
                      label="Email" 
                      id="email" 
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof LoginSchema>, "password"> }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        disable={isPending} 
                        label="Contraseña" 
                        id="password" 
                        type={showPassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="h-11 w-full rounded-xl bg-black text-base font-semibold text-white hover:bg-zinc-800"
          >
            Iniciar Sesión
          </Button>
          <div className="space-y-4 text-center">
            <Link
              href="/reset"
              className="text-sm text-zinc-600 underline underline-offset-2 hover:text-black"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};