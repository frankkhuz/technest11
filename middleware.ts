import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/app/lib/auth";

const AUTH_ONLY_ROUTES = ["/auth/login", "/auth/register"];

const PROTECTED: { pattern: RegExp; userTypes: string[] }[] = [
  { pattern: /^\/dashboard(\/|$)/, userTypes: ["user"] },
  { pattern: /^\/vendor(\/|$)/, userTypes: ["vendor"] },
];

type JwtPayload = {
  id?: string;
  userType?: string;
  exp?: number;
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false;
  return Date.now() / 1000 > payload.exp;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // httpOnly cookies ARE readable server-side via req.cookies — only client-side
  // document.cookie is blocked. Middleware runs server-side, so this works.
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const payload = token ? decodeJwt(token) : null;
  const isLoggedIn = !!payload && !isExpired(payload);
  const userType = payload?.userType ?? null;

  if (isLoggedIn && AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    const dest = userType === "vendor" ? "/dashboard" : "/";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  for (const { pattern, userTypes } of PROTECTED) {
    if (pattern.test(pathname)) {
      if (!isLoggedIn) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (userType && !userTypes.includes(userType)) {
        const dest = userType === "vendor" ? "/dashboard" : "/";
        return NextResponse.redirect(new URL(dest, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
