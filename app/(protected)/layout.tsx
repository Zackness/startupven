import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CredentialsGuard } from "./credentials-guard";
import { OnboardingGuard } from "./onboarding-guard";
import { ONBOARDING_PATH } from "@/routes";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      requiresEmailChange: true,
      requiresPasswordChange: true,
      onboardingCompletedAt: true,
    },
  });

  // Obligatorio cambiar correo/contraseña para todos menos ADMIN (p. ej. usuarios creados por script)
  const mustUpdateCredentials = !!(
    user &&
    user.role !== "ADMIN" &&
    (user.requiresEmailChange || user.requiresPasswordChange)
  );

  // Onboarding: solo para roles que no son ADMIN y que no han completado el onboarding
  const mustOnboarding =
    !!user &&
    user.role !== "ADMIN" &&
    user.onboardingCompletedAt == null;

  return (
    <>
      <CredentialsGuard mustUpdate={mustUpdateCredentials} />
      <OnboardingGuard mustOnboarding={mustOnboarding} />
      {children}
    </>
  );
}
