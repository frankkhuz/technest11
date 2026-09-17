"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Handshake, Send, Loader2, Package, Clock } from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import Navbar from "@/app/component/layout/Navbar";
import type { VendorRequest } from "@/app/lib/transactions";

const ACCENT = "#C2542D";

type MarketListing = {
  _id: string;
  userName: string;
  userPhone: string;
  deviceName: string;
  storage?: string;
  estimatedMin: number;
  estimatedMax: number;
  listingType: "sell" | "swap";
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function B2BHubPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceName, setDeviceName] = useState("");
  const [notes, setNotes] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVendor = user?.userType === "vendor";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login?redirect=/b2b");
      return;
    }
    if (!isVendor) return;

    Promise.all([
      fetch("/api/vendor-requests").then((r) => r.json()),
      apiFetch("/api/listings?limit=100").then((r) => r.json()),
    ])
      .then(([reqData, listData]) => {
        setRequests(reqData.requests ?? []);
        setListings(listData.data?.listings ?? listData.listings ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isVendor]);

  const matchesFor = useMemo(() => {
    const map: Record<string, MarketListing[]> = {};
    for (const req of requests) {
      const key = normalize(req.deviceName);
      map[req.id] = listings.filter((l) => {
        const name = normalize(l.deviceName + " " + (l.storage ?? ""));
        return name.includes(key) || key.includes(normalize(l.deviceName));
      });
    }
    return map;
  }, [requests, listings]);

  const submitRequest = async () => {
    if (!deviceName.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/vendor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName: deviceName.trim(), notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setRequests((r) => [data.request, ...r]);
        setDeviceName("");
        setNotes("");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPosting(false);
    }
  };

  if (!authLoading && user && !isVendor) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <Handshake className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
            The B2B Hub is for verified vendors
          </p>
          <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
            Register as a vendor to request devices and match against other vendors&apos; stock.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-1">
          <Handshake className="w-5 h-5" style={{ color: ACCENT }} />
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
          >
            B2B Hub
          </h1>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Request a device — if another vendor already has it listed, you&apos;ll see it here
          with their price.
        </p>

        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
            Device you need
          </label>
          <input
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g. iPhone 14 Pro 256GB"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3"
            style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
          />
          <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
            Notes (optional)
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quantity, condition preference, budget..."
            className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3"
            style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
          />
          {error && (
            <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
              {error}
            </p>
          )}
          <button
            onClick={submitRequest}
            disabled={posting || !deviceName.trim()}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40"
            style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post Request
          </button>
        </div>

        <h2 className="text-sm font-bold mb-3" style={{ color: "var(--ink)" }}>
          Open Requests
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-7 h-7 mx-auto animate-spin" style={{ color: "var(--ink-soft)" }} />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            No open requests right now.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const matches = matchesFor[req.id] ?? [];
              return (
                <div
                  key={req.id}
                  className="rounded-2xl p-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                        {req.deviceName}
                      </p>
                      {req.notes && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                          {req.notes}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                        Requested by {req.vendorName}
                      </p>
                    </div>
                    {matches.length > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}
                      >
                        <Package className="w-3.5 h-3.5" /> {matches.length} match
                        {matches.length === 1 ? "" : "es"}
                      </span>
                    )}
                  </div>

                  {matches.length > 0 && (
                    <div className="mt-3 pt-3 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
                      {matches.slice(0, 3).map((m) => (
                        <a
                          key={m._id}
                          href={`https://wa.me/${m.userPhone?.replace(/\D/g, "")}?text=Hi ${
                            m.userName
                          }, I saw your ${m.deviceName} on TechNest — a fellow vendor is looking for one. Is it still available?`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-xs no-underline rounded-lg px-3 py-2"
                          style={{ background: "var(--bg)", color: "var(--ink)" }}
                        >
                          <span>
                            {m.deviceName} {m.storage} — by {m.userName}
                          </span>
                          <span className="font-semibold" style={{ color: ACCENT }}>
                            {formatPrice(m.estimatedMin)}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-xs mt-2 inline-flex items-center gap-1" style={{ color: "var(--ink-soft)" }}>
                    <Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
