"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";

export default function UserDashboard() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  const userName: string | undefined = user?.name;
  const isAuthenticated = !!user;

  // ── THE FIX ──────────────────────────────────────────────────────────────
  // 1. Wait for isLoading to become false before deciding anything — while
  //    it's true, AuthContext is still verifying the httpOnly cookie via
  //    GET /api/me, so `user` may briefly be null even for a logged-in
  //    person. Redirecting during this window is what was kicking you back
  //    to /auth/login right after a successful login.
  // 2. Depend on [isLoading, isAuthenticated, user?.userType, router] so the
  //    effect re-runs the instant the real auth state resolves, instead of
  //    running once with a stale/empty value and never re-checking.
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login?from=/dashboard");
      return;
    }

    // Vendors and admins have their own dashboards — send them there
    // instead of showing them the plain user dashboard.
    if (user?.userType === "vendor") {
      router.push("/vendor");
      return;
    }
    if (user?.userType === "admin") {
      router.push("/admin");
      return;
    }
    // user?.userType === "user" (or undefined/legacy accounts) → stay here
  }, [isLoading, isAuthenticated, user?.userType, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8F8FC" }}
      >
        <p style={{ color: "#6B6B8A" }}>Loading...</p>
      </div>
    );
  }

  // Don't flash user-dashboard content while the redirect above is in
  // flight for vendors/admins.
  if (user?.userType === "vendor" || user?.userType === "admin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8F8FC" }}
      >
        <p style={{ color: "#6B6B8A" }}>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
      {/* ────────────────────────────────────────────────────────────────
          👇 REPLACE EVERYTHING BELOW THIS LINE with your actual dashboard
          UI (whatever your real app/dashboard/page.tsx currently renders —
          order history, browsing, profile, etc). The guard logic above is
          the only part that needed fixing; keep your existing layout/markup
          and just drop it in here using `userName` / `user` / `signOut`
          from useAuth() as before.
         ──────────────────────────────────────────────────────────────── */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ background: "#fff", borderColor: "rgba(2,0,68,0.08)" }}
      >
        <h1
          className="font-bold text-lg"
          style={{ color: "#020044", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Welcome, {userName}
        </h1>
        <button
          onClick={() => signOut()}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ color: "#6B6B8A" }}
        >
          Sign out
        </button>
      </div>

      <div className="p-6">
        <p style={{ color: "#6B6B8A" }}>Your dashboard content goes here.</p>
      </div>
    </div>
  );
}
