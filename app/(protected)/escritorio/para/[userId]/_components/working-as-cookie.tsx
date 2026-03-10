"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const COOKIE_NAME = "working-as-user-id";
const COOKIE_PATH = "/";

function setCookie(value: string | null) {
  if (typeof document === "undefined") return;
  if (value) {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)};path=${COOKIE_PATH};max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_NAME}=;path=${COOKIE_PATH};max-age=0`;
  }
}

export function WorkingAsCookie({ userId }: { userId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const inParaRoute = pathname?.startsWith("/escritorio/para/");
    if (inParaRoute && userId) {
      setCookie(userId);
    } else {
      setCookie(null);
    }
    return () => {
      setCookie(null);
    };
  }, [pathname, userId]);

  return null;
}
