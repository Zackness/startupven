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
  if (user.role !== "ADMIN") {
    redirect(ESCRITORIO_PATH);
  }

  return (
    <SidebarShell
      storageKey="sidebar:admin:open"
      title="Administración"
      subtitle="Comedor universitario"
      maxWidthClass="max-w-6xl"
      nav={<AdminSidebar />}
      headerRight={
        <>
          <span className="hidden text-sm text-zinc-600 sm:inline">{session.user.name} (Admin)</span>
          <UserButton />
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}
