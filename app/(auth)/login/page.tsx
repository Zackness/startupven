import { LoginForm } from "@/app/(auth)/login/components/login-form";
import { Suspense } from "react";

export default function Login() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Inicio de sesión
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Entra con tu correo y contraseña para acceder a tu cuenta.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}