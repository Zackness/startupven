import { ErrorCard } from "@/app/(auth)/error/components/error-card";
import { Suspense } from 'react';

const AuthErrorPage = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-10 shadow-xl w-full max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">¡Ups! Algo salió mal</h1>
        <p className="text-white/80 text-lg">Ha ocurrido un error inesperado</p>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      }>
        <ErrorCard />
      </Suspense>
    </div>
  );
};

export default AuthErrorPage;