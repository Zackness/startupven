import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ESCRITORIO_PATH } from "@/routes";
import { getLoginRedirect } from "@/routes";
import { getAllServicePackagesFromDb } from "@/lib/actions/service-packages-db";
import { OnboardingForm } from "./_components/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, allPackages] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        onboardingCompletedAt: true,
        primerNombre: true,
        segundoNombre: true,
        primerApellido: true,
        segundoApellido: true,
        cedula: true,
        telefono: true,
      },
    }),
    getAllServicePackagesFromDb(),
  ]);

  if (!user) redirect(ESCRITORIO_PATH);
  // Solo clientes hacen onboarding; el resto va a su área correspondiente
  if (user.role !== "CLIENTE") redirect(getLoginRedirect(user.role));
  if (user.onboardingCompletedAt) redirect(ESCRITORIO_PATH);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:max-w-2xl sm:p-8 md:max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Bienvenido
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Completa tu perfil y proyectos
          </h1>
          <p className="mt-3 text-[15px] text-[var(--muted-foreground)] leading-relaxed">
            Necesitamos tus datos y los proyectos del servicio que adquieres. Según los proyectos que indiques se te facturará.
          </p>
        </div>

        <OnboardingForm
          allPackages={allPackages}
          defaultPrimerNombre={user.primerNombre ?? ""}
          defaultSegundoNombre={user.segundoNombre ?? ""}
          defaultPrimerApellido={user.primerApellido ?? ""}
          defaultSegundoApellido={user.segundoApellido ?? ""}
          defaultCedula={user.cedula ?? ""}
          defaultTelefono={user.telefono ?? ""}
        />
      </div>
    </div>
  );
}
