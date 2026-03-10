import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ADMIN_PATH } from "@/routes";
import { EditorialCalendar } from "@/app/(protected)/escritorio/calendario-editorial/_components/editorial-calendar";

export default async function ProyectoCalendarioEditorialPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role ?? null;
  if (role !== "EDITOR" && role !== "ADMIN") redirect("/escritorio");

  const { projectId } = await params;
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  if (!project) redirect(`${ADMIN_PATH}/proyectos`);

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[680px]">
      <EditorialCalendar className="h-full" canEdit projectId={projectId} />
    </div>
  );
}
