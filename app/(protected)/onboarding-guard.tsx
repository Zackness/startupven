"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ONBOARDING_PATH } from "@/routes";

export function OnboardingGuard({ mustOnboarding }: { mustOnboarding: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!mustOnboarding) return;
    if (pathname === ONBOARDING_PATH) return;
    router.replace(ONBOARDING_PATH);
  }, [mustOnboarding, pathname, router]);

  return null;
}
