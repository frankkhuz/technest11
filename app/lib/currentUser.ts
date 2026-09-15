import { NextRequest } from "next/server";

export type CurrentUser = {
  id: string;
  name?: string;
  email?: string;
  userType?: "user" | "vendor";
};

/**
 * Resolves the logged-in user for a local API route by forwarding the
 * request's session cookie to the external backend's existing /api/me
 * endpoint (the same one AuthContext calls from the browser). Returns null
 * for guests, a misconfigured BACKEND_URL, or any backend error — callers
 * should treat that as "not logged in" rather than a hard failure.
 */
export async function getCurrentUser(
  req: NextRequest
): Promise<CurrentUser | null> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl || !/^https?:\/\//.test(backendUrl)) return null;

  const cookie = req.headers.get("cookie");
  if (!cookie) return null;

  try {
    const res = await fetch(`${backendUrl}/api/me`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const body = await res.json();
    const user = body?.data?.user ?? body?.data ?? null;
    const id = user?.id ?? user?._id;
    if (!id) return null;

    return {
      id: String(id),
      name: user.name,
      email: user.email,
      userType: user.userType,
    };
  } catch {
    return null;
  }
}
