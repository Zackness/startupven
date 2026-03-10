import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ADMIN_PATH, ESCRITORIO_PROYECTO_PATH } from "@/routes";
import Link from "next/link";

export default async function EscritorioProyectoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role ?? null;
  if (role !== "EDITOR" && role !== "ADMIN") redirect("/escritorio");

  const { projectId } = await params;
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, titulo: true },
  });
  if (!project) redirect(`${ADMIN_PATH}/proyectos`);

  return (
    <>
      <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-2 text-sm text-[var(--muted-foreground)]">
        Trabajando en el proyecto{" "}
        <strong className="text-[var(--foreground)]">{project.titulo}</strong>
        {" · "}
        <Link
          href={`${ADMIN_PATH}/proyectos`}
          className="font-medium underline underline-offset-2 hover:text-[var(--foreground)]"
        >
          Volver a proyectos
        </Link>
        {" · "}
        <Link
          href={`${ADMIN_PATH}/proyectos/${projectId}/editar`}
          className="font-medium underline underline-offset-2 hover:text-[var(--foreground)]"
        >
          Editar proyecto
        </Link>
      </div>
      {children}
    </>
  );
}
