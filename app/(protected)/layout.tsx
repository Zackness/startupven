import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CredentialsGuard } from "./credentials-guard";
import { ACTUALIZAR_CREDENCIALES_PATH } from "@/routes";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { requiresEmailChange: true, requiresPasswordChange: true },
  });

  const mustUpdateCredentials = !!(
    user?.requiresEmailChange ||
    user?.requiresPasswordChange
  );

  return (
    <>
      <CredentialsGuard mustUpdate={mustUpdateCredentials} />
      {children}
    </>
  );
}
