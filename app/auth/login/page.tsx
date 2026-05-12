"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { BACKEND_URL, dashboardPath } from "@/app/lib/auth";
import { useAuth } from "@/app/hooks/useAuth";

type Role = "buyer" | "seller";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const from = searchParams.get("from"); // redirect back after login

  const { setAuth } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleLogin = async () => {
    if (!identifier) {
      setError("Please enter your email or phone");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: identifier,
        password,
      });

      if (data.token && data.user) {
        setAuth(data.token, data.user);
      }

      const dest = from || dashboardPath(data.user?.role);
      router.push(dest);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Invalid email/phone or password."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white";
  const inpS = { borderColor: "rgba(2,0,68,0.2)", color: "#020044" };
  const lbl = (t: string) => (
    <label
      className="text-sm font-medium block mb-1.5"
      style={{ color: "#020044" }}
    >
      {t}
    </label>
  );

  const roles = [
    {
      key: "buyer" as const,
      icon: "🛒",
      label: "Register as a Buyer",
      desc: "Browse, purchase & track your orders",
      bg: "rgba(2,0,68,0.07)",
    },
    {
      key: "seller" as const,
      icon: "🏪",
      label: "Register as a Seller",
      desc: "List products, manage sales & grow your business",
      bg: "rgba(239,63,35,0.08)",
    },
  ];

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
                className="rounded-xl p-3 mb-5 text-sm flex items-center gap-2"
                style={{
                  background: "rgba(22,163,74,0.08)",
                  color: "#16a34a",
                  border: "1px solid rgba(22,163,74,0.2)",
                }}
              >
                <span>✓</span> Account created successfully! Sign in below.
              </div>
            )}

            <div className="space-y-4">
              <div>
                {lbl("Email or Phone Number")}
                <input
                  className={inp}
                  style={inpS}
                  placeholder="john@email.com or 08012345678"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              <div>
                {lbl("Password")}
                <input
                  className={inp}
                  style={inpS}
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              {error && (
                <p
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(239,63,35,0.06)",
                    color: "#EF3F23",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
                style={{ background: "#020044" }}
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </div>

            <div className="flex items-center gap-3 my-5">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(2,0,68,0.08)" }}
              />
              <span className="text-xs" style={{ color: "#6B6B8A" }}>
                or
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(2,0,68,0.08)" }}
              />
            </div>

            <div
              className="rounded-2xl border overflow-hidden mb-4"
              style={{ border: "1px solid rgba(2,0,68,0.12)" }}
            >
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
                style={{ background: "rgba(2,0,68,0.03)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "rgba(239,63,35,0.10)" }}
                  >
                    👤
                  </div>
                  <div className="text-left">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#020044" }}
                    >
                      {selectedRole === "buyer"
                        ? "Register as a Buyer"
                        : selectedRole === "seller"
                        ? "Register as a Seller"
                        : "Register as a Buyer or Seller"}
                    </p>
                    <p className="text-xs" style={{ color: "#6B6B8A" }}>
                      {selectedRole === "buyer"
                        ? "Browse, purchase & track your orders"
                        : selectedRole === "seller"
                        ? "List products & manage your sales"
                        : "Choose your account type to get started"}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    color: "#020044",
                    display: "inline-block",
                    transform: roleOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.25s",
                  }}
                >
                  ▾
                </span>
              </button>

              {roleOpen &&
                roles.map((opt) => (
                  <div key={opt.key}>
                    <div
                      style={{ height: 1, background: "rgba(2,0,68,0.08)" }}
                    />
                    <button
                      onClick={() => {
                        setSelectedRole(opt.key);
                        setRoleOpen(false);
                        router.push(`/auth/register?role=${opt.key}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
                      style={{
                        background:
                          selectedRole === opt.key
                            ? "rgba(239,63,35,0.05)"
                            : "white",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: opt.bg }}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "#020044" }}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
                          {opt.desc}
                        </p>
                      </div>
                      {selectedRole === opt.key && (
                        <span className="ml-auto" style={{ color: "#EF3F23" }}>
                          ✓
                        </span>
                      )}
                    </button>
                  </div>
                ))}
            </div>

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
