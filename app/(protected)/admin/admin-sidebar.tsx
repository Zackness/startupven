"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, ClipboardList, QrCode, ShoppingCart, Ticket, UtensilsCrossed, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PATH, EDITOR_PATH, ESCRITORIO_PATH, VENDEDOR_PATH } from "@/routes";
import { SignOutSidebarItem } from "@/components/sign-out-sidebar-item";

const adminItems = [
  { href: ADMIN_PATH, label: "Panel", icon: LayoutDashboard },
  { href: `${ADMIN_PATH}/tickets`, label: "Tickets", icon: Ticket },
  { href: VENDEDOR_PATH, label: "Vender", icon: ShoppingCart },
  { href: `${ADMIN_PATH}/ventas-pendientes`, label: "Ventas pendientes", icon: ClipboardList },
  { href: `${ADMIN_PATH}/escaneo`, label: "Escanear QR", icon: QrCode },
  { href: `${ADMIN_PATH}/almuerzos`, label: "Platos", icon: UtensilsCrossed },
  { href: `${ADMIN_PATH}/usuarios`, label: "Usuarios", icon: Users },
  { href: ESCRITORIO_PATH, label: "Escritorio", icon: Home },
] as const;

const editorItems = [
  { href: EDITOR_PATH, label: "Panel editor", icon: LayoutDashboard },
  { href: `${ADMIN_PATH}/escaneo`, label: "Escanear QR", icon: QrCode },
  { href: `${ADMIN_PATH}/almuerzos`, label: "Platos", icon: UtensilsCrossed },
  { href: ESCRITORIO_PATH, label: "Escritorio", icon: Home },
] as const;

export function AdminSidebar({
  onNavigate,
  isEditor = false,
}: { onNavigate?: () => void; isEditor?: boolean }) {
  const pathname = usePathname();
  const items = isEditor ? editorItems : adminItems;

  return (
    <nav className="flex flex-col gap-1">
      <div className="space-y-1">
        {items.map((it) => {
          const isActive =
            pathname === it.href ||
            (it.href !== ADMIN_PATH && pathname.startsWith(it.href + "/")) ||
            (it.href === ADMIN_PATH && pathname === ADMIN_PATH);

          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto border-t border-[var(--border)] pt-3">
        <SignOutSidebarItem inactiveClassName="text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]" />
      </div>
    </nav>
  );
}

