import { ErrorCard } from "@/app/(auth)/error/components/error-card";
import { Suspense } from "react";

const AuthErrorPage = () => {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Error de autenticación
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Algo salió mal. Revisa el mensaje más abajo e intenta de nuevo.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        }
      >
        <ErrorCard />
      </Suspense>
    </div>
  );
};

export default AuthErrorPage;