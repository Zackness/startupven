import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { OnboardingGuard } from "./onboarding-guard";

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
      onboardingCompletedAt: true,
    },
  });

  // No forzamos cambio de credenciales para no chocar con el onboarding al crear usuarios desde admin.

  // Onboarding: solo para clientes que aún no han completado sus datos
  const mustOnboarding =
    !!user &&
    user.role === "CLIENTE" &&
    user.onboardingCompletedAt == null;

  return (
    <>
      <OnboardingGuard mustOnboarding={mustOnboarding} />
      {children}
    </>
  );
}
