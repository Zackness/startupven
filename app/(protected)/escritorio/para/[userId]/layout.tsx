import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AGENCY_CLIENTES_PATH } from "@/routes";
import { WorkingAsCookie } from "./_components/working-as-cookie";
import Link from "next/link";

function fullName(u: {
  name: string | null;
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
}) {
  if (u.primerNombre || u.primerApellido) {
    const parts = [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido].filter(Boolean);
    return parts.join(" ") || u.name || "—";
  }
  return u.name || "—";
}

export default async function EscritorioParaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role ?? null;
  if (role !== "EDITOR" && role !== "ADMIN") redirect("/escritorio");

  const { userId } = await params;
  const client = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
    },
  });
  if (!client) redirect(AGENCY_CLIENTES_PATH);

  const clientName = fullName(client);

  return (
    <>
      <WorkingAsCookie userId={userId} />
      <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-2 text-sm text-[var(--muted-foreground)]">
        Trabajando como <strong className="text-[var(--foreground)]">{clientName}</strong>
        {" · "}
        <Link href={AGENCY_CLIENTES_PATH} className="font-medium underline underline-offset-2 hover:text-[var(--foreground)]">
          Volver a clientes
        </Link>
      </div>
      {children}
    </>
  );
}
