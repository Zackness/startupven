import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ESCRITORIO_PATH } from "@/routes";
import { ActualizarCredencialesForm } from "./_components/actualizar-credenciales-form";
import { SignOutButton } from "./_components/sign-out-button";

export default async function ActualizarCredencialesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      requiresEmailChange: true,
      requiresPasswordChange: true,
    },
  });

  if (!user) redirect(ESCRITORIO_PATH);
  if (!user.requiresEmailChange && !user.requiresPasswordChange) {
    redirect(ESCRITORIO_PATH);
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold text-black">
            Actualiza tus credenciales
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Tu cuenta tiene correo y/o contraseña temporal. Debes cambiarlos para
            poder usar el sistema.
          </p>
        </div>

        <ActualizarCredencialesForm
          currentEmail={user.email}
          requireEmail={user.requiresEmailChange}
          requirePassword={user.requiresPasswordChange}
        />

        <div className="pt-2 border-t border-zinc-200">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
