"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Clock, Check, FileUp, CheckCircle2 } from "lucide-react";
import { apiJson, uploadFiles } from "@/app/lib/api";
import {
  NIGERIAN_STATES,
  VENDOR_TYPE_LABELS,
  type RepairService,
  type VendorType,
} from "@/app/types/backend";
import { isValidNigerianPhone, NIGERIA_PHONE_TITLE } from "@/app/lib/validation";

const CAC_REGEX = /^(RC|BN|IT|LP|LLP)\s?\d{4,8}$/i;
const VENDOR_TYPES = Object.keys(VENDOR_TYPE_LABELS) as VendorType[];
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
    user?.vendorProfile?.phone &&
    !user?.vendorVerified
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
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>(["phone_dealer"]);
  const [states, setStates] = useState<string[]>([]);
  const [brands, setBrands] = useState("");
  const [repairServices, setRepairServices] = useState<string[]>([]);
  const [services, setServices] = useState<RepairService[]>([]);
  const [cacFile, setCacFile] = useState<File | null>(null);
  const cacRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiJson<{ services: RepairService[] }>("/api/repair-triage/services").then((r) =>
      setServices(r.data?.services ?? [])
    );
  }, []);

  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  // If vendorVerified flips true while sitting on this page, bounce
  // straight to the dashboard.
  useEffect(() => {
    if (user?.vendorVerified) {
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
      await api.patch("/api/vendor/upgrade");
      setStage("form");
    } catch (err) {
      setError(extractError(err, "Could not upgrade account. Try again."));
    } finally {
      setUpgrading(false);
    }
  };

  const handleVerify = async () => {
    setError("");

    if (!businessName.trim() || !phone || !businessRegNumber || !shopAddress) {
      setError("Business name, phone, CAC number and shop address are required");
      return;
    }
    if (!isValidNigerianPhone(phone)) {
      setError(NIGERIA_PHONE_TITLE);
      return;
    }
    if (!CAC_REGEX.test(businessRegNumber.trim())) {
      setError("CAC number looks like RC1234567 or BN1234567");
      return;
    }
    if (vendorTypes.length === 0) {
      setError("Pick at least one thing you do");
      return;
    }

    setSubmitting(true);
    try {
      let cacCertificateId: string | undefined;
      if (cacFile) {
        const [uploaded] = await uploadFiles([cacFile], "private");
        cacCertificateId = uploaded?.publicId;
      }

      await api.patch("/api/vendor/verify", {
        phone,
        businessRegNumber: businessRegNumber.trim().toUpperCase().replace(/\s/g, ""),
        shopAddress,
        businessName: businessName.trim(),
        vendorTypes,
        states,
        brands: brands
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean),
        city: city.trim() || undefined,
        repairServices: vendorTypes.includes("repairs") ? repairServices : [],
        cacCertificateId,
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
        err instanceof Error && !axios.isAxiosError(err)
          ? err.message
          : extractError(err, "Verification failed. Check your details and try again.")
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
                hours — we&apos;ll unlock your dashboard the moment you&apos;re approved.
              </p>

              <div
                className="rounded-xl p-4 mb-6 text-left space-y-2"
                style={{ background: "var(--border)" }}
              >
                {[
                  ["Business", businessName || user?.vendorProfile?.businessName],
                  ["Phone", phone || user?.vendorProfile?.phone],
                  ["CAC No.", businessRegNumber || user?.vendorProfile?.businessRegNumber],
                  ["Shop Address", shopAddress || user?.vendorProfile?.shopAddress],
                  [
                    "Serves",
                    (states.length ? states : user?.vendorProfile?.states ?? []).join(", ") || "Nationwide",
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
                    {lbl("Business Name")}
                    <input className={inp} style={inpS} placeholder="e.g. Kingsley Gadgets" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  </div>

                  <div>
                    {lbl("What do you do?")}
                    <div className="grid grid-cols-2 gap-2">
                      {VENDOR_TYPES.map((t) => {
                        const on = vendorTypes.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setVendorTypes((v) => toggleIn(v, t))}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left"
                            style={{
                              borderColor: on ? "var(--accent)" : "var(--border)",
                              background: on ? "var(--accent-soft)" : "var(--bg)",
                              color: "var(--ink)",
                            }}
                          >
                            <span
                              className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: on ? "var(--accent)" : "var(--border)", background: on ? "var(--accent)" : "transparent" }}
                            >
                              {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </span>
                            {VENDOR_TYPE_LABELS[t]}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "var(--ink-soft)" }}>
                      This decides which customer requests reach you.
                    </p>
                  </div>

                  {vendorTypes.includes("repairs") && services.length > 0 && (
                    <div>
                      {lbl("Repairs you offer")}
                      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                        {services.map((sv) => {
                          const on = repairServices.includes(sv.id);
                          return (
                            <button
                              key={sv.id}
                              type="button"
                              onClick={() => setRepairServices((v) => toggleIn(v, sv.id))}
                              className="text-xs px-2.5 py-1.5 rounded-lg border"
                              style={{
                                borderColor: on ? "var(--accent)" : "var(--border)",
                                background: on ? "var(--accent-soft)" : "var(--bg)",
                                color: on ? "var(--accent)" : "var(--ink-soft)",
                              }}
                            >
                              {sv.issue}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    {lbl("States you serve")}
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {NIGERIAN_STATES.map((st) => {
                        const on = states.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setStates((v) => toggleIn(v, st))}
                            className="text-xs px-2.5 py-1 rounded-lg border"
                            style={{
                              borderColor: on ? "var(--accent)" : "var(--border)",
                              background: on ? "var(--accent-soft)" : "var(--bg)",
                              color: on ? "var(--accent)" : "var(--ink-soft)",
                            }}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "var(--ink-soft)" }}>
                      {states.length ? `${states.length} selected` : "None selected = nationwide"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      {lbl("City")}
                      <input className={inp} style={inpS} placeholder="Ikeja" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div>
                      {lbl("Phone Number")}
                      <input className={inp} style={inpS} placeholder="08012345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    {lbl("Brands you deal in (optional)")}
                    <input className={inp} style={inpS} placeholder="Apple, Samsung, Tecno" value={brands} onChange={(e) => setBrands(e.target.value)} />
                  </div>

                  <div>
                    {lbl("CAC Registration Number")}
                    <input
                      className={inp}
                      style={inpS}
                      placeholder="RC1234567 or BN1234567"
                      value={businessRegNumber}
                      onChange={(e) => setBusinessRegNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    {lbl("CAC Certificate (optional, speeds up approval)")}
                    <button
                      type="button"
                      onClick={() => cacRef.current?.click()}
                      className="w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm"
                      style={{ borderColor: cacFile ? "#16a34a" : "var(--border)", color: cacFile ? "#16a34a" : "var(--ink-soft)" }}
                    >
                      {cacFile ? <CheckCircle2 className="w-4 h-4" /> : <FileUp className="w-4 h-4" />}
                      {cacFile ? cacFile.name : "Upload photo or PDF"}
                    </button>
                    <input
                      ref={cacRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setCacFile(e.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs mt-1.5" style={{ color: "var(--ink-soft)" }}>
                      Stored privately — only TechNest admins can open it.
                    </p>
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
