"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type Role = "seller" | "vendor";
type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | "">("");
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // vendor only
    businessName: "",
    nin: "",
    address: "",
  });

  const update = (field: string, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!form.email && !form.phone) {
      setError("Please enter an email or phone number");
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

  const inputClass =
    "w-full bg-[#1a1a26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6c47ff] transition-colors placeholder-[#7070a0]";
  const labelClass = "text-sm text-[#7070a0] mb-1.5 block";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#6c47ff]/8 blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-extrabold"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          <span className="text-[#6c47ff]">Tech</span>
          <span className="text-white">Nest</span>
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1
              className="font-extrabold text-3xl mb-2"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Create Account
            </h1>
            <p className="text-[#7070a0] text-sm">
              Join the TechNest marketplace
            </p>
          </div>

          <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-5">
            {/* STEP 1 — Choose role */}
            {step === 1 && (
              <>
                <div>
                  <label className={labelClass}>I want to...</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setRole("seller")}
                      className={`flex-1 flex flex-col items-center gap-2 py-5 rounded-xl border transition-all ${
                        role === "seller"
                          ? "border-[#6c47ff] bg-[#6c47ff]/15"
                          : "border-white/8 bg-[#1a1a26] hover:border-[#6c47ff]/50"
                      }`}
                    >
                      <span className="text-3xl">📱</span>
                      <span
                        className="text-sm font-bold text-white"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        Sell My Device
                      </span>
                      <span className="text-xs text-[#7070a0] text-center px-2">
                        Value and sell my gadget
                      </span>
                    </button>
                    <button
                      onClick={() => setRole("vendor")}
                      className={`flex-1 flex flex-col items-center gap-2 py-5 rounded-xl border transition-all ${
                        role === "vendor"
                          ? "border-[#6c47ff] bg-[#6c47ff]/15"
                          : "border-white/8 bg-[#1a1a26] hover:border-[#6c47ff]/50"
                      }`}
                    >
                      <span className="text-3xl">🏪</span>
                      <span
                        className="text-sm font-bold text-white"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        I&apos;m a Vendor
                      </span>
                      <span className="text-xs text-[#7070a0] text-center px-2">
                        Buy, resell and manage inventory
                      </span>
                    </button>
                  </div>
                </div>

                {role === "vendor" && (
                  <div className="bg-[#6c47ff]/10 border border-[#6c47ff]/25 rounded-xl p-4 space-y-1">
                    <p className="text-sm font-bold text-white">
                      Vendor benefits:
                    </p>
                    {[
                      "📥 Get buy leads from sellers",
                      "📊 Price intelligence dashboard",
                      "📦 Inventory & profit tracker",
                      "✅ Verified vendor badge",
                      "🔔 Real-time alerts on deals",
                      "📈 Analytics & market trends",
                    ].map((b) => (
                      <p key={b} className="text-xs text-[#7070a0]">
                        {b}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => role && setStep(2)}
                  disabled={!role}
                  className="w-full bg-gradient-to-r from-[#6c47ff] to-purple-500 text-white font-bold py-3.5 rounded-xl hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Continue →
                </button>
              </>
            )}

            {/* STEP 2 — Basic info */}
            {step === 2 && (
              <>
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    className={inputClass}
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="john@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    className={inputClass}
                    type="tel"
                    placeholder="08012345678"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
                <p className="text-xs text-[#7070a0] -mt-3">
                  Enter at least one of email or phone
                </p>
                <div>
                  <label className={labelClass}>Password *</label>
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm Password *</label>
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-white/10 text-[#7070a0] font-bold py-3 rounded-xl hover:border-[#6c47ff] hover:text-white transition-all text-sm"
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
                    className="flex-1 bg-gradient-to-r from-[#6c47ff] to-purple-500 text-white font-bold py-3 rounded-xl hover:opacity-85 transition-opacity text-sm"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {role === "vendor"
                      ? "Next →"
                      : loading
                      ? "Creating..."
                      : "Create Account"}
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 — Vendor KYC */}
            {step === 3 && role === "vendor" && (
              <>
                <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-3">
                  <p className="text-xs text-yellow-400">
                    ⚠️ Your account will be reviewed within 24 hours.
                    You&apos;ll be notified once approved.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Business Name *</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Frank Gadgets Store"
                    value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    NIN (National ID Number) *
                  </label>
                  <input
                    className={inputClass}
                    placeholder="11-digit NIN"
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
                  <label className={labelClass}>Business Address *</label>
                  <textarea
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder="Full address including state and LGA"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Business Phone *</label>
                  <input
                    className={inputClass}
                    type="tel"
                    placeholder="08012345678"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-white/10 text-[#7070a0] font-bold py-3 rounded-xl hover:border-[#6c47ff] hover:text-white transition-all text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#6c47ff] to-purple-500 text-white font-bold py-3 rounded-xl hover:opacity-85 transition-opacity text-sm"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {loading ? "Submitting..." : "Submit for Review"}
                  </button>
                </div>
              </>
            )}

            {error && step !== 3 && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            <p className="text-center text-xs text-[#7070a0]">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-[#6c47ff] hover:underline"
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
