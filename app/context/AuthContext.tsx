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
import { AuthUser, clearAuth, saveUser } from "@/app/lib/auth";
import { api } from "@/app/lib/axios";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  /** Call after login/register with the user object from the API response. No token param anymore — the access token is an httpOnly cookie the browser handles automatically. */
  setAuth: (userData: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ask the backend who's actually logged in, based on the httpOnly cookie.
  // This is the source of truth — localStorage alone can't tell us if the
  // cookie is still valid, so we verify with the server on every fresh load.
  useEffect(() => {
    let cancelled = false;

    api
      .get("/api/me")
      .then(({ data }) => {
        if (cancelled) return;
        const fetchedUser = data.data?.user ?? data.data;
        if (fetchedUser) {
          saveUser(fetchedUser);
          setUser(fetchedUser);
        }
      })
      .catch(() => {
        // No valid session — clear any stale local cache
        clearAuth();
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Called right after a successful login or register — avoids waiting on another /api/me round trip. */
  const setAuth = useCallback((userData: AuthUser) => {
    saveUser(userData);
    setUser(userData);
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Clears the httpOnly cookies server-side. If this route doesn't
      // exist yet on the backend, this fails silently and the cookies
      // remain valid until they expire on their own.
      await api.post("/api/auth/logout");
    } catch {
      // no-op — still proceed with local cleanup below
    }
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
