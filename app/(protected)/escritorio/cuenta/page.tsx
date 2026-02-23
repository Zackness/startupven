import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChangeEmailForm } from "./_components/change-email-form";
import { ChangePasswordForm } from "./_components/change-password-form";

export default async function CuentaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-12 sm:space-y-14">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Mi cuenta
        </h1>
        <p className="mt-3 text-[15px] text-[var(--muted-foreground)] max-w-xl leading-relaxed">
          Configura tu correo y contraseña.
        </p>
      </section>

      <section>
        <p className="mb-6 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Configuración
        </p>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 sm:gap-8">
          <ChangeEmailForm currentEmail={session.user.email ?? ""} />
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
