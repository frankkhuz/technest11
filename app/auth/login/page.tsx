"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { api } from "@/app/lib/axios";
import { dashboardPath } from "@/app/lib/auth";
import { useAuth } from "@/app/hooks/useAuth";
import Navbar from "@/app/component/layout/Navbar";
import {
  Eye,
  EyeOff,
  ShoppingCart,
  Store,
  Lock,
  CheckCircle2,
  Check,
  User,
  ChevronDown,
} from "lucide-react";

type Role = "user" | "vendor";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const from = searchParams.get("from");

  const { setAuth } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const { data } = await api.post("/api/auth/login", {
        email: identifier,
        password,
      });

      // Confirmed shape: { success, message, data: { csrfToken, user } }
      const user = data.data?.user;

      if (user) {
        setAuth(user);
      }

      const dest = from || dashboardPath(user?.userType);
      router.push(dest);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
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
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors";

  const inpS = {
    borderColor: "var(--border)",
    color: "var(--ink)",
    background: "var(--surface)",
  };

  const lbl = (t: string) => (
    <label
      className="text-sm font-medium block mb-1.5"
      style={{ color: "var(--ink)" }}
    >
      {t}
    </label>
  );

  const roles = [
    {
      key: "user" as const,
      Icon: ShoppingCart,
      label: "Register as a User",
      desc: "Browse, purchase & track your orders",
      bg: "rgba(2,0,68,0.07)",
    },
    {
      key: "vendor" as const,
      Icon: Store,
      label: "Register as a Vendor",
      desc: "List products, manage sales & grow your business",
      bg: "rgba(220,38,38,0.08)",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8 border"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--border)", color: "var(--ink)" }}
              >
                <Lock className="w-6 h-6" />
              </div>

              <h1
                className="text-2xl font-bold mb-1"
                style={{
                  color: "var(--ink)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Welcome back
              </h1>

              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
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
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Account
                created successfully! Sign in below.
              </div>
            )}

            <div className="space-y-4">
              <div>
                {lbl("Email or Phone Number")}

                <input
                  className={inp}
                  style={inpS}
                  placeholder="john@email.com or 08012345678"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--ink)" }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push("/auth/forgot-password")}
                    className="text-xs font-medium"
                    style={{ color: "var(--accent)", cursor: "pointer" }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    className={`${inp} pr-12`}
                    style={inpS}
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--ink)" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(220,38,38,0.06)",
                    color: "#DC2626",
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
                style={{ background: "var(--border)" }}
              />

              <span className="text-xs" style={{ color: "var(--ink-soft)" }}>
                or
              </span>

              <div
                className="flex-1 h-px"
                style={{ background: "var(--border)" }}
              />
            </div>

            <div
              className="rounded-2xl border overflow-hidden mb-4"
              style={{ border: "1px solid var(--border)" }}
            >
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
                style={{ background: "var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    <User className="w-4 h-4" />
                  </div>

                  <div className="text-left">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--ink)" }}
                    >
                      {selectedRole === "user"
                        ? "Register as a User"
                        : selectedRole === "vendor"
                        ? "Register as a Vendor"
                        : "Register as a User or Vendor"}
                    </p>

                    <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                      {selectedRole === "user"
                        ? "Browse, purchase & track your orders"
                        : selectedRole === "vendor"
                        ? "List products & manage your sales"
                        : "Choose your account type to get started"}
                    </p>
                  </div>
                </div>

                <ChevronDown
                  className="w-4 h-4"
                  style={{
                    color: "var(--ink)",
                    transform: roleOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.25s",
                  }}
                />
              </button>

              {roleOpen &&
                roles.map((opt) => (
                  <div key={opt.key}>
                    <div
                      style={{
                        height: 1,
                        background: "var(--border)",
                      }}
                    />

                    <button
                      onClick={() => {
                        setSelectedRole(opt.key);
                        setRoleOpen(false);
                        router.push(`/auth/register?role=${opt.key}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:opacity-80"
                      style={{
                        background:
                          selectedRole === opt.key
                            ? "rgba(220,38,38,0.05)"
                            : "var(--surface)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: opt.bg, color: "var(--ink)" }}
                      >
                        <opt.Icon className="w-4 h-4" />
                      </div>

                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--ink)" }}
                        >
                          {opt.label}
                        </p>

                        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                          {opt.desc}
                        </p>
                      </div>

                      {selectedRole === opt.key && (
                        <Check
                          className="ml-auto w-4 h-4"
                          style={{ color: "var(--accent)" }}
                        />
                      )}
                    </button>
                  </div>
                ))}
            </div>

            <p className="text-center text-sm" style={{ color: "var(--ink-soft)" }}>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => router.push("/auth/register")}
                className="font-semibold"
                style={{ color: "var(--accent)" }}
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
        <div style={{ background: "var(--bg)" }} className="min-h-screen" />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
