"use client";
// app/hooks/useRequireAuth.ts
// Usage: call at the top of any page that requires login.
// Redirects to /auth/login?redirect=<currentPath> if not authenticated.

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  return { user, isLoading };
}
