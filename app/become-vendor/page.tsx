"use client";


import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { api } from "@/app/lib/axios";
import { useAuth } from "@/app/hooks/useAuth";

function BecomeVendorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incomplete = searchParams.get("incomplete") === "1";
  const { user, setAuth } = useAuth();

  const [step, setStep] = useState<1 | 2>(user?.userType === "vendor" ? 2 : 1);
  const [upgrading, setUpgrading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [shopAddress, setShopAddress] = useState("");

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
      setStep(2);
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

      // Re-sign the access token cookie so it reflects the new
      // vendorVerified claim, then pull the fresh user to sync context.
      await api.post("/api/auth/refresh");
      const { data } = await api.get("/api/me");
      const freshUser = data.data?.user ?? data.data;
      if (freshUser) setAuth(freshUser);

      router.push("/dashboard");
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
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#F8F8FC" }}
    >
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
              Become a Vendor
            </h1>
            <p className="text-sm" style={{ color: "#6B6B8A" }}>
              {step === 1
                ? "Upgrade your account to start listing products."
                : "A few details to verify your business, then you're in."}
            </p>
          </div>

          {incomplete && !error && (
            <div
              className="rounded-xl p-3 mb-5 text-sm"
              style={{
                background: "rgba(2,0,68,0.05)",
                color: "#020044",
                border: "1px solid rgba(2,0,68,0.15)",
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
                background: "rgba(239,63,35,0.06)",
                color: "#EF3F23",
              }}
            >
              {error}
            </p>
          )}

          {step === 1 && (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
              style={{ background: "#020044" }}
            >
              {upgrading ? "Upgrading..." : "Upgrade to Vendor →"}
            </button>
          )}

          {step === 2 && (
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
                style={{ background: "#EF3F23" }}
              >
                {submitting ? "Submitting..." : "Complete Verification →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BecomeVendorPage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "#F8F8FC" }} className="min-h-screen" />
      }
    >
      <BecomeVendorContent />
    </Suspense>
  );
}
