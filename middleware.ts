import { getToken, JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

interface CustomToken extends JWT {
  role?: string;
}

export async function middleware(req: NextRequest) {
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as CustomToken | null;

  const { pathname } = req.nextUrl;

  // 🔒 1. Protect dashboard & vendor routes (must be logged in)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/vendor")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // 🏪 2. Restrict vendor routes to ONLY vendors
  if (pathname.startsWith("/vendor")) {
    if (token?.role !== "vendor") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 🔁 3. Prevent logged-in users from seeing login/register
  if (token && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(
      new URL(
        token.role === "vendor" ? "/dashboard/vendor" : "/dashboard",
        req.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/vendor/:path*",
    "/dashboard/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
