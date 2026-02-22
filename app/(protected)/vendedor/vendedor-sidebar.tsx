"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Shield, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PATH, ESCRITORIO_PATH, VENDEDOR_PATH } from "@/routes";
import { SignOutSidebarItem } from "@/components/sign-out-sidebar-item";

const items = [
  { href: VENDEDOR_PATH, label: "Panel", icon: LayoutDashboard },
  { href: `${VENDEDOR_PATH}/tickets`, label: "Tickets", icon: Ticket },
  { href: ESCRITORIO_PATH, label: "Escritorio", icon: Home },
] as const;

export function VendedorSidebar({
  onNavigate,
  showAdminLink = false,
}: { onNavigate?: () => void; showAdminLink?: boolean }) {
  const pathname = usePathname();
  const adminItem = { href: ADMIN_PATH, label: "Panel admin", icon: Shield };
  const allItems = showAdminLink ? [...items, adminItem] : items;

  return (
    <nav className="flex flex-col gap-1">
      <div className="space-y-1">
        {allItems.map((it) => {
          const isActive =
            pathname === it.href ||
            (it.href !== VENDEDOR_PATH && pathname.startsWith(it.href + "/"));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-blue-800 text-white" : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto border-t border-zinc-200 pt-3">
        <SignOutSidebarItem inactiveClassName="text-zinc-700 hover:bg-zinc-100 hover:text-black" />
      </div>
    </nav>
  );
}

