"use client";

import { Link } from "@/components/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, UtensilsCrossed, Users, FolderKanban, Settings, Cog, QrCode, MessageSquare, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PATH, ADMIN_SOPORTE_PATH, EDITOR_PATH, ESCRITORIO_PATH, VENDEDOR_PATH } from "@/routes";
import { SignOutSidebarItem } from "@/components/sign-out-sidebar-item";

/** Admin: enfoque en plataforma (marca) y operación agrupada. */
const adminItems = [
  { href: ADMIN_PATH, label: "Panel", icon: LayoutDashboard },
  { href: `${ADMIN_PATH}/proyectos`, label: "Proyectos", icon: FolderKanban },
  { href: `${ADMIN_PATH}/servicios`, label: "Servicios", icon: Package },
  { href: ADMIN_SOPORTE_PATH, label: "Soporte", icon: MessageSquare },
  { href: `${ADMIN_PATH}/usuarios`, label: "Usuarios", icon: Users },
  { href: `${ADMIN_PATH}/operacion`, label: "Operación", icon: Cog },
  { href: `${ADMIN_PATH}/configuracion`, label: "Configuración", icon: Settings },
  { href: ESCRITORIO_PATH, label: "Escritorio", icon: Home },
] as const;

/** Editor: contenido y operación del día a día. */
const editorItems = [
  { href: EDITOR_PATH, label: "Panel", icon: LayoutDashboard },
  { href: `${ADMIN_PATH}/proyectos`, label: "Proyectos", icon: FolderKanban },
  { href: ADMIN_SOPORTE_PATH, label: "Soporte", icon: MessageSquare },
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

