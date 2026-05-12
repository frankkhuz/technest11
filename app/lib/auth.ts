// app/lib/auth.ts

export const BACKEND_URL = "https://technestbackend-gue0.onrender.com";
export const TOKEN_KEY = "tn_token";
export const USER_KEY = "tn_user";
export const COOKIE_NAME = "tn_token";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: "buyer" | "seller" | "vendor";
  vendorStatus?: "pending" | "approved";
};

/** Save token to localStorage + cookie so middleware can read it. */
export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${
    60 * 60 * 24 * 7
  }; SameSite=Lax`;
}

/** Save the user object (name, email, role, etc.) returned by the API. */
export function saveUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Read the stored user object. */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/** Read token from localStorage. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Check if token is expired (JWT exp claim). */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (!payload.exp) return false;
    return Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

/** Remove everything from both stores. */
export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

/** Redirect target based on role. */
export function dashboardPath(role?: AuthUser["role"]): string {
  if (role === "seller") return "/seller/dashboard";
  if (role === "vendor") return "/vendor/dashboard";
  return "/dashboard";
}
