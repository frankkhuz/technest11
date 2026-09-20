import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, dashboardPath } from "@/app/lib/auth";

const AUTH_ONLY_ROUTES = ["/auth/login", "/auth/register"];


const PROTECTED: {
  pattern: RegExp;
  userTypes: string[];
  requireVerifiedVendor?: boolean;
}[] = [
  { pattern: /^\/dashboard(\/|$)/, userTypes: ["vendor"], requireVerifiedVendor: true },
  { pattern: /^\/vendor(\/|$)/, userTypes: ["vendor"], requireVerifiedVendor: true },
  { pattern: /^\/become-vendor(\/|$)/, userTypes: [] },
];

type JwtPayload = {
  id?: string;
  userType?: string;
  vendorVerified?: boolean;
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

  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const payload = token ? decodeJwt(token) : null;
  const isLoggedIn = !!payload && !isExpired(payload);
  const userType = payload?.userType ?? null;

  if (isLoggedIn && AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(dashboardPath(userType === "vendor" ? "vendor" : "user"), req.url));
  }

  for (const { pattern, userTypes, requireVerifiedVendor } of PROTECTED) {
    if (pattern.test(pathname)) {
      if (!isLoggedIn) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (userTypes.length > 0 && userType && !userTypes.includes(userType)) {
        return NextResponse.redirect(new URL(dashboardPath(userType === "vendor" ? "vendor" : "user"), req.url));
      }

      if (
        requireVerifiedVendor &&
        userType === "vendor" &&
        !payload?.vendorVerified
      ) {
        // Don't force them onto the completion form — let them browse the
        // site normally; the VendorVerificationReminder popup (mounted
        // globally in layout.tsx) is what nudges them to finish up.
        return NextResponse.redirect(new URL("/?completeVendor=1", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
