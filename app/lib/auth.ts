export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
export const USER_KEY = "tn_user";
export const ACCESS_TOKEN_COOKIE = "accessToken"; // httpOnly, set by backend — frontend can't read it directly

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  userType?: "user" | "vendor" | "admin";
  isVerified?: boolean;
};

export function saveUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

export function dashboardPath(userType?: AuthUser["userType"]): string {
  if (userType === "vendor") return "/test";
  if (userType === "admin") return "/admin";
  return "/dashboard";
}

export function getSafeRedirect(
  from: string | null,
  userType?: AuthUser["userType"]
): string {
  if (!from) return dashboardPath(userType);

  const isVendorRoute = from.startsWith("/vendor") || from.startsWith("/test");
  const isAdminRoute = from.startsWith("/admin");
  const isUserRoute = from.startsWith("/dashboard");

  if (isVendorRoute && userType !== "vendor") return dashboardPath(userType);
  if (isAdminRoute && userType !== "admin") return dashboardPath(userType);
  if (isUserRoute && (userType === "vendor" || userType === "admin"))
    return dashboardPath(userType);

  return from;
}
