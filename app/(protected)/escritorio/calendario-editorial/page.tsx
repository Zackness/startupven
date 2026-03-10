import { auth } from "@/lib/auth";
import { BRAND_NAME } from "@/components/marca/brand";
import { EditorialCalendar } from "./_components/editorial-calendar";
import { getAssignedProjectsForCurrentUser, createProjectAsClient } from "@/lib/actions/projects";

export const metadata = {
  title: `Calendario editorial | ${BRAND_NAME}`,
  description: "Planifica y organiza publicaciones para redes sociales por día y mes.",
};

export default async function CalendarioEditorialPage() {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string } | null)?.role ?? null;
  const canEdit = role !== "CLIENTE";

  const assignedProjects = await getAssignedProjectsForCurrentUser();

  const canCreateProject = role !== "ADMIN" && role !== "EDITOR";

  return (
    // Full-page: estira el calendario dentro del main del escritorio
    <div className="h-[calc(100vh-10rem)] min-h-[680px]">
      <EditorialCalendar
        className="h-full"
        canEdit={canEdit}
        assignedProjects={assignedProjects}
        createProjectAction={canCreateProject ? createProjectAsClient : undefined}
      />
    </div>
  );
}

