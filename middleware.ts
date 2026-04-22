import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/vendor/dashboard", "/profile"];

// Routes that require specific roles
const ROLE_ROUTES: Record<string, string[]> = {
  "/vendor/dashboard": ["vendor"],
  "/admin": ["admin"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  // Get the NextAuth session token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access check
  const requiredRoles = Object.entries(ROLE_ROUTES).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];

  if (requiredRoles && !requiredRoles.includes(token.role as string)) {
    // Redirect to their appropriate dashboard if role doesn't match
    const fallback =
      token.role === "vendor" ? "/vendor/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/profile/:path*",
  ],
};
