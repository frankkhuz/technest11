import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/app/lib/auth";


const AUTH_ONLY_ROUTES = ["/auth/login", "/auth/register"];

const PROTECTED: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/dashboard(\/|$)/, roles: ["buyer"] },
  { pattern: /^\/seller(\/|$)/, roles: ["seller"] },
  { pattern: /^\/vendor(\/|$)/, roles: ["vendor"] },

];


type JwtPayload = {
  id?: string;
  role?: string;
  exp?: number;
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
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

  const token = req.cookies.get(COOKIE_NAME)?.value ?? null;
  const payload = token ? decodeJwt(token) : null;
  const isLoggedIn = !!payload && !isExpired(payload);
  const role = payload?.role ?? null;

 if (isLoggedIn && AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    const dest =
      role === "seller"
        ? "/seller/dashboard"
        : role === "vendor"
        ? "/vendor/dashboard"
        : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  for (const { pattern, roles } of PROTECTED) {
    if (pattern.test(pathname)) {
      if (!isLoggedIn) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("from", pathname); 
        return NextResponse.redirect(loginUrl);
      }

      if (role && !roles.includes(role)) {
        const dest =
          role === "seller"
            ? "/seller/dashboard"
            : role === "vendor"
            ? "/vendor/dashboard"
            : "/dashboard";
        return NextResponse.redirect(new URL(dest, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
