"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Clock } from "lucide-react";
import { api } from "@/app/lib/axios";
import { useAuth } from "@/app/hooks/useAuth";
import { ThemeToggle } from "../component/layout/Navbar";
import { useTheme } from "@/app/hooks/useTheme";
import SectionBackground from "../component/home/SectionBackground";

type Stage = "upgrade" | "form" | "pending";

function BecomeVendorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomplete = searchParams.get("incomplete") === "1";
  const { user, setAuth } = useAuth();
  const { dark, toggle } = useTheme();

  const alreadySubmitted = !!(
    user?.userType === "vendor" &&
    (user as any)?.vendorProfile?.phone &&
    !(user as any)?.vendorVerified
  );

  const initialStage: Stage =
    user?.userType !== "vendor"
      ? "upgrade"
      : alreadySubmitted
      ? "pending"
      : "form";

  const [stage, setStage] = useState<Stage>(initialStage);
  const [upgrading, setUpgrading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [shopAddress, setShopAddress] = useState("");

  // If vendorVerified flips true while sitting on this page, bounce
  // straight to the dashboard.
  useEffect(() => {
    if ((user as any)?.vendorVerified) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // AuthContext only fetches /api/me on its own mount, which doesn't
  // refire on client-side navigation (e.g. clicking back to this page
  // after an admin approved you elsewhere). So every time THIS page is
  // visited, independently re-sign the token and re-check status —
  // otherwise an approved vendor can land back here and see stale
  // "pending" state until their next full page reload.
  useEffect(() => {
    let cancelled = false;

    api
      .post("/api/auth/refresh")
      .catch(() => {})
      .finally(() =>
        api
          .get("/api/me")
          .then(({ data }) => {
            if (cancelled) return;
            const freshUser = data.data?.user ?? data.data;
            if (freshUser) {
              setAuth(freshUser);
              if (freshUser.vendorVerified) {
                router.push("/dashboard");
              }
            }
          })
          .catch(() => {})
      );

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extractError = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      return (
        err.response?.data?.message || err.response?.data?.error || fallback
      );
    }
    return fallback;
  };

  const handleUpgrade = async () => {
    setError("");
    setUpgrading(true);
    try {
      await api.patch("/api/vendors/upgrade");
      setStage("form");
    } catch (err) {
      setError(extractError(err, "Could not upgrade account. Try again."));
    } finally {
      setUpgrading(false);
    }
  };

  const handleVerify = async () => {
    setError("");

    if (!phone || !businessRegNumber || !shopAddress) {
      setError(
        "Phone, business registration number, and shop address are required"
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.patch("/api/vendors/verify", {
        phone,
        businessRegNumber,
        shopAddress,
      });

      await api.post("/api/auth/refresh");
      const { data } = await api.get("/api/me");
      const freshUser = data.data?.user ?? data.data;
      if (freshUser) setAuth(freshUser);

      // Don't push to /dashboard — vendorVerified is still false at this
      // point by design (admin approves separately). Show the pending
      // state right here instead of bouncing through the middleware.
      setStage("pending");
    } catch (err) {
      setError(
        extractError(
          err,
          "Verification failed. Check your details and try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inp =
    "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors";

  const inpS = {
    borderColor: "var(--border)",
    color: "var(--ink)",
    background: "var(--bg)",
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
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden transition-colors duration-300"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      {stage === "upgrade" && (
        <SectionBackground dark={dark} minCount={8} maxCount={20} />
      )}

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {stage === "pending" ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl p-8 border text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="relative w-16 h-16 mx-auto mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(220,38,38,0.12)" }}
                  animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(220,38,38,0.12)" }}
                  animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6,
                  }}
                />
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626" }}
                >
                  <Clock className="w-7 h-7" />
                </div>
              </div>

              <h1
                className="text-xl font-bold mb-2"
                style={{
                  color: "var(--ink)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Application Submitted
              </h1>
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: "var(--ink-soft)" }}
              >
                Your details are in review. This usually takes less than 24
                hours — we'll unlock your dashboard the moment you're approved.
              </p>

              <div
                className="rounded-xl p-4 mb-6 text-left space-y-2"
                style={{ background: "var(--border)" }}
              >
                {[
                  ["Phone", phone || (user as any)?.vendorProfile?.phone],
                  [
                    "Business Reg. No.",
                    businessRegNumber ||
                      (user as any)?.vendorProfile?.businessRegNumber,
                  ],
                  [
                    "Shop Address",
                    shopAddress || (user as any)?.vendorProfile?.shopAddress,
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span style={{ color: "var(--ink-soft)" }}>{k}</span>
                    <span
                      className="font-medium text-right max-w-[60%] truncate"
                      style={{ color: "var(--ink)" }}
                    >
                      {v || "—"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => router.push("/")}
                  className="w-full text-sm font-semibold py-3 rounded-xl border transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                >
                  ← Back to Marketplace
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl p-8 border"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="mb-6">
                <h1
                  className="text-2xl font-bold mb-1"
                  style={{
                    color: "var(--ink)",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  Become a Vendor
                </h1>
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  {stage === "upgrade"
                    ? "Upgrade your account to start listing products."
                    : "A few details to verify your business, then you're in."}
                </p>
              </div>

              {incomplete && !error && stage === "form" && (
                <div
                  className="rounded-xl p-3 mb-5 text-sm"
                  style={{
                    background: "var(--border)",
                    color: "var(--ink)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Your vendor account isn&apos;t fully set up yet — finish
                  verification below to unlock your dashboard.
                </div>
              )}

              {error && (
                <p
                  className="text-xs px-3 py-2 rounded-lg mb-5"
                  style={{
                    background: "rgba(220,38,38,0.06)",
                    color: "#DC2626",
                  }}
                >
                  {error}
                </p>
              )}

              {stage === "upgrade" && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
                  style={{ background: "#020044" }}
                >
                  {upgrading ? "Upgrading..." : "Upgrade to Vendor →"}
                </button>
              )}

              {stage === "form" && (
                <div className="space-y-4">
                  <div>
                    {lbl("Phone Number")}
                    <input
                      className={inp}
                      style={inpS}
                      placeholder="08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    {lbl("Business Registration Number")}
                    <input
                      className={inp}
                      style={inpS}
                      placeholder="RC1234567"
                      value={businessRegNumber}
                      onChange={(e) => setBusinessRegNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    {lbl("Shop Address")}
                    <input
                      className={inp}
                      style={inpS}
                      placeholder="12 Market Street, Lagos"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={submitting}
                    className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
                    style={{ background: "var(--accent)" }}
                  >
                    {submitting ? "Submitting..." : "Complete Verification →"}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BecomeVendorPage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "var(--bg)" }} className="min-h-screen" />
      }
    >
      <BecomeVendorContent />
    </Suspense>
  );
}
