"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { EscritorioSidebar } from "./escritorio-sidebar";

function getBasePathFromPathname(pathname: string | null): string | null {
  if (!pathname) return null;
  // /escritorio/para/[userId]/...
  const m = pathname.match(/^\/escritorio\/para\/([^/]+)(?:\/|$)/);
  if (!m?.[1]) return null;
  return `/escritorio/para/${m[1]}`;
}

export function EscritorioSidebarWrapper({
  role,
  onNavigate,
}: {
  role?: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const basePath = useMemo(() => getBasePathFromPathname(pathname), [pathname]);
  return <EscritorioSidebar role={role} basePath={basePath} onNavigate={onNavigate} />;
}

