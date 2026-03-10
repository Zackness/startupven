import { RegisterForm } from "@/app/(auth)/register/components/register-form";
import { Suspense } from "react";

/**
 * Registro del área Agency. /register redirige aquí desde el middleware.
 */
export default function AgencyRegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Regístrate con tu correo para empezar a usar el servicio.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
