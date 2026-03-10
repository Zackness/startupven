import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AGENCY_CLIENTES_PATH } from "@/routes";
import Link from "next/link";

export default async function AgencyPage() {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string })?.role ?? null;
  if (role === "EDITOR" || role === "ADMIN") {
    redirect(AGENCY_CLIENTES_PATH);
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 py-12">
      <h1 className="text-xl font-bold text-[var(--foreground)]">Agency</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Inicia sesión como editor o administrador para gestionar clientes.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/agency/login"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}