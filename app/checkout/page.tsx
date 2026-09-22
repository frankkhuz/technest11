"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import Navbar from "../component/layout/Navbar";
import { formatPrice } from "../data/gadget";
import { useCart } from "../context/CartContext";
import {
  NIGERIA_PHONE_REGEX,
  NIGERIA_PHONE_TITLE,
  isValidNigerianPhone,
  EMAIL_REGEX,
  isValidEmail,
} from "../lib/validation";
import type { Transaction } from "../lib/transactions";

const ACCENT = "#C2542D";

type ListingCheckoutInfo = {
  listingId: string;
  deviceName: string;
  totalCharge: number;
  sellerPrice: number;
  platformFee: number;
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedLines, subtotal, clearCart } = useCart();

  const swapTransactionId = searchParams.get("swapTransactionId");
  const listingId = searchParams.get("listingId");

  const [swapTxn, setSwapTxn] = useState<Transaction | null>(null);
  const [swapLoading, setSwapLoading] = useState(!!swapTransactionId);
  const [swapError, setSwapError] = useState<string | null>(null);

  const [listingInfo, setListingInfo] = useState<ListingCheckoutInfo | null>(null);
  const [listingLoading, setListingLoading] = useState(!!listingId);
  const [listingError, setListingError] = useState<string | null>(null);

  useEffect(() => {
    if (!swapTransactionId) return;
    fetch(`/api/transactions/${swapTransactionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setSwapError(d.error);
        else setSwapTxn(d.transaction);
      })
      .catch(() => setSwapError("Could not load this swap request."))
      .finally(() => setSwapLoading(false));
  }, [swapTransactionId]);

  useEffect(() => {
    if (!listingId) return;
    fetch(`/api/listing-checkout-preview?listingId=${encodeURIComponent(listingId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setListingError(d.error);
        else setListingInfo(d.preview);
      })
      .catch(() => setListingError("Could not load this listing."))
      .finally(() => setListingLoading(false));
  }, [listingId]);

  const mode = swapTransactionId ? "swap" : listingId ? "listing" : "cart";

  const price =
    mode === "swap"
      ? swapTxn?.swapDetails?.priceDifference ?? 0
      : mode === "listing"
        ? listingInfo?.totalCharge ?? 0
        : subtotal;

  const displayName =
    mode === "swap"
      ? swapTxn
        ? `Swap top-up: ${swapTxn.swapDetails?.offeredDeviceName ?? "your device"} → ${swapTxn.listingDeviceName}`
        : ""
      : mode === "listing"
        ? listingInfo?.deviceName ?? ""
        : resolvedLines.length === 1
          ? resolvedLines[0].name
          : `${resolvedLines.length} items`;

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = (mode === "swap" && swapLoading) || (mode === "listing" && listingLoading);
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="text-center py-24">
          <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: "var(--ink-soft)" }} />
        </div>
      </div>
    );
  }

  const blocked =
    (mode === "swap" && (swapError || !swapTxn)) ||
    (mode === "listing" && (listingError || !listingInfo)) ||
    (mode === "cart" && resolvedLines.length === 0);

  if (blocked) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
            {swapError || listingError || "Your cart is empty"}
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
      const payload: Record<string, unknown> = {
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
      };
      if (mode === "swap") payload.swapTransactionId = swapTransactionId;
      else if (mode === "listing") payload.listingId = listingId;
      else
        payload.items = resolvedLines.map((l) => ({
          itemId: l.itemId,
          itemType: l.itemType,
          condition: l.condition,
          quantity: l.quantity,
        }));

      const res = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      if (mode === "cart") clearCart();
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

            {mode === "cart" && resolvedLines.length > 1 ? (
              <div className="space-y-2 mb-4">
                {resolvedLines.map((line) => (
                  <div key={`${line.itemId}-${line.condition}`} className="flex items-center justify-between text-xs">
                    <span style={{ color: "var(--ink)" }}>
                      {line.name} {line.quantity > 1 ? `× ${line.quantity}` : ""}
                    </span>
                    <span className="font-semibold" style={{ color: "var(--ink-soft)" }}>
                      {formatPrice(line.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
                  {displayName}
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--ink-soft)" }}>
                  {mode === "swap"
                    ? "Swap price difference"
                    : mode === "listing"
                      ? "Seller price + platform fee"
                      : resolvedLines[0]?.condition === "uk-used"
                        ? "UK Used"
                        : "Brand New"}
                </p>
              </>
            )}

            {mode === "listing" && listingInfo && (
              <div className="space-y-1 mb-3 text-xs" style={{ color: "var(--ink-soft)" }}>
                <div className="flex items-center justify-between">
                  <span>Seller price</span>
                  <span>{formatPrice(listingInfo.sellerPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Platform &amp; processing fee</span>
                  <span>{formatPrice(listingInfo.platformFee)}</span>
                </div>
              </div>
            )}

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
              {mode === "swap" || mode === "listing" ? "Pickup / drop-off address" : "Delivery address"}
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
