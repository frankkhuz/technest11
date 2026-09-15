"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { api } from "@/app/lib/axios";
import Navbar from "@/app/component/layout/Navbar";
import { Eye, EyeOff, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  PASSWORD_REGEX,
  PASSWORD_TITLE,
  isValidPassword,
} from "@/app/lib/validation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("Fill in both password fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isValidPassword(password)) {
      setError(
        "Password must be at least 8 characters and include an uppercase letter, a number, and a symbol"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/auth/reset-password", { token, password });
      setDone(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "This link may have expired. Request a new one."
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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#18131A" }}
    >
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div
            className="bg-white rounded-2xl p-8 border"
            style={{ border: "1px solid rgba(2,0,68,0.08)" }}
          >
            {!token ? (
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: "rgba(220,38,38,0.1)",
                    color: "#DC2626",
                  }}
                >
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h1
                  className="text-xl font-bold mb-2"
                  style={{
                    color: "#020044",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  Invalid reset link
                </h1>
                <p
                  className="text-sm mb-6 leading-relaxed"
                  style={{ color: "#6B6B8A" }}
                >
                  This link is missing or malformed. Request a new one from
                  the sign-in page.
                </p>
                <button
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#020044", cursor: "pointer" }}
                >
                  Request New Link
                </button>
              </div>
            ) : done ? (
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
                    color: "#020044",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  Password reset
                </h1>
                <p
                  className="text-sm mb-6 leading-relaxed"
                  style={{ color: "#6B6B8A" }}
                >
                  Your password has been updated. Sign in with your new
                  password.
                </p>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#020044", cursor: "pointer" }}
                >
                  Sign In
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(2,0,68,0.06)", color: "#020044" }}
                  >
                    <Lock className="w-6 h-6" />
                  </div>

                  <h1
                    className="text-2xl font-bold mb-1"
                    style={{
                      color: "#020044",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
                    Set a new password
                  </h1>

                  <p className="text-sm" style={{ color: "#6B6B8A" }}>
                    Choose a strong password for your account
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className="text-sm font-medium block mb-1.5"
                      style={{ color: "#020044" }}
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        className={`${inp} pr-12`}
                        style={inpS}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        required
                        pattern={PASSWORD_REGEX.source}
                        title={PASSWORD_TITLE}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        style={{ color: "#020044" }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#6B6B8A" }}>
                      One uppercase letter, one number, one symbol
                    </p>
                  </div>

                  <div>
                    <label
                      className="text-sm font-medium block mb-1.5"
                      style={{ color: "#020044" }}
                    >
                      Confirm Password
                    </label>
                    <input
                      className={inp}
                      style={inpS}
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "#18131A" }} className="min-h-screen" />
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
