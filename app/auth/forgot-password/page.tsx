"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/app/lib/axios";
import Navbar from "@/app/component/layout/Navbar";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { EMAIL_REGEX, isValidEmail } from "@/app/lib/validation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Enter your email address");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/auth/forgot-password", { email });
      // Show the same confirmation regardless of whether the email is
      // registered — don't let this form reveal which emails have accounts.
      setSent(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status !== 404) {
        setError(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else {
        // Treat "not found" the same as success for the reason above.
        setSent(true);
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
            {sent ? (
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: "rgba(22,163,74,0.1)",
                    color: "#16a34a",
                  }}
                >
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h1
                  className="text-xl font-bold mb-2"
                  style={{
                    color: "var(--ink)",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  Check your email
                </h1>
                <p
                  className="text-sm mb-6 leading-relaxed"
                  style={{ color: "var(--ink-soft)" }}
                >
                  If an account exists for <strong>{email}</strong>, we&apos;ve
                  sent a link to reset your password. It expires in 1 hour.
                </p>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#020044", cursor: "pointer" }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "var(--border)", color: "var(--ink)" }}
                  >
                    <Mail className="w-6 h-6" />
                  </div>

                  <h1
                    className="text-2xl font-bold mb-1"
                    style={{
                      color: "var(--ink)",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
                    Forgot password?
                  </h1>

                  <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                    Enter your email and we&apos;ll send you a link to reset it
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className="text-sm font-medium block mb-1.5"
                      style={{ color: "var(--ink)" }}
                    >
                      Email
                    </label>
                    <input
                      className={inp}
                      style={inpS}
                      type="email"
                      placeholder="john@email.com"
                      required
                      pattern={EMAIL_REGEX.source}
                      title="Enter a valid email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
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
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
                    style={{ background: "#020044", cursor: "pointer" }}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>

                <button
                  onClick={() => router.push("/auth/login")}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: "var(--accent)", cursor: "pointer" }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
