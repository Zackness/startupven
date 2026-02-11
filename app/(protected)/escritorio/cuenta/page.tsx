import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChangeEmailForm } from "./_components/change-email-form";
import { ChangePasswordForm } from "./_components/change-password-form";

export default async function CuentaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Mi cuenta</h1>
        <p className="mt-1 text-zinc-600">
          Cambia tu correo electrónico y tu contraseña
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <ChangeEmailForm currentEmail={session.user.email ?? ""} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
