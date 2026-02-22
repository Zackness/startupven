import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserButton } from "@/app/(auth)/components/user-button";
import { EscritorioSidebar } from "./escritorio-sidebar";
import { SidebarShell } from "@/components/layout/sidebar-shell";

export default async function EscritorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role ?? null;

  return (
    <SidebarShell
      storageKey="sidebar:escritorio:open"
      title="Escritorio"
      subtitle="Comedor universitario"
      maxWidthClass="max-w-5xl"
      nav={<EscritorioSidebar role={role} />}
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
