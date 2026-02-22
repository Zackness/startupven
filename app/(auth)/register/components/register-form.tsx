"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useState, useTransition, useEffect } from "react";
import Input from "@/components/input";
import { CardWrapper } from "@/components/card-wrapper";
import { Button } from "@/components/ui/button";
import { RegisterSchema } from "@/schemas";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { authClient } from "@/lib/better-auth-client";

export const RegisterForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [succes, setSucces] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [isMounted, setIsMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
  
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    const form = useForm<z.infer<typeof RegisterSchema>>({
      resolver: zodResolver(RegisterSchema),
      defaultValues: {
        email: "",
        password: "",
        name: "",
      },
    });
  
    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
      setError("");
      setSucces("");
  
      startTransition(async () => {
        const { data, error: signUpError } = await authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
          callbackURL: DEFAULT_LOGIN_REDIRECT,
        });

        if (signUpError) {
          setError(signUpError.message ?? "No se pudo crear la cuenta");
          return;
        }

        setSucces("Cuenta creada correctamente. Iniciando sesión...");
        const url = data && "url" in data ? (data as { url?: string }).url : undefined;
        window.location.href = url ?? DEFAULT_LOGIN_REDIRECT;
      });
    };
  
    if (!isMounted) {
      return null;
    }

  return (
    <CardWrapper className="w-full shadow-xl">
      <motion.h2
        className="mb-6 text-center text-3xl font-bold text-[var(--foreground)] sm:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Registro
      </motion.h2>
      <div className="flex flex-col gap-4">
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        {...field} 
                        disable={isPending} 
                        label="Nombre" 
                        id="name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
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
                render={({ field }) => (
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none"
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
            <FormSuccess message={succes} />
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 w-full rounded-xl bg-[var(--primary)] text-base font-semibold text-[var(--primary-foreground)] hover:opacity-90"
            >
              Registrarse
            </Button>
          </form>
        </Form>
      </div>
      <div className="mt-6 text-center">
        <div className="text-sm text-[var(--muted-foreground)]">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--foreground)] underline underline-offset-2 hover:no-underline"
          >
            Inicia Sesión
          </Link>
        </div>
      </div>
    </CardWrapper>
  );
};