"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Repeat, ArrowRight, Loader2 } from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import {
  iphoneDevices,
  calculateValuation,
  type FormData as ValuationFormData,
} from "@/app/data/gadget";

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

function emptyValuationForm(): ValuationFormData {
  return {
    listingMode: "swap",
    category: "phone",
    subType: "iphone",
    deviceId: "",
    customDeviceName: "",
    customDevicePrice: "",
    batteryHealth: "100",
    batteryChanged: false,
    screenChanged: false,
    cameraChanged: false,
    faceIdStatus: "working",
    simType: "physical",
    imei: "",
    imeiValid: null,
    ramUpgraded: false,
    storageUpgraded: false,
    keyboardChanged: false,
    otherRepairs: "",
    mediaFiles: [],
    wantedDevice: "",
    customWantedDevice: "",
    sellerName: "",
    sellerPhone: "",
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
  const [form, setForm] = useState<ValuationFormData>(emptyValuationForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = <K extends keyof ValuationFormData>(key: K, value: ValuationFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const result = useMemo(
    () => (form.deviceId ? calculateValuation(form) : null),
    [form]
  );

  const diff = result
    ? Math.round((result.minVal + result.maxVal) / 2) -
      Math.round((listing.estimatedMin + listing.estimatedMax) / 2)
    : 0;

  const handleSubmit = async () => {
    if (!result) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "swap",
          listingId: listing.id,
          listingDeviceName: listing.deviceName,
          listingStorage: listing.storage,
          sellerId: listing.sellerId,
          sellerName: listing.sellerName,
          swapDetails: {
            offeredDeviceName: result.device.name,
            offeredStorage: result.device.storage,
            offeredValuation: Math.round((result.minVal + result.maxVal) / 2),
            targetPriceMin: listing.estimatedMin,
            targetPriceMax: listing.estimatedMax,
            priceDifference: diff,
            direction: diff > 0 ? "pay_extra" : diff < 0 ? "refund" : "even",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        onSubmitted();
        if (diff > 0 && data.transaction?.id) {
          // A top-up is owed — go straight to payment instead of just
          // logging the request, same as the buy flow does.
          router.push(`/checkout?swapTransactionId=${data.transaction.id}`);
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
              Your device
            </label>
            <select
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none mb-3"
              style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
              value={form.deviceId}
              onChange={(e) => set("deviceId", e.target.value)}
            >
              <option value="">Choose a device...</option>
              {iphoneDevices
                .filter((d) => d.id !== "other-iphone")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.storage}
                  </option>
                ))}
            </select>

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
                    onChange={(e) => set("simType", e.target.value as ValuationFormData["simType"])}
                  >
                    <option value="physical">Physical + eSIM</option>
                    <option value="esim-unlocked">eSIM only</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>

                {result && (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span style={{ color: "var(--ink-soft)" }}>Your device is worth</span>
                      <span className="font-semibold" style={{ color: "var(--ink)" }}>
                        {formatPrice(result.minVal)} – {formatPrice(result.maxVal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span style={{ color: "var(--ink-soft)" }}>Their device is worth</span>
                      <span className="font-semibold" style={{ color: "var(--ink)" }}>
                        {formatPrice(listing.estimatedMin)} – {formatPrice(listing.estimatedMax)}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                        {diff > 0 ? "You pay extra" : diff < 0 ? "You get a refund" : "Even swap"}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: diff > 0 ? "#DC2626" : diff < 0 ? "#16a34a" : "var(--ink)" }}
                      >
                        {diff === 0 ? "₦0" : formatPrice(Math.abs(diff))}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!result || submitting}
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
