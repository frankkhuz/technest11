"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  CreditCard,
  Truck,
  Store,
  CheckCircle2,
  Package,
} from "lucide-react";
import Navbar from "../component/layout/Navbar";
import { formatPrice } from "../data/gadget";
import { useCart } from "../context/CartContext";
import { apiFetch, apiJson, jsonBody } from "../lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { loginHref } from "@/app/lib/auth";
import {
  NIGERIA_PHONE_REGEX,
  NIGERIA_PHONE_TITLE,
  isValidNigerianPhone,
  EMAIL_REGEX,
  isValidEmail,
} from "../lib/validation";
import { Skeleton } from "@/app/component/ui/Skeleton";
import { NIGERIAN_STATES, type MarketListing, type OrderRequest } from "@/app/types/backend";

const ACCENT = "#C2542D";

type SwapTransaction = {
  id: string;
  listingDeviceName: string;
  swapDetails?: { offeredDeviceName?: string; priceDifference?: number };
};

type PaymentOptions = {
  whatsapp: { enabled: boolean; number?: string };
  online: { enabled: boolean; label?: string };
};

const inputCls = "w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3";
const inputStyle = { background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" };

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { resolvedLines, subtotal, clearCart, productsLoading } = useCart();

  const swapTransactionId = searchParams.get("swapTransactionId");
  const listingId = searchParams.get("listingId");
  const mode = swapTransactionId ? "swap" : listingId ? "listing" : "cart";

  // A swap top-up belongs to a signed-in swap request; catalog and listing
  // orders through WhatsApp work for guests too.
  useEffect(() => {
    if (authLoading || mode !== "swap") return;
    if (!user) router.push(loginHref(`/checkout?swapTransactionId=${swapTransactionId}`));
  }, [authLoading, user, router, mode, swapTransactionId]);

  const [options, setOptions] = useState<PaymentOptions | null>(null);
  useEffect(() => {
    apiJson<PaymentOptions>("/api/order-requests/options").then((r) =>
      setOptions(r.data ?? { whatsapp: { enabled: true }, online: { enabled: false, label: "Coming soon" } })
    );
  }, []);
  const onlineEnabled = !!options?.online.enabled;

  const [swapTxn, setSwapTxn] = useState<SwapTransaction | null>(null);
  const [swapLoading, setSwapLoading] = useState(mode === "swap");
  const [swapError, setSwapError] = useState<string | null>(null);

  const [listing, setListing] = useState<MarketListing | null>(null);
  const [listingLoading, setListingLoading] = useState(mode === "listing");
  const [listingError, setListingError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "swap" || !user) return;
    apiJson<{ transaction: SwapTransaction }>(`/api/transactions/${swapTransactionId}`)
      .then((r) => {
        if (!r.ok) setSwapError(r.message || "Could not load this swap request.");
        else setSwapTxn(r.data?.transaction ?? null);
      })
      .finally(() => setSwapLoading(false));
  }, [mode, swapTransactionId, user]);

  useEffect(() => {
    if (mode !== "listing") return;
    apiJson<{ listing: MarketListing }>(`/api/listings/${encodeURIComponent(listingId!)}`)
      .then((r) => {
        if (!r.ok || !r.data?.listing) setListingError(r.message || "Could not load this listing.");
        else if (r.data.listing.isReserved || r.data.listing.isAvailable === false)
          setListingError("This device is reserved for another buyer right now. Check back soon.");
        else setListing(r.data.listing);
      })
      .finally(() => setListingLoading(false));
  }, [mode, listingId]);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [state, setState] = useState("Lagos");
  const [city, setCity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState<"whatsapp" | "online" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ request: OrderRequest; whatsappUrl: string } | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (user?.email) setBuyerEmail(user.email);
      if (user?.name) setBuyerName(user.name);
      if (user?.phone) setBuyerPhone(user.phone);
    });
  }, [user]);

  const loading =
    (mode === "swap" && (authLoading || !user || swapLoading)) ||
    (mode === "listing" && listingLoading) ||
    (mode === "cart" && productsLoading);
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <CheckoutSkeleton />
      </div>
    );
  }

  if (placed) {
    return <OrderPlaced placed={placed} signedIn={!!user} />;
  }

  const blocked =
    (mode === "swap" && (swapError || !swapTxn)) ||
    (mode === "listing" && (listingError || !listing)) ||
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
            onClick={() => router.push(mode === "listing" ? "/marketplace" : "/buy")}
            className="text-sm font-semibold"
            style={{ color: ACCENT, cursor: "pointer" }}
          >
            ← Browse devices
          </button>
        </div>
      </div>
    );
  }

  const price =
    mode === "swap"
      ? swapTxn?.swapDetails?.priceDifference ?? 0
      : mode === "listing"
        ? listing?.estimatedMax ?? 0
        : subtotal;

  const displayName =
    mode === "swap"
      ? `Swap top-up: ${swapTxn?.swapDetails?.offeredDeviceName ?? "your device"} → ${swapTxn?.listingDeviceName}`
      : mode === "listing"
        ? `${listing?.deviceName}${listing?.storage ? ` (${listing.storage})` : ""}`
        : resolvedLines.length === 1
          ? resolvedLines[0].name
          : `${resolvedLines.length} items`;

  const validate = (forOnline: boolean): string | null => {
    if (!buyerName.trim()) return "Enter your full name.";
    if (!isValidNigerianPhone(buyerPhone)) return NIGERIA_PHONE_TITLE;
    if ((forOnline || buyerEmail.trim()) && !isValidEmail(buyerEmail)) return "Enter a valid email address.";
    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) return "Enter a delivery address.";
    if (deliveryMethod === "delivery" && !city.trim()) return "Enter your city or area.";
    return null;
  };

  const orderOnWhatsApp = async () => {
    setError(null);
    const problem = validate(false);
    if (problem) return setError(problem);

    setSubmitting("whatsapp");
    const payload: Record<string, unknown> = {
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerEmail: buyerEmail.trim() || undefined,
      state,
      city: city.trim() || undefined,
      deliveryMethod,
      deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress.trim() : undefined,
      note: note.trim() || undefined,
    };
    if (mode === "listing") payload.listingId = listingId;
    else
      payload.items = resolvedLines.map((l) => ({
        itemId: l.itemId,
        quantity: l.quantity,
        condition: l.condition,
      }));

    const res = await apiJson<{ request: OrderRequest; whatsappUrl: string }>(
      "/api/order-requests",
      jsonBody(payload)
    );
    setSubmitting(null);
    if (!res.ok || !res.data) {
      setError(res.message);
      return;
    }
    if (mode === "cart") clearCart();
    setPlaced(res.data);
    window.open(res.data.whatsappUrl, "_blank", "noopener");
  };

  // Paystack — only reachable once the backend turns online payments on.
  const payOnline = async () => {
    setError(null);
    if (!user) return router.push(loginHref(`/checkout?${searchParams.toString()}`));
    const problem = validate(true);
    if (problem) return setError(problem);

    setSubmitting("online");
    try {
      const payload: Record<string, unknown> = {
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim(),
        deliveryAddress:
          deliveryMethod === "pickup"
            ? "Pickup"
            : [deliveryAddress.trim(), city.trim(), state].filter(Boolean).join(", "),
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

      const res = await apiFetch("/api/checkout/initialize", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong.");
        setSubmitting(null);
        return;
      }
      if (mode === "cart") clearCart();
      window.location.href = data.data.authorizationUrl;
    } catch {
      setError("Network error — please try again.");
      setSubmitting(null);
    }
  };

  const whatsappNumber = options?.whatsapp.number ?? "2348186450477";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Checkout
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          {mode === "swap"
            ? "Pay the top-up on your swap."
            : "Place your order and we'll confirm price, delivery and payment with you on WhatsApp."}
        </p>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Order summary */}
          <div
            className="md:col-span-2 rounded-2xl p-5 h-fit order-2 md:order-1"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--ink-soft)" }}>
              Order Summary
            </p>

            {mode === "listing" && listing?.images?.[0] && (
              <div className="w-full rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "4/3", background: "var(--border)" }}>
                <img src={listing.images[0]} alt={listing.deviceName} className="w-full h-full object-cover" />
              </div>
            )}

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
                      ? `Marketplace device · valued ${formatPrice(listing!.estimatedMin)} – ${formatPrice(listing!.estimatedMax)}`
                      : resolvedLines[0]?.condition === "uk-used"
                        ? "UK Used"
                        : "Brand New"}
                </p>
              </>
            )}

            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                {mode === "listing" ? "Up to" : "Total"}
              </span>
              <span className="text-lg font-bold" style={{ color: ACCENT }}>
                {formatPrice(price)}
              </span>
            </div>
            <p className="text-[11px] mt-3 flex items-start gap-1" style={{ color: "var(--ink-soft)" }}>
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              {mode === "swap"
                ? "Secure payment via Paystack"
                : "TechNest works out the final price (plus any delivery fee) and confirms it on WhatsApp before you pay."}
            </p>
          </div>

          {/* Details form */}
          <div
            className="md:col-span-3 rounded-2xl p-5 order-1 md:order-2"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--ink-soft)" }}>
              Your Details
            </p>

            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
              Full name
            </label>
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="John Doe"
              className={inputCls}
              style={inputStyle}
            />

            <div className="grid sm:grid-cols-2 gap-x-3">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                  WhatsApp number
                </label>
                <input
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="08012345678"
                  pattern={NIGERIA_PHONE_REGEX.source}
                  title={NIGERIA_PHONE_TITLE}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                  Email{" "}
                  {!onlineEnabled && (
                    <span className="font-normal" style={{ color: "var(--ink-soft)" }}>
                      (optional)
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="john@email.com"
                  pattern={EMAIL_REGEX.source}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>

            {mode !== "swap" && (
              <>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                  How do you want to get it?
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {(
                    [
                      { val: "delivery", label: "Delivery", desc: "To your address", Icon: Truck },
                      { val: "pickup", label: "Pickup", desc: "Collect it yourself", Icon: Store },
                    ] as const
                  ).map(({ val, label, desc, Icon }) => (
                    <button
                      key={val}
                      onClick={() => setDeliveryMethod(val)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left"
                      style={{
                        border: `1.5px solid ${deliveryMethod === val ? ACCENT : "var(--border)"}`,
                        background: deliveryMethod === val ? "var(--accent-soft)" : "var(--bg)",
                        cursor: "pointer",
                      }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: deliveryMethod === val ? ACCENT : "var(--ink-soft)" }} />
                      <span>
                        <span className="block text-sm font-semibold" style={{ color: "var(--ink)" }}>
                          {label}
                        </span>
                        <span className="block text-[11px]" style={{ color: "var(--ink-soft)" }}>
                          {desc}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-x-3">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                  State
                </label>
                <select value={state} onChange={(e) => setState(e.target.value)} className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                  City / area
                </label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Ikeja" className={inputCls} style={inputStyle} />
              </div>
            </div>

            {(deliveryMethod === "delivery" || mode === "swap") && (
              <>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                  {mode === "swap" ? "Pickup / drop-off address" : "Delivery address"}
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House number, street, landmark"
                  rows={2}
                  className={`${inputCls} resize-none`}
                  style={inputStyle}
                />
              </>
            )}

            {mode !== "swap" && (
              <>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                  Note{" "}
                  <span className="font-normal" style={{ color: "var(--ink-soft)" }}>
                    (optional)
                  </span>
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Colour preference, best time to call…"
                  className={inputCls}
                  style={inputStyle}
                />
              </>
            )}

            {error && (
              <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
                {error}
              </p>
            )}

            <div className="space-y-2.5 mt-1">
              {mode !== "swap" ? (
                <button
                  onClick={orderOnWhatsApp}
                  disabled={!!submitting}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: "#25d366", color: "#fff", cursor: "pointer" }}
                >
                  {submitting === "whatsapp" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" /> Chat with us on WhatsApp
                    </>
                  )}
                </button>
              ) : (
                !onlineEnabled && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Hi TechNest, I'd like to pay the ${formatPrice(price)} top-up on my swap for ${swapTxn?.listingDeviceName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 no-underline"
                    style={{ background: "#25d366", color: "#fff" }}
                  >
                    <MessageCircle className="w-4 h-4" /> Pay the top-up via WhatsApp
                  </a>
                )
              )}

              <button
                onClick={payOnline}
                disabled={!onlineEnabled || !!submitting}
                className="w-full py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                style={{
                  background: onlineEnabled ? ACCENT : "var(--bg)",
                  color: onlineEnabled ? "#fff" : "var(--ink-soft)",
                  border: onlineEnabled ? "none" : "1px dashed var(--border)",
                  cursor: onlineEnabled ? "pointer" : "not-allowed",
                }}
              >
                {submitting === "online" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : onlineEnabled ? (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay {formatPrice(price)} online <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay online — {options?.online.label ?? "Coming soon"}
                  </>
                )}
              </button>
              {!user && mode !== "swap" && (
                <p className="text-[11px] text-center" style={{ color: "var(--ink-soft)" }}>
                  No account needed.{" "}
                  <button
                    onClick={() => router.push(loginHref(`/checkout?${searchParams.toString()}`))}
                    className="underline"
                    style={{ color: ACCENT, cursor: "pointer" }}
                  >
                    Sign in
                  </button>{" "}
                  to track this order in My Orders.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderPlaced({
  placed,
  signedIn,
}: {
  placed: { request: OrderRequest; whatsappUrl: string };
  signedIn: boolean;
}) {
  const router = useRouter();
  const r = placed.request;
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}
          >
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
            Order received
          </h1>
          {r.reference && (
            <p className="text-xs mb-3 font-mono-tech" style={{ color: "var(--ink-soft)" }}>
              Ref {r.reference}
            </p>
          )}
          <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
            Send the pre-filled WhatsApp message so we can confirm the price, delivery and payment.
          </p>
          {typeof r.totalWithDelivery === "number" && (
            <div className="rounded-xl p-3 mb-5 text-left space-y-1" style={{ background: "var(--bg)" }}>
              {typeof r.delivery?.fee === "number" && r.delivery.fee > 0 && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--ink-soft)" }}>Delivery</span>
                  <span style={{ color: "var(--ink)" }}>{formatPrice(r.delivery.fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold">
                <span style={{ color: "var(--ink)" }}>Total</span>
                <span style={{ color: ACCENT }}>{formatPrice(r.totalWithDelivery)}</span>
              </div>
            </div>
          )}
          <a
            href={placed.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 no-underline mb-2"
            style={{ background: "#25d366", color: "#fff" }}
          >
            <MessageCircle className="w-4 h-4" /> Open WhatsApp
          </a>
          <button
            onClick={() => router.push(signedIn ? "/orders" : "/buy")}
            className="w-full py-3 rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2"
            style={{ border: "1px solid var(--border)", color: "var(--ink)", cursor: "pointer" }}
          >
            <Package className="w-4 h-4" /> {signedIn ? "Track it in My Orders" : "Keep shopping"}
          </button>
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

function CheckoutSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl" />
          ))}
        </div>
        <div className="md:col-span-2 space-y-3">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
