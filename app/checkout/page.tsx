"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import Navbar from "../component/layout/Navbar";
import { phones, gadgets, formatPrice } from "../data/gadget";
import {
  NIGERIA_PHONE_REGEX,
  NIGERIA_PHONE_TITLE,
  isValidNigerianPhone,
  EMAIL_REGEX,
  isValidEmail,
} from "../lib/validation";

const ACCENT = "#C2542D";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemId = searchParams.get("itemId") ?? "";
  const itemType = searchParams.get("itemType") === "gadget" ? "gadget" : "phone";
  const condition = searchParams.get("condition") === "brand-new" ? "brand-new" : "uk-used";

  const phone = itemType === "phone" ? phones.find((p) => p.id === itemId) : undefined;
  const gadget = itemType === "gadget" ? gadgets.find((g) => g.id === itemId) : undefined;
  const item = phone ?? gadget;
  const price = item ? (condition === "uk-used" ? item.priceUkUsed : item.priceBrandNew) : 0;

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
            No item selected for checkout
          </p>
          <button
            onClick={() => router.push("/buy")}
            className="text-sm font-semibold"
            style={{ color: ACCENT, cursor: "pointer" }}
          >
            ← Browse devices
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError(null);
    if (!buyerName.trim()) return setError("Enter your full name.");
    if (!isValidEmail(buyerEmail)) return setError("Enter a valid email address.");
    if (!isValidNigerianPhone(buyerPhone)) return setError(NIGERIA_PHONE_TITLE);
    if (!deliveryAddress.trim()) return setError("Enter a delivery address.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          itemType,
          condition,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Checkout
        </h1>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Order summary */}
          <div
            className="md:col-span-2 rounded-2xl p-5 h-fit order-2 md:order-1"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--ink-soft)" }}>
              Order Summary
            </p>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
              {item.name}
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--ink-soft)" }}>
              {condition === "uk-used" ? "UK Used" : "Brand New"}
            </p>
            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                Total
              </span>
              <span className="text-lg font-bold" style={{ color: ACCENT }}>
                {formatPrice(price)}
              </span>
            </div>
            <p className="text-[11px] mt-3 flex items-center gap-1" style={{ color: "var(--ink-soft)" }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Secure payment via Paystack
            </p>
          </div>

          {/* Delivery form */}
          <div
            className="md:col-span-3 rounded-2xl p-5 order-1 md:order-2"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--ink-soft)" }}>
              Delivery Details
            </p>

            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
              Full name
            </label>
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="John Doe"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3"
              style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
            />

            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
              Email
            </label>
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="john@email.com"
              pattern={EMAIL_REGEX.source}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3"
              style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
            />

            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
              Phone number
            </label>
            <input
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="08012345678"
              pattern={NIGERIA_PHONE_REGEX.source}
              title={NIGERIA_PHONE_TITLE}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3"
              style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
            />

            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
              Delivery address
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Street, city, state"
              rows={3}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-4 resize-none"
              style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
            />

            {error && (
              <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Pay {formatPrice(price)} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <CheckoutContent />
    </Suspense>
  );
}
