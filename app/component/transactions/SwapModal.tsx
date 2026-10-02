"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Repeat, ArrowRight, Loader2 } from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import { apiFetch } from "@/app/lib/api";

const ACCENT = "#C2542D";

export type SwapTargetListing = {
  id: string;
  sellerId: string;
  sellerName: string;
  deviceName: string;
  storage?: string;
  estimatedMin: number;
  estimatedMax: number;
};

type ValuationDevice = { id: string; name: string; storage: string; baseMin: number; baseMax: number };

// Minimal offered-device condition report — same fields calculateValuation
// used to take locally; now sent straight to the backend instead.
type OfferedDevice = {
  category: "phone";
  subType: "iphone" | "android";
  deviceId: string;
  customDeviceName?: string;
  customDevicePrice?: string;
  batteryHealth: string;
  batteryChanged: boolean;
  screenChanged: boolean;
  cameraChanged: boolean;
  faceIdStatus: "working" | "broken" | "";
  simType: "physical" | "esim-unlocked" | "locked" | "";
};

type SwapQuote = {
  offeredValue: number;
  listingValue: number;
  priceDifference: number;
  direction: "pay_extra" | "refund" | "even";
};

function emptyOfferedDevice(): OfferedDevice {
  return {
    category: "phone",
    subType: "iphone",
    deviceId: "",
    batteryHealth: "100",
    batteryChanged: false,
    screenChanged: false,
    cameraChanged: false,
    faceIdStatus: "working",
    simType: "physical",
  };
}

export default function SwapModal({
  listing,
  onClose,
  onSubmitted,
}: {
  listing: SwapTargetListing;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const router = useRouter();
  const [devices, setDevices] = useState<ValuationDevice[]>([]);
  const [form, setForm] = useState<OfferedDevice>(emptyOfferedDevice());
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = <K extends keyof OfferedDevice>(key: K, value: OfferedDevice[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    apiFetch(`/api/valuation/devices?category=phone&subType=${form.subType}`)
      .then((r) => r.json())
      .then((d) => setDevices(d.data?.devices ?? []))
      .catch(() => setDevices([]));
  }, [form.subType]);

  const isOther = form.deviceId.startsWith("other-");

  // Debounced live quote — re-fetches whenever the offered device's
  // condition report changes, so the price difference stays accurate.
  useEffect(() => {
    if (!form.deviceId) {
      setQuote(null);
      return;
    }
    if (isOther && (!form.customDeviceName?.trim() || !Number(form.customDevicePrice))) {
      setQuote(null);
      return;
    }
    const timer = setTimeout(() => {
      setQuoting(true);
      apiFetch("/api/transactions/swap-quote", {
        method: "POST",
        body: JSON.stringify({ listingId: listing.id, offeredDevice: form }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setQuote(d.data?.quote ?? null);
        })
        .catch(() => {})
        .finally(() => setQuoting(false));
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const diff = quote?.priceDifference ?? 0;

  const handleSubmit = async () => {
    if (!quote) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          type: "swap",
          listingId: listing.id,
          offeredDevice: form,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong.");
      } else {
        onSubmitted();
        if (data.data?.requiresPayment && data.data?.transaction?.id) {
          // A top-up is owed — go straight to payment instead of just
          // logging the request, same as the buy flow does.
          router.push(`/checkout?swapTransactionId=${data.data.transaction.id}`);
        } else {
          setDone(true);
        }
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deviceOptions = useMemo(() => devices, [devices]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-soft)", color: ACCENT }}
            >
              <Repeat className="w-4.5 h-4.5" />
            </div>
            <h3
              className="text-base font-bold"
              style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Swap for {listing.deviceName} {listing.storage}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--ink-soft)", cursor: "pointer" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Swap request sent
            </p>
            <p className="text-xs mb-5" style={{ color: "var(--ink-soft)" }}>
              {listing.sellerName} will review your offer and respond.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: "var(--ink-soft)" }}>
              Tell us about the device you&apos;re offering — we&apos;ll show the price
              difference instantly.
            </p>

            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
              Device type
            </label>
            <div className="flex gap-2 mb-3">
              {(["iphone", "android"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setForm((f) => ({ ...f, subType: st, deviceId: "" }))}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border"
                  style={{
                    borderColor: form.subType === st ? ACCENT : "var(--border)",
                    background: form.subType === st ? "var(--accent-soft)" : "var(--bg)",
                    color: "var(--ink)",
                    cursor: "pointer",
                  }}
                >
                  {st === "iphone" ? "iPhone" : "Android"}
                </button>
              ))}
            </div>

            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
              Your device
            </label>
            <select
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none mb-3"
              style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
              value={form.deviceId}
              onChange={(e) => set("deviceId", e.target.value)}
            >
              <option value="">Choose a device...</option>
              {deviceOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.storage}
                </option>
              ))}
            </select>

            {isOther && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input
                  value={form.customDeviceName ?? ""}
                  onChange={(e) => set("customDeviceName", e.target.value)}
                  placeholder="Device name & storage"
                  className="text-sm px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
                />
                <input
                  value={form.customDevicePrice ?? ""}
                  onChange={(e) => set("customDevicePrice", e.target.value.replace(/\D/g, ""))}
                  placeholder="Estimated price (₦)"
                  inputMode="numeric"
                  className="text-sm px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
                />
              </div>
            )}

            {form.deviceId && (
              <>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                  Battery health: {form.batteryHealth}%
                </label>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={form.batteryHealth}
                  onChange={(e) => set("batteryHealth", e.target.value)}
                  className="w-full mb-3"
                  style={{ accentColor: ACCENT, cursor: "pointer" }}
                />

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { key: "screenChanged" as const, label: "Screen replaced" },
                    { key: "batteryChanged" as const, label: "Battery replaced" },
                    { key: "cameraChanged" as const, label: "Camera replaced" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => set(key, !form[key])}
                      className="text-xs px-3 py-2 rounded-lg border text-left"
                      style={{
                        borderColor: form[key] ? ACCENT : "var(--border)",
                        background: form[key] ? "var(--accent-soft)" : "var(--bg)",
                        color: "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <select
                    className="text-xs px-3 py-2 rounded-lg border"
                    style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--ink)" }}
                    value={form.simType}
                    onChange={(e) => set("simType", e.target.value as OfferedDevice["simType"])}
                  >
                    <option value="physical">Physical + eSIM</option>
                    <option value="esim-unlocked">eSIM only</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>

                {quoting && !quote ? (
                  <div className="flex items-center justify-center py-4 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--ink-soft)" }} />
                  </div>
                ) : quote ? (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span style={{ color: "var(--ink-soft)" }}>Your device is worth</span>
                      <span className="font-semibold" style={{ color: "var(--ink)" }}>
                        {formatPrice(quote.offeredValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span style={{ color: "var(--ink-soft)" }}>Their device is worth</span>
                      <span className="font-semibold" style={{ color: "var(--ink)" }}>
                        {formatPrice(quote.listingValue)}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                        {quote.direction === "pay_extra"
                          ? "You pay extra"
                          : quote.direction === "refund"
                            ? "You get a refund"
                            : "Even swap"}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{
                          color:
                            quote.direction === "pay_extra"
                              ? "#DC2626"
                              : quote.direction === "refund"
                                ? "#16a34a"
                                : "var(--ink)",
                        }}
                      >
                        {diff === 0 ? "₦0" : formatPrice(Math.abs(diff))}
                      </span>
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {error && (
              <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!quote || submitting}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : diff > 0 ? (
                <>
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Send Swap Request <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
