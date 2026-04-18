import { getToken, JWT } from "next-auth/jwt";

interface CustomToken extends JWT {
  role?: string;
}
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  if ((token as CustomToken).role !== "vendor")
    if (pathname.startsWith("/vendor")) {
      if (!token) return NextResponse.redirect(new URL("/auth/login", req.url));
      if ((token as CustomToken).role !== "vendor")
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

  // if (pathname.startsWith("/dashboard")) {
  //   if (!token) return NextResponse.redirect(new URL("/auth/login", req.url));
  // }

  if (token && (pathname === "/auth/login" || pathname === "/auth/register")) {
    const role = (token as JWT).role;
    return NextResponse.redirect(
      new URL(role === "vendor" ? "/vendor/dashboard" : "/dashboard", req.url)
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
