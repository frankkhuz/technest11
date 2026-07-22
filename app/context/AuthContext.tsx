"use client";
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
  setAuth: (userData: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const setAuth = useCallback((userData: AuthUser) => {
    saveUser(userData);
    setUser(userData);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // no-op
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