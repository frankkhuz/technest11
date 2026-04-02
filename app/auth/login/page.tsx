"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email/phone or password");
      return;
    }

    // Redirect based on role stored in session
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    if (role === "vendor") {
      router.push("/vendor/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const inputClass =
    "w-full bg-[#1a1a26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6c47ff] transition-colors placeholder-[#7070a0]";
  const labelClass = "text-sm text-[#7070a0] mb-1.5 block";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#6c47ff]/8 blur-3xl pointer-events-none" />

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
              Welcome Back
            </h1>
            <p className="text-[#7070a0] text-sm">
              Sign in to your TechNest account
            </p>
          </div>

          {registered && (
            <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-green-400">
                ✅ Account created!{" "}
                {registered === "vendor"
                  ? "We'll review your application within 24hrs."
                  : "Sign in below."}
              </p>
            </div>
          )}

          <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 space-y-5">
            <div>
              <label className={labelClass}>Email or Phone Number</label>
              <input
                className={inputClass}
                placeholder="john@email.com or 08012345678"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                className={inputClass}
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#6c47ff] to-purple-500 text-white font-bold py-3.5 rounded-xl hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

            <p className="text-center text-xs text-[#7070a0]">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => router.push("/auth/register")}
                className="text-[#6c47ff] hover:underline"
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
