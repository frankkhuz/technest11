"use client";
// app/context/AuthContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  AuthUser,
  clearAuth,
  getToken,
  getStoredUser,
  isTokenExpired,
  saveToken,
  saveUser,
} from "@/app/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  /** Call after login — pass the raw JWT + the user object from the API response. */
  setAuth: (token: string, user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const token = getToken();
    // If token is missing or expired, treat as logged out
    if (token && !isTokenExpired(token)) {
      const stored = getStoredUser();
      setTimeout(() => setUser(stored), 0);
    } else if (token) {
      // Token expired — clean up silently
      clearAuth();
    }
    setTimeout(() => setIsLoading(false), 0);
  }, []);

  /** Called right after a successful login or register. */
  const setAuth = useCallback((token: string, userData: AuthUser) => {
    saveToken(token);
    saveUser(userData);
    setUser(userData);
  }, []);

  const signOut = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, setAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
