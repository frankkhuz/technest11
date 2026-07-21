
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export const USER_KEY = "tn_user";
export const ACCESS_TOKEN_COOKIE = "accessToken"; 

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  userType?: "user" | "vendor";
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
  if (userType === "vendor") return "/dashboard";
  return "/";
}
