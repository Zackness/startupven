import {
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  getLoginRedirect,
  adminRoutesPrefix,
  vendorRoutesPrefix,
  editorRoutesPrefix,
  protectedClientPrefix,
  ESCRITORIO_PATH,
  getMainDomain,
} from "@/routes";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type SessionPayload = { user?: { role?: string } } | null;

export default async function middleware(req: NextRequest) {
  const nextUrl = req.nextUrl.clone();
  const pathname = nextUrl.pathname;
  const host = req.headers.get("host") ?? "";
  const mainDomain = getMainDomain();
  const searchParams = nextUrl.searchParams.toString();

  if (nextUrl.pathname.startsWith("/api/uploadthing")) {
    return;
  }

  if (nextUrl.pathname.startsWith("/api") && !nextUrl.pathname.startsWith(apiAuthPrefix)) {
    return;
  }

  // ─── Lógica de subdominios y rewrites (zona Agency / creación de sitios) ───
  // Host sin puerto para comparar con mainDomain (en dev host = "localhost:3000")
  const hostnameOnly = host.split(":")[0] ?? host;
  const isMainDomain = hostnameOnly === mainDomain || hostnameOnly === `www.${mainDomain}`;
  if (!isMainDomain && hostnameOnly.endsWith(`.${mainDomain}`)) {
    const customSubdomain = hostnameOnly.replace(`.${mainDomain}`, "").trim();
    if (customSubdomain) {
      const rewritePath = `/${customSubdomain}${pathname === "/" ? "" : pathname}${searchParams ? `?${searchParams}` : ""}`;
      return NextResponse.rewrite(new URL(rewritePath, req.url));
    }
  }

  // Centralizar login/register del producto en /agency (zona de creación de sitios)
  if (pathname === "/login") {
    const url = new URL("/agency/login", req.url);
    if (nextUrl.search) url.search = nextUrl.search;
    return NextResponse.redirect(url);
  }
  if (pathname === "/register") {
    const url = new URL("/agency/register", req.url);
    if (nextUrl.search) url.search = nextUrl.search;
    return NextResponse.redirect(url);
  }

  // En el dominio principal, / y /site muestran el mismo contenido (landing / site)
  if (isMainDomain && (pathname === "/" || pathname === "/site")) {
    return NextResponse.rewrite(new URL("/site", req.url));
  }

  // /agency y /subaccount se dejan pasar; la protección por sesión va más abajo
  // (no hacemos rewrite aquí; el snippet original reescribía mal solo pathWithSearchParams)

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.some((route) => new RegExp(`^${route}$`).test(nextUrl.pathname));
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname === adminRoutesPrefix || nextUrl.pathname.startsWith(adminRoutesPrefix + "/");
  const isVendorRoute =
    nextUrl.pathname === vendorRoutesPrefix || nextUrl.pathname.startsWith(vendorRoutesPrefix + "/");
  const isEditorRoute =
    nextUrl.pathname === editorRoutesPrefix || nextUrl.pathname.startsWith(editorRoutesPrefix + "/");
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
    if (role === "EDITOR") {
      const path = nextUrl.pathname;
      const editorAllowed =
        path === adminRoutesPrefix ||
        path === adminRoutesPrefix + "/" ||
        path.startsWith(adminRoutesPrefix + "/almuerzos") ||
        path.startsWith(adminRoutesPrefix + "/escaneo") ||
        path.startsWith(adminRoutesPrefix + "/proyectos");
      if (!editorAllowed) {
        return NextResponse.redirect(new URL(ESCRITORIO_PATH, nextUrl));
      }
      return;
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL(ESCRITORIO_PATH, nextUrl));
    }
    return;
  }

  if (isVendorRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }
    if (role !== "ADMIN" && role !== "VENDEDOR") {
      return NextResponse.redirect(new URL(ESCRITORIO_PATH, nextUrl));
    }
    return;
  }

  if (isEditorRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.redirect(new URL(ESCRITORIO_PATH, nextUrl));
    }
    return;
  }

  if (isClientProtectedRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }
    // Solo EDITOR y ADMIN pueden acceder a /escritorio/para/[userId] (trabajar como cliente)
    if (pathname.startsWith(ESCRITORIO_PATH + "/para/")) {
      if (role !== "EDITOR" && role !== "ADMIN") {
        return NextResponse.redirect(new URL(ESCRITORIO_PATH, nextUrl));
      }
    }
    // Solo EDITOR y ADMIN pueden acceder a /escritorio/proyecto/[projectId] (trabajar en proyecto)
    if (pathname.startsWith(ESCRITORIO_PATH + "/proyecto/")) {
      if (role !== "EDITOR" && role !== "ADMIN") {
        return NextResponse.redirect(new URL(ESCRITORIO_PATH, nextUrl));
      }
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
