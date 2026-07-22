"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

export default function TestPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.userType !== "vendor") {
      router.push("/dashboard");
      return;
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8F8FC" }}
      >
        <p style={{ color: "#6B6B8A" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F8F8FC" }}
    >
      <div
        className="bg-white rounded-2xl p-8 border max-w-md w-full text-center"
        style={{ border: "1px solid rgba(2,0,68,0.08)" }}
      >
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "#020044", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Test Page
        </h1>
        <p className="text-sm mb-4" style={{ color: "#6B6B8A" }}>
          Logged in as <strong>{user?.name}</strong> ({user?.email})
        </p>
        <p className="text-xs" style={{ color: "#6B6B8A" }}>
          userType: <code>{user?.userType}</code>
        </p>
      </div>
    </div>
  );
}