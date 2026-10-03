
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export const USER_KEY = "tn_user";
export const ACCESS_TOKEN_COOKIE = "accessToken"; 

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  userType?: "user" | "vendor" | "admin";
  role?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  isVerified?: boolean;
  vendorVerified?: boolean; 
};

type RoleFields = Pick<AuthUser, "userType" | "role" | "isAdmin" | "isSuperAdmin">;

export function isAdminUser(user?: Partial<RoleFields> | null): boolean {
  if (!user) return false;
  const role = user.role?.toLowerCase().replace(/[\s_-]/g, "");
  return (
    !!user.isAdmin ||
    !!user.isSuperAdmin ||
    user.userType === "admin" ||
    role === "admin" ||
    role === "superadmin"
  );
}

export function isSuperAdminUser(user?: Partial<RoleFields> | null): boolean {
  if (!user) return false;
  return !!user.isSuperAdmin || user.role?.toLowerCase().replace(/[\s_-]/g, "") === "superadmin";
}

export function safeReturnPath(path?: string | null): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (path.startsWith("/auth")) return null;
  return path;
}

export function postLoginPath(
  user: (Partial<RoleFields> & Pick<AuthUser, "vendorVerified">) | null | undefined,
  from?: string | null
): string {
  if (isAdminUser(user)) return "/admin";
  if (user?.userType === "vendor") return dashboardPath("vendor", user.vendorVerified);
  return safeReturnPath(from) ?? "/";
}

export function loginHref(returnTo?: string | null): string {
  const from = safeReturnPath(returnTo);
  return from && from !== "/" ? `/auth/login?from=${encodeURIComponent(from)}` : "/auth/login";
}

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

export function dashboardPath(
  userType?: AuthUser["userType"],
  vendorVerified?: boolean
): string {
  if (userType === "vendor") return vendorVerified ? "/dashboard" : "/";
  return "/user";
}
