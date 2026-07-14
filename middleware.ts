import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/app/lib/auth";

const AUTH_ONLY_ROUTES = ["/auth/login", "/auth/register"];

// Any route matching one of these requires *some* session cookie present.
// Which dashboard a logged-in user actually belongs on (user vs vendor vs
// admin) is decided client-side by each page's own useAuth() guard, since
// this cookie is an opaque session token (not a JWT) — middleware has no
// way to read userType out of it without calling the backend.
const PROTECTED_PATTERNS = [
  /^\/dashboard(\/|$)/,
  /^\/vendor(\/|$)/,
  /^\/admin(\/|$)/,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Presence-only check. This is NOT authentication — it's just a fast,
  // optimistic redirect to avoid flashing a protected page to a clearly
  // logged-out visitor. Real verification of who this cookie belongs to
  // (and whether it's still valid) happens via GET /api/me in AuthContext,
  // which every protected page already waits on before rendering.
  const hasSessionCookie = !!req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (
    hasSessionCookie &&
    AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    // Logged in and trying to view /auth/login or /auth/register — bounce
    // to /dashboard as a reasonable default. If they're actually a vendor
    // or admin, app/dashboard/page.tsx's own guard will redirect them
    // onward to /vendor or /admin once useAuth() resolves.
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (PROTECTED_PATTERNS.some((p) => p.test(pathname)) && !hasSessionCookie) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
