"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, msg: "", severity: "info" });

  const show = (msg: string, severity: typeof snack.severity) =>
    setSnack({ open: true, msg, severity });

  const handleLogin = async () => {
    if (!identifier) {
      show("Please enter your email or phone", "warning");
      return;
    }
    if (!password) {
      show("Please enter your password", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });
      if (res?.error) {
        show("Invalid email/phone or password. Please try again.", "error");
        setLoading(false);
        return;
      }
      show("Login successful! Redirecting...", "success");
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      setTimeout(() => {
        router.push(
          session?.user?.role === "vendor" ? "/vendor/dashboard" : "/dashboard"
        );
      }, 1000);
    } catch {
      show("Something went wrong. Please try again.", "error");
      setLoading(false);
    }
  };

  const inp =
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all";
  const inpS = { borderColor: "rgba(2,0,68,0.2)", color: "#020044" };

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
            {/* Header */}
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

            {/* Registered success banner */}
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
                <label
                  className="text-sm font-medium block mb-1.5"
                  style={{ color: "#020044" }}
                >
                  Email or Phone Number
                </label>
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
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "#020044" }}
                  >
                    Password
                  </label>
                </div>
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

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
                style={{ background: "#020044", color: "#fff" }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                    Signing in...
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>
            </div>

            {/* Divider */}
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

            {/* Quick demo for vendors */}
            <div
              className="rounded-xl p-3 mb-4"
              style={{
                background: "rgba(119,68,153,0.06)",
                border: "1px solid rgba(119,68,153,0.15)",
              }}
            >
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "#774499" }}
              >
                Are you a vendor?
              </p>
              <p className="text-xs" style={{ color: "#6B6B8A" }}>
                Register as a vendor to access buy leads, swap requests, and
                inventory management.
              </p>
              <button
                onClick={() => router.push("/auth/register?role=vendor")}
                className="text-xs font-semibold mt-2"
                style={{ color: "#774499" }}
              >
                Register as Vendor →
              </button>
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

      {/* MUI Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
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
