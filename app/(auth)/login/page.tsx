import { LoginForm } from "@/app/(auth)/login/components/login-form";
import { Suspense } from "react";

export default function Login() {
  return (
    <div className="w-full max-w-md">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}