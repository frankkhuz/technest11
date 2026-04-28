"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

type Role = "buyer" | "seller";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role | "">(
    (searchParams.get("role") as Role) || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      setError("Please select whether you are a buyer or seller");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/register", { ...form, role });
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
  const inpS = { borderColor: "rgba(2,0,68,0.2)", color: "#020044" };
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
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Tech<span style={{ color: "#EF3F23" }}>Nest</span>
        </button>
        <button
          onClick={() => router.push("/auth/login")}
          className="text-sm"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Sign In
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div
            className="bg-white rounded-2xl p-8 border"
            style={{ border: "1px solid rgba(2,0,68,0.08)" }}
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

              <div>
                {lbl("Password *")}
                <input
                  className={inp}
                  style={inpS}
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </div>

              <div>
                {lbl("Confirm Password *")}
                <input
                  className={inp}
                  style={inpS}
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                />
              </div>

              {/* Role dropdown — inline, no separate step */}
              <div>
                {lbl("I am a... *")}
                <select
                  className={inp}
                  style={{
                    ...inpS,
                    cursor: "pointer",
                    borderColor: role ? "#020044" : "rgba(2,0,68,0.2)",
                  }}
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="">Select your account type</option>
                  <option value="buyer">
                    🛒 Buyer — Browse and purchase gadgets
                  </option>
                  <option value="seller">
                    🏪 Seller — List and sell gadgets
                  </option>
                </select>

                {role === "buyer" && (
                  <div
                    className="mt-2 rounded-xl px-3 py-2.5 flex items-center gap-2"
                    style={{
                      background: "rgba(2,0,68,0.03)",
                      border: "1px solid rgba(2,0,68,0.08)",
                    }}
                  >
                    <span>🛒</span>
                    <p className="text-xs" style={{ color: "#6B6B8A" }}>
                      Browse listings, place orders and swap devices
                    </p>
                  </div>
                )}
                {role === "seller" && (
                  <div
                    className="mt-2 rounded-xl px-3 py-2.5 flex items-center gap-2"
                    style={{
                      background: "rgba(2,0,68,0.03)",
                      border: "1px solid rgba(2,0,68,0.08)",
                    }}
                  >
                    <span>🏪</span>
                    <p className="text-xs" style={{ color: "#6B6B8A" }}>
                      List gadgets, receive offers and track your sales
                    </p>
                  </div>
                )}
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
                onClick={handleSubmit}
                disabled={loading}
                style={{ background: "#020044" }}
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
                style={{ color: "#EF3F23" }}
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
