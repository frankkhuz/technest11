"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff, ShoppingCart, Store } from "lucide-react";
import { api } from "@/app/lib/axios";
import Navbar from "@/app/component/layout/Navbar";
import { useAuth } from "@/app/hooks/useAuth";
import { dashboardPath } from "@/app/lib/auth";
import {
  NIGERIA_PHONE_REGEX,
  NIGERIA_PHONE_TITLE,
  PASSWORD_REGEX,
  PASSWORD_TITLE,
  EMAIL_REGEX,
  isValidNigerianPhone,
  isValidPassword,
  isValidEmail,
} from "@/app/lib/validation";

type Role = "user" | "vendor";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();

  const [role, setRole] = useState<Role | "">(
    (searchParams.get("role") as Role) || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.password) {
      setError("Name and password are required");
      return;
    }

    if (!form.email && !form.phone) {
      setError("Enter at least an email or phone number");
      return;
    }

    if (form.email && !isValidEmail(form.email)) {
      setError("Enter a valid email address");
      return;
    }

    if (form.phone && !isValidNigerianPhone(form.phone)) {
      setError(
        "Enter a valid Nigerian phone number, e.g. 08012345678 or +2348012345678"
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!role) {
      setError("Please select user or vendor");
      return;
    }

    if (!isValidPassword(form.password)) {
      setError(
        "Password must be at least 8 characters and include an uppercase letter, a number, and a symbol"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        userType: role,
      });

      // The backend auto-logs the account in on register (issues the same
      // session cookies login does, and returns the same user shape) — if
      // we don't push that into AuthContext here, the app stays in a stale
      // "logged out" state until a hard refresh, even though the cookies
      // are already valid. Mirror what the login page does instead of
      // sending them through a redundant login screen.
      const user = res.data?.data?.user;
      if (user) {
        setAuth(user);
        router.push(dashboardPath(user.userType, user.vendorVerified));
      } else {
        router.push("/auth/login?registered=true");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed");
      } else {
        setError("An unexpected error occurred");
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

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8 border"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="mb-6">
              <h1
                className="text-2xl font-bold mb-1"
                style={{
                  color: "var(--ink)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Create Account
              </h1>

              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                Join the TechNest marketplace
              </p>
            </div>

            <div className="space-y-4">
              <div>
                {lbl("Full Name *")}

                <input
                  className={inp}
                  style={inpS}
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>

              <div>
                {lbl("Email")}

                <input
                  className={inp}
                  style={inpS}
                  type="email"
                  placeholder="john@email.com"
                  pattern={EMAIL_REGEX.source}
                  title="Enter a valid email address"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>

              <div>
                {lbl("Phone Number")}

                <input
                  className={inp}
                  style={inpS}
                  type="tel"
                  placeholder="08012345678"
                  pattern={NIGERIA_PHONE_REGEX.source}
                  title={NIGERIA_PHONE_TITLE}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />

                <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                  Enter at least email or phone — Nigerian format, e.g.
                  08012345678
                </p>
              </div>

              <div>
                {lbl("Password *")}

                <div className="relative">
                  <input
                    className={`${inp} pr-12`}
                    style={inpS}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    required
                    pattern={PASSWORD_REGEX.source}
                    title={PASSWORD_TITLE}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{
                      color: "var(--ink-soft)",
                    }}
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <div>
                {lbl("Confirm Password *")}

                <div className="relative">
                  <input
                    className={`${inp} pr-12`}
                    style={inpS}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{
                      color: "var(--ink-soft)",
                    }}
                  >
                    {showConfirmPassword ? (
                      <Eye size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                {lbl("I am a... *")}

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      val: "user" as Role,
                      Icon: ShoppingCart,
                      title: "User",
                      desc: "Browse & buy gadgets",
                    },
                    {
                      val: "vendor" as Role,
                      Icon: Store,
                      title: "Vendor",
                      desc: "List & sell gadgets",
                    },
                  ].map(({ val, Icon, title, desc }) => (
                    <button
                      key={val}
                      onClick={() => setRole(val)}
                      className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 text-center transition-all"
                      style={{
                        borderColor:
                          role === val ? "var(--accent)" : "var(--border)",
                        background:
                          role === val ? "var(--accent-soft)" : "var(--surface)",
                        cursor: "pointer",
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: "var(--ink)" }} />

                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: "var(--ink)",
                        }}
                      >
                        {title}
                      </span>

                      <span
                        className="text-xs"
                        style={{
                          color: "var(--ink-soft)",
                        }}
                      >
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div
                  className="rounded-xl px-3 py-2.5 text-xs"
                  style={{
                    background: "rgba(220,38,38,0.06)",
                    color: "#DC2626",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: "#020044",
                  cursor: "pointer",
                }}
                className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>

            <p
              className="text-center text-sm mt-6"
              style={{ color: "var(--ink-soft)" }}
            >
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="font-semibold"
                style={{
                  color: "var(--accent)",
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "var(--bg)" }} className="min-h-screen" />
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
