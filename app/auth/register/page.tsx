"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

type Role = "user" | "vendor";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!role) {
      setError("Please select user or vendor");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/register", {
        ...form,
        role,
      });

      router.push("/auth/login?registered=true");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Registration failed");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white";

  const inpS = {
    borderColor: "rgba(2,0,68,0.2)",
    color: "#020044",
  };

  const lbl = (t: string) => (
    <label
      className="text-sm font-medium block mb-1.5"
      style={{ color: "#020044" }}
    >
      {t}
    </label>
  );

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
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            cursor: "pointer",
          }}
        >
          Tech
          <span style={{ color: "#EF3F23" }}>Nest</span>
        </button>

        <button
          onClick={() => router.push("/auth/login")}
          className="text-sm"
          style={{
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div
            className="bg-white rounded-2xl p-8 border"
            style={{
              border: "1px solid rgba(2,0,68,0.08)",
            }}
          >
            <div className="mb-6">
              <h1
                className="text-2xl font-bold mb-1"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Create Account
              </h1>

              <p className="text-sm" style={{ color: "#6B6B8A" }}>
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
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />

                <p className="text-xs mt-1" style={{ color: "#6B6B8A" }}>
                  Enter at least email or phone
                </p>
              </div>

              {/* PASSWORD */}
              <div>
                {lbl("Password *")}

                <div className="relative">
                  <input
                    className={`${inp} pr-12`}
                    style={inpS}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{
                      color: "#6B6B8A",
                    }}
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                {lbl("Confirm Password *")}

                <div className="relative">
                  <input
                    className={`${inp} pr-12`}
                    style={inpS}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{
                      color: "#6B6B8A",
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

              {/* ROLE SELECTOR */}
              <div>
                {lbl("I am a... *")}

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      val: "user" as Role,
                      icon: "🛒",
                      title: "User",
                      desc: "Browse & buy gadgets",
                    },
                    {
                      val: "vendor" as Role,
                      icon: "🏪",
                      title: "Vendor",
                      desc: "List & sell gadgets",
                    },
                  ].map(({ val, icon, title, desc }) => (
                    <button
                      key={val}
                      onClick={() => setRole(val)}
                      className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 text-center transition-all"
                      style={{
                        borderColor:
                          role === val ? "#020044" : "rgba(2,0,68,0.12)",
                        background: role === val ? "rgba(2,0,68,0.04)" : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <span className="text-2xl">{icon}</span>

                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: "#020044",
                        }}
                      >
                        {title}
                      </span>

                      <span
                        className="text-xs"
                        style={{
                          color: "#6B6B8A",
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
                    background: "rgba(239,63,35,0.06)",
                    color: "#EF3F23",
                    border: "1px solid rgba(239,63,35,0.2)",
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
              style={{ color: "#6B6B8A" }}
            >
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="font-semibold"
                style={{
                  color: "#EF3F23",
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
        <div style={{ background: "#F8F8FC" }} className="min-h-screen" />
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
