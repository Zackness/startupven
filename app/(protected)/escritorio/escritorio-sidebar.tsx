"use client";

import { Link } from "@/components/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, FileText, Globe, MessageSquare, Wallet, UserCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PATH, ESCRITORIO_PATH, ESCRITORIO_PROYECTOS_PATH, ESCRITORIO_DOMINIOS_PATH, ESCRITORIO_TICKETS_PATH, EDITOR_PATH, VENDEDOR_PATH } from "@/routes";
import { SignOutSidebarItem } from "@/components/sign-out-sidebar-item";

const baseItems = [
  { href: ESCRITORIO_PATH, label: "Inicio", icon: Home },
  { href: ESCRITORIO_PROYECTOS_PATH, label: "Proyectos", icon: FileText },
  { href: ESCRITORIO_DOMINIOS_PATH, label: "Dominios", icon: Globe },
  { href: ESCRITORIO_TICKETS_PATH, label: "Tickets", icon: MessageSquare },
  { href: `${ESCRITORIO_PATH}/billetera`, label: "Billetera", icon: Wallet },
  { href: `${ESCRITORIO_PATH}/cuenta`, label: "Mi cuenta", icon: UserCircle },
] as const;

const panelByRole: Record<string, { href: string; label: string; icon: typeof LayoutDashboard }> = {
  EDITOR: { href: EDITOR_PATH, label: "Panel editor", icon: LayoutDashboard },
  VENDEDOR: { href: VENDEDOR_PATH, label: "Panel vendedor", icon: LayoutDashboard },
};

/** Enlace a Admin: solo visible para rol ADMIN, tras Inicio para acceso rápido. */
const adminQuickLink = { href: ADMIN_PATH, label: "Admin", icon: Shield };

export function EscritorioSidebar({
  role,
  onNavigate,
}: { role?: string | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  const panelItem = role && role !== "ADMIN" ? panelByRole[role] : null;
  const showAdminLink = role === "ADMIN";
  const items = [
    baseItems[0],
    ...(showAdminLink ? [adminQuickLink] : []),
    ...baseItems.slice(1),
    ...(panelItem ? [panelItem] : []),
  ];

  return (
    <nav className="flex flex-col gap-1">
      <div className="space-y-1">
        {items.map((it) => {
          const isActive =
            pathname === it.href || (it.href !== ESCRITORIO_PATH && pathname.startsWith(it.href + "/"));

          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto space-y-3 border-t border-[var(--border)] pt-4">
        <SignOutSidebarItem inactiveClassName="text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]" />
        <p className="px-3 text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
          STARTUPVEN
        </p>
        <p className="px-3 text-[11px] text-[var(--muted-foreground)]">
          Infraestructura digital
        </p>
      </div>
    </nav>
  );
}

