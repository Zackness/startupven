import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserButton } from "@/app/(auth)/components/user-button";
import { ESCRITORIO_PATH } from "@/routes";
import { AdminSidebar } from "./admin-sidebar";
import { SidebarShell } from "@/components/layout/sidebar-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as unknown as { role?: string };
  const isAdmin = user.role === "ADMIN";
  const isEditor = user.role === "EDITOR";
  if (!isAdmin && !isEditor) {
    redirect(ESCRITORIO_PATH);
  }

  return (
    <SidebarShell
      storageKey="sidebar:admin:open"
      title="STVN"
      subtitle={isEditor ? "Editor · Contenido y operación" : "Admin · Panel de administración"}
      maxWidthClass="max-w-6xl"
      nav={<AdminSidebar isEditor={isEditor} />}
      headerRight={
        <>
          <span className="hidden text-sm text-[var(--muted-foreground)] sm:inline">
            {session.user.name} ({isEditor ? "Editor" : "Admin"})
          </span>
          <UserButton />
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}
