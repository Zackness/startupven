import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ESCRITORIO_PATH } from "@/routes";
import { UserButton } from "@/app/(auth)/components/user-button";
import { EscritorioSidebar } from "@/app/(protected)/escritorio/escritorio-sidebar";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { ChatbotFab } from "@/components/chatbot-fab";

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as unknown as { role?: string })?.role ?? null;
  if (role !== "EDITOR" && role !== "ADMIN") redirect(ESCRITORIO_PATH);

  return (
    <SidebarShell
      storageKey="sidebar:escritorio:open"
      title="STVN"
      subtitle="Agency · Clientes"
      maxWidthClass="max-w-6xl"
      nav={<EscritorioSidebar role={role} />}
      headerRight={
        <>
          <span className="hidden text-sm text-[var(--muted-foreground)] sm:inline">{session.user.name}</span>
          <UserButton />
        </>
      }
    >
      {children}
      <ChatbotFab compact />
    </SidebarShell>
  );
}
