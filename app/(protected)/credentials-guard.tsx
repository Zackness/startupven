"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ACTUALIZAR_CREDENCIALES_PATH } from "@/routes";

export function CredentialsGuard({ mustUpdate }: { mustUpdate: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!mustUpdate) return;
    if (pathname === ACTUALIZAR_CREDENCIALES_PATH) return;
    router.replace(ACTUALIZAR_CREDENCIALES_PATH);
  }, [mustUpdate, pathname, router]);

  return null;
}
