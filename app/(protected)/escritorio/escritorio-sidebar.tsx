"use client";

import { Link } from "@/components/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, FileText, Globe, MessageSquare, Wallet, UserCircle, Shield, CalendarDays, Users, CreditCard, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ADMIN_PATH,
  AGENCY_CLIENTES_PATH,
  ESCRITORIO_PATH,
  ESCRITORIO_PROYECTOS_PATH,
  ESCRITORIO_DOMINIOS_PATH,
  ESCRITORIO_TICKETS_PATH,
  ESCRITORIO_PAGOS_PATH,
  ESCRITORIO_SERVICIOS_PATH,
  ESCRITORIO_CALENDARIO_EDITORIAL_PATH,
  EDITOR_PATH,
  VENDEDOR_PATH,
} from "@/routes";
import { SignOutSidebarItem } from "@/components/sign-out-sidebar-item";

type SidebarItem = {
  href: string;
  label: string;
  icon: typeof Home;
  personal?: boolean;
};

const baseItems: SidebarItem[] = [
  { href: ESCRITORIO_PATH, label: "Inicio", icon: Home },
  { href: ESCRITORIO_PROYECTOS_PATH, label: "Proyectos", icon: FileText },
  { href: ESCRITORIO_SERVICIOS_PATH, label: "Servicios", icon: Package },
  { href: ESCRITORIO_PAGOS_PATH, label: "Pagos", icon: CreditCard },
  { href: ESCRITORIO_DOMINIOS_PATH, label: "Dominios", icon: Globe },
  // Tickets, Billetera y Mi cuenta se consideran secciones personales
  { href: ESCRITORIO_TICKETS_PATH, label: "Tickets", icon: MessageSquare, personal: true },
  { href: ESCRITORIO_CALENDARIO_EDITORIAL_PATH, label: "Calendario editorial", icon: CalendarDays },
  { href: `${ESCRITORIO_PATH}/billetera`, label: "Billetera", icon: Wallet, personal: true },
  { href: `${ESCRITORIO_PATH}/cuenta`, label: "Mi cuenta", icon: UserCircle, personal: true },
];

const panelByRole: Record<string, SidebarItem> = {
  EDITOR: { href: EDITOR_PATH, label: "Panel editor", icon: LayoutDashboard },
  VENDEDOR: { href: VENDEDOR_PATH, label: "Panel vendedor", icon: LayoutDashboard },
};

/** Enlace a Admin: solo visible para rol ADMIN. */
const adminQuickLink: SidebarItem = { href: ADMIN_PATH, label: "Admin", icon: Shield };

/** Enlace a Clientes (Agency): visible para EDITOR y ADMIN. */
const agencyClientesLink: SidebarItem = { href: AGENCY_CLIENTES_PATH, label: "Clientes", icon: Users };

function withBasePath(href: string, basePath: string | null): string {
  if (!basePath) return href;
  if (href === ESCRITORIO_PATH) return basePath;
  // En modo "trabajar como cliente" mantenemos estas secciones como propias del usuario actual.
  if (
    href === ESCRITORIO_TICKETS_PATH ||
    href.startsWith(ESCRITORIO_TICKETS_PATH + "/") ||
    href === ESCRITORIO_PAGOS_PATH ||
    href.startsWith(ESCRITORIO_PAGOS_PATH + "/") ||
    href === ESCRITORIO_SERVICIOS_PATH ||
    href.startsWith(ESCRITORIO_SERVICIOS_PATH + "/") ||
    href === `${ESCRITORIO_PATH}/billetera` ||
    href.startsWith(`${ESCRITORIO_PATH}/billetera/`) ||
    href === `${ESCRITORIO_PATH}/cuenta` ||
    href.startsWith(`${ESCRITORIO_PATH}/cuenta/`)
  ) {
    return href;
  }
  if (href.startsWith(ESCRITORIO_PATH + "/")) return basePath + href.slice(ESCRITORIO_PATH.length);
  return href;
}

export function EscritorioSidebar({
  role,
  basePath = null,
  onNavigate,
}: { role?: string | null; basePath?: string | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  const inParaMode = !!basePath;
  const panelItem = role && role !== "ADMIN" ? panelByRole[role] : null;
  const showAdminLink = role === "ADMIN";
  const showAgencyClientes = role === "EDITOR" || role === "ADMIN";
  const items = [
    baseItems[0],
    ...(showAdminLink ? [adminQuickLink] : []),
    ...(showAgencyClientes ? [agencyClientesLink] : []),
    ...baseItems.slice(1),
    ...(panelItem ? [panelItem] : []),
  ].filter((it) => !(inParaMode && it.personal));

  return (
    <nav className="flex flex-col gap-1">
      <div className="space-y-1">
        {items.map((it) => {
          const href = withBasePath(it.href, basePath);
          const isActive =
            pathname === href || (href.length > 0 && pathname.startsWith(href + "/"));

          const Icon = it.icon;
          return (
            <Link
              key={it.href + (basePath ?? "")}
              href={href}
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

