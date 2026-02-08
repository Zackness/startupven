import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserButton } from "@/app/(auth)/components/user-button";
import { ESCRITORIO_PATH } from "@/routes";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { VendedorSidebar } from "./vendedor-sidebar";

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as unknown as { role?: string };
  if (user.role !== "ADMIN" && user.role !== "VENDEDOR") {
    redirect(ESCRITORIO_PATH);
  }

  return (
    <SidebarShell
      storageKey="sidebar:vendedor:open"
      title="Vendedor"
      subtitle="Comedor universitario"
      maxWidthClass="max-w-6xl"
      nav={<VendedorSidebar />}
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

