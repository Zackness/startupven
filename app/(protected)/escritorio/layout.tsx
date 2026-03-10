import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserButton } from "@/app/(auth)/components/user-button";
import { EscritorioSidebarWrapper } from "./escritorio-sidebar-wrapper";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { ChatbotFab } from "@/components/chatbot-fab";

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
      title="STVN"
      subtitle="Escritorio · Sistema estructurado"
      maxWidthClass="max-w-6xl"
      nav={<EscritorioSidebarWrapper role={role} />}
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
