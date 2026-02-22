import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserButton } from "@/app/(auth)/components/user-button";
import { ESCRITORIO_PATH } from "@/routes";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { EditorSidebar } from "./editor-sidebar";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    redirect(ESCRITORIO_PATH);
  }

  return (
    <SidebarShell
      storageKey="sidebar:editor:open"
      title="Editor"
      subtitle="Comedor universitario"
      maxWidthClass="max-w-6xl"
      nav={<EditorSidebar />}
      headerRight={
        <>
          <span className="hidden text-sm text-[var(--muted-foreground)] sm:inline">{session.user.name}</span>
          <UserButton />
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}

