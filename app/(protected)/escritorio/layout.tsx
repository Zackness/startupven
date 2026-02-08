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

  return (
    <SidebarShell
      storageKey="sidebar:escritorio:open"
      title="Escritorio"
      subtitle="Comedor universitario"
      maxWidthClass="max-w-5xl"
      nav={<EscritorioSidebar />}
      headerRight={
        <>
          <span className="hidden text-sm text-zinc-600 sm:inline">{session.user.name}</span>
          <UserButton />
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}
