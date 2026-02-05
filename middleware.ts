import {
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  getLoginRedirect,
  adminRoutesPrefix,
  protectedClientPrefix,
  ESCRITORIO_PATH,
} from "@/routes";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type SessionPayload = { user?: { role?: string } } | null;

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  if (nextUrl.pathname.startsWith("/api/uploadthing")) {
    return;
  }

  if (nextUrl.pathname.startsWith("/api") && !nextUrl.pathname.startsWith(apiAuthPrefix)) {
    return;
  }

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.some((route) => new RegExp(`^${route}$`).test(nextUrl.pathname));
  // Registro oculto: redirigir a login (no se permite autoregistro)
  if (nextUrl.pathname === "/register") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname === adminRoutesPrefix || nextUrl.pathname.startsWith(adminRoutesPrefix + "/");
  const isClientProtectedRoute =
    nextUrl.pathname === protectedClientPrefix || nextUrl.pathname.startsWith(protectedClientPrefix + "/");

  if (isApiAuthRoute) {
    return;
  }

  let sessionData: SessionPayload = null;
  if (isAuthRoute || isAdminRoute || isClientProtectedRoute || !isPublicRoute) {
    const cookie = req.headers.get("cookie") ?? "";
    const hasSessionCookie =
      cookie.includes("better-auth.session_token=") ||
      cookie.includes("__Secure-better-auth.session_token=") ||
      cookie.includes("__Host-better-auth.session_token=");

    if (hasSessionCookie) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      try {
        const sessionRes = await fetch(new URL("/api/auth/get-session", nextUrl), {
          method: "GET",
          headers: { cookie },
          cache: "no-store",
          signal: controller.signal,
        });
        if (sessionRes.ok) {
          sessionData = (await sessionRes.json().catch(() => null)) as SessionPayload;
        }
      } catch {
        sessionData = null;
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  const isLoggedIn = sessionData != null && sessionData.user != null;
  const role = sessionData?.user?.role ?? null;

  if (isAuthRoute) {
    if (isLoggedIn) {
      const redirectTo = getLoginRedirect(role);
      return NextResponse.redirect(new URL(redirectTo, nextUrl));
    }
    return;
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL(ESCRITORIO_PATH, nextUrl));
    }
    return;
  }

  if (isClientProtectedRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }
    return;
  }

  if (!isPublicRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
