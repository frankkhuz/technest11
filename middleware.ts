import { NextResponse } from "next/server";

// Auth gating moved client-side. The accessToken cookie is set by the
// backend on a different domain (technestbackend-gue0.onrender.com) than
// the frontend (localhost:3000 / your deployed domain) — cookies are
// domain-scoped, so middleware running on the frontend's own server can
// never see it. Real protection now lives in each protected page's
// useAuth() guard, which calls GET /api/me directly against the backend
// (a same-domain-as-cookie request, so it works correctly).

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
