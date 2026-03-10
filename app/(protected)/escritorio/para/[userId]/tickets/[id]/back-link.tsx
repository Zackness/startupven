"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BackToParaTickets() {
  const pathname = usePathname() ?? "";
  const backHref = pathname.replace(/\/tickets\/[^/]+$/, "/tickets");

  return (
    <Link
      href={backHref}
      className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
    >
      ← Volver a tickets
    </Link>
  );
}
