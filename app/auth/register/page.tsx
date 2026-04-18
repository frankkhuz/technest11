"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

type Role = "user" | "vendor";
type Step = 1 | 2 | 3;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as Role) || "";
  const [role, setRole] = useState<Role | "">(defaultRole);
  const [step, setStep] = useState<Step>(defaultRole ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    nin: "",
    address: "",
  });
  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
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
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors";
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

            {/* Progress */}
            <div className="flex gap-1.5 mb-6">
              {[1, 2, ...(role === "vendor" ? [3] : [])].map((s) => (
                <div
                  key={s}
                  className="flex-1 h-1 rounded-full transition-all"
                  style={{
                    background: step >= s ? "#020044" : "rgba(2,0,68,0.1)",
                  }}
                />
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                {lbl("I want to...")}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      val: "user" as Role,
                      icon: "📱",
                      title: "Buy & Sell",
                      desc: "Value, sell or buy gadgets",
                    },
                    {
                      val: "vendor" as Role,
                      icon: "🏪",
                      title: "I'm a Vendor",
                      desc: "Buy leads, swaps, inventory",
                    },
                  ].map(({ val, icon, title, desc }) => (
                    <button
                      key={val}
                      onClick={() => setRole(val)}
                      className="flex flex-col items-center gap-2 py-5 px-3 rounded-xl border-2 text-center transition-all"
                      style={{
                        borderColor:
                          role === val ? "#020044" : "rgba(2,0,68,0.12)",
                        background: role === val ? "rgba(2,0,68,0.04)" : "#fff",
                      }}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#020044" }}
                      >
                        {title}
                      </span>
                      <span className="text-xs" style={{ color: "#6B6B8A" }}>
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
                {role === "vendor" && (
                  <div
                    className="rounded-xl p-4 space-y-1.5"
                    style={{
                      background: "rgba(2,0,68,0.03)",
                      border: "1px solid rgba(2,0,68,0.08)",
                    }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#020044" }}
                    >
                      Vendor benefits
                    </p>
                    {[
                      "Buy leads from sellers",
                      "See all swap requests",
                      "Inventory & profit tracker",
                      "Verified vendor badge",
                      "Real-time notifications",
                    ].map((b) => (
                      <p
                        key={b}
                        className="text-xs flex items-center gap-1.5"
                        style={{ color: "#6B6B8A" }}
                      >
                        <span style={{ color: "#774499" }}>✓</span> {b}
                      </p>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => role && setStep(2)}
                  disabled={!role}
                  style={{ background: "#020044" }}
                  className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
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
                </div>
                <p className="text-xs -mt-2" style={{ color: "#6B6B8A" }}>
                  Enter at least email or phone
                </p>
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
                {error && (
                  <p className="text-xs" style={{ color: "#EF3F23" }}>
                    {error}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border font-semibold py-3 rounded-xl text-sm"
                    style={{
                      borderColor: "rgba(2,0,68,0.2)",
                      color: "#020044",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      if (!form.name || !form.password) {
                        setError("Name and password required");
                        return;
                      }
                      if (form.password !== form.confirmPassword) {
                        setError("Passwords do not match");
                        return;
                      }
                      setError("");
                      role === "vendor" ? setStep(3) : handleSubmit();
                    }}
                    disabled={loading}
                    style={{ background: "#020044" }}
                    className="flex-1 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  >
                    {role === "vendor"
                      ? "Next →"
                      : loading
                      ? "Creating..."
                      : "Create Account"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 Vendor KYC */}
            {step === 3 && role === "vendor" && (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-3 text-xs"
                  style={{
                    background: "rgba(239,63,35,0.06)",
                    color: "#EF3F23",
                    border: "1px solid rgba(239,63,35,0.2)",
                  }}
                >
                  Your account will be reviewed within 24 hours before you can
                  make offers.
                </div>
                <div>
                  {lbl("Business Name *")}
                  <input
                    className={inp}
                    style={inpS}
                    placeholder="e.g. Frank Gadgets Store"
                    value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                  />
                </div>
                <div>
                  {lbl("NIN *")}
                  <input
                    className={inp}
                    style={inpS}
                    placeholder="11-digit National ID"
                    maxLength={11}
                    value={form.nin}
                    onChange={(e) =>
                      update(
                        "nin",
                        e.target.value.replace(/\D/g, "").slice(0, 11)
                      )
                    }
                  />
                </div>
                <div>
                  {lbl("Business Address *")}
                  <textarea
                    rows={2}
                    className={`${inp} resize-none`}
                    style={inpS}
                    placeholder="Full address including state and LGA"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </div>
                <div>
                  {lbl("Business Phone *")}
                  <input
                    className={inp}
                    style={inpS}
                    type="tel"
                    placeholder="08012345678"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
                {error && (
                  <p className="text-xs" style={{ color: "#EF3F23" }}>
                    {error}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border font-semibold py-3 rounded-xl text-sm"
                    style={{
                      borderColor: "rgba(2,0,68,0.2)",
                      color: "#020044",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ background: "#020044" }}
                    className="flex-1 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                  >
                    {loading ? "Submitting..." : "Submit for Review"}
                  </button>
                </div>
              </div>
            )}

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
