"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email/phone or password");
      return;
    }
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    router.push(
      session?.user?.role === "vendor" ? "/vendor/dashboard" : "/dashboard"
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F8F8FC" }}
    >
      <nav
        style={{ background: "#020044" }}
        className="px-6 py-4 flex items-center justify-between"
      >
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold text-white"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Tech<span style={{ color: "#EF3F23" }}>Nest</span>
        </button>
        <button
          onClick={() => router.push("/auth/register")}
          className="text-sm font-semibold px-4 py-1.5 rounded-lg"
          style={{ background: "#EF3F23", color: "#fff" }}
        >
          Register
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div
            className="bg-white rounded-2xl p-8 border"
            style={{ border: "1px solid rgba(2,0,68,0.08)" }}
          >
            <div className="mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(2,0,68,0.06)" }}
              >
                <span className="text-2xl">🔐</span>
              </div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Welcome back
              </h1>
              <p className="text-sm" style={{ color: "#6B6B8A" }}>
                Sign in to your TechNest account
              </p>
            </div>

            {registered && (
              <div
                className="rounded-xl p-3 mb-5 text-sm"
                style={{
                  background: "rgba(22,163,74,0.08)",
                  color: "#16a34a",
                  border: "1px solid rgba(22,163,74,0.2)",
                }}
              >
                ✓ Account created! Sign in below.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  className="text-sm font-medium block mb-1.5"
                  style={{ color: "#020044" }}
                >
                  Email or Phone
                </label>
                <input
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
                  placeholder="john@email.com or 08012345678"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium block mb-1.5"
                  style={{ color: "#020044" }}
                >
                  Password
                </label>
                <input
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              {error && (
                <p className="text-xs" style={{ color: "#EF3F23" }}>
                  {error}
                </p>
              )}
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{ background: "#020044" }}
                className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </div>

            <div
              className="mt-6 pt-5"
              style={{ borderTop: "1px solid rgba(2,0,68,0.08)" }}
            >
              <p className="text-center text-sm" style={{ color: "#6B6B8A" }}>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => router.push("/auth/register")}
                  className="font-semibold"
                  style={{ color: "#EF3F23" }}
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "#F8F8FC" }} className="min-h-screen" />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
