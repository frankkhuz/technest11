"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../component/layout/Navbar";
import { formatPrice } from "../lib/helpers";

type Listing = {
  _id: string;
  userName: string;
  userPhone: string;
  deviceName: string;
  storage?: string;
  estimatedMin: number;
  estimatedMax: number;
  listingType: "sell" | "swap";
  wantedDevice?: string;
  batteryHealth: string;
  simType?: string;
  faceIdStatus?: string;
  repairs: string[];
  imeiVerified: boolean;
  mediaCount: number;
  bids?: { amount: number; vendor: string }[];
  status: string;
  createdAt: string;
};

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("type") || "all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/listings?limit=50")
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter((l) => {
    const matchType = filter === "all" || l.listingType === filter;
    const matchSearch =
      !search || l.deviceName.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const cashListings = filtered.filter((l) => l.listingType === "sell");
  const swapListings = filtered.filter((l) => l.listingType === "swap");

  return (
    <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: "#020044" }} className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Marketplace
          </h1>
          <p
            className="mb-6"
            style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px" }}
          >
            Browse devices for sale and swap requests across Nigeria
          </p>

          {/* Search */}
          <div className="flex gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3">
              <span style={{ color: "#6B6B8A" }}>🔍</span>
              <input
                className="flex-1 text-sm outline-none"
                style={{ color: "#020044" }}
                placeholder="Search iPhone, Samsung, MacBook..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => router.push("/value")}
              style={{ background: "#EF3F23" }}
              className="text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              + List Your Device
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          background: "#020044",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
        className="px-6 pb-4"
      >
        <div className="max-w-5xl mx-auto flex gap-2">
          {[
            { val: "all", label: "All Listings" },
            { val: "sell", label: "For Sale" },
            { val: "swap", label: "Swap Requests" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
              style={{
                background:
                  filter === val ? "#EF3F23" : "rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {loading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">⏳</div>
            <p style={{ color: "#6B6B8A" }}>Loading listings...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div
            className="text-center py-20 bg-white rounded-2xl border"
            style={{ border: "1px solid rgba(2,0,68,0.08)" }}
          >
            <div className="text-5xl mb-3">📭</div>
            <p
              className="font-semibold mb-1"
              style={{
                color: "#020044",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              No listings found
            </p>
            <p className="text-sm mb-5" style={{ color: "#6B6B8A" }}>
              Be the first to list your device
            </p>
            <button
              onClick={() => router.push("/value")}
              style={{ background: "#EF3F23" }}
              className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Value & List My Device →
            </button>
          </div>
        )}

        {/* For Sale */}
        {(filter === "all" || filter === "sell") && cashListings.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2
                className="text-xl font-bold"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                For Sale
              </h2>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(239,63,35,0.1)", color: "#EF3F23" }}
              >
                {cashListings.length} listings
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cashListings.map((l) => (
                <div
                  key={l._id}
                  className="bg-white rounded-2xl p-5 border hover:shadow-sm transition-shadow"
                  style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold truncate"
                        style={{
                          color: "#020044",
                          fontFamily: "Space Grotesk, sans-serif",
                        }}
                      >
                        {l.deviceName}
                      </p>
                      {l.storage && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#6B6B8A" }}
                        >
                          {l.storage}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0"
                      style={{
                        background: "rgba(239,63,35,0.08)",
                        color: "#EF3F23",
                      }}
                    >
                      For Sale
                    </span>
                  </div>

                  <p
                    className="text-xl font-bold mb-3"
                    style={{
                      color: "#020044",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
                    {formatPrice(l.estimatedMin)}
                  </p>

                  <div className="flex gap-1.5 flex-wrap mb-4">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(2,0,68,0.06)",
                        color: "#6B6B8A",
                      }}
                    >
                      🔋 {l.batteryHealth}%
                    </span>
                    {l.simType && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(2,0,68,0.06)",
                          color: "#6B6B8A",
                        }}
                      >
                        📶 {l.simType}
                      </span>
                    )}
                    {l.imeiVerified && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(22,163,74,0.08)",
                          color: "#16a34a",
                        }}
                      >
                        ✓ IMEI
                      </span>
                    )}
                    {l.faceIdStatus === "working" && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(22,163,74,0.08)",
                          color: "#16a34a",
                        }}
                      >
                        🔐 Face ID
                      </span>
                    )}
                    {l.mediaCount > 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(119,68,153,0.08)",
                          color: "#774499",
                        }}
                      >
                        📸 {l.mediaCount}
                      </span>
                    )}
                  </div>

                  {l.repairs.length > 0 && (
                    <p className="text-xs mb-3" style={{ color: "#6B6B8A" }}>
                      Repairs: {l.repairs.join(", ")}
                    </p>
                  )}

                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid rgba(2,0,68,0.06)" }}
                  >
                    <span className="text-xs" style={{ color: "#6B6B8A" }}>
                      by {l.userName}
                    </span>
                    <a
                      href={`https://wa.me/${l.userPhone}?text=Hi ${l.userName}, I'm interested in buying your ${l.deviceName}. Is it still available?`}
                      target="_blank"
                      className="text-xs font-semibold no-underline px-3 py-1.5 rounded-lg"
                      style={{ background: "#25d366", color: "#fff" }}
                    >
                      💬 Buy
                    </a>
                  </div>

                  {/* Bids */}
                  {l.bids && l.bids.length > 0 && (
                    <div
                      className="mt-3 pt-3"
                      style={{ borderTop: "1px solid rgba(2,0,68,0.06)" }}
                    >
                      <p
                        className="text-xs mb-1.5 font-medium"
                        style={{ color: "#6B6B8A" }}
                      >
                        {l.bids.length} vendor bid{l.bids.length > 1 ? "s" : ""}
                      </p>
                      <p
                        className="text-xs font-bold"
                        style={{ color: "#774499" }}
                      >
                        Highest:{" "}
                        {formatPrice(Math.max(...l.bids.map((b) => b.amount)))}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Swap Requests */}
        {(filter === "all" || filter === "swap") && swapListings.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2
                className="text-xl font-bold"
                style={{
                  color: "#020044",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Swap Requests
              </h2>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(119,68,153,0.1)", color: "#774499" }}
              >
                {swapListings.length} requests
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {swapListings.map((l) => (
                <div
                  key={l._id}
                  className="bg-white rounded-2xl p-5 border"
                  style={{ border: "1px solid rgba(119,68,153,0.15)" }}
                >
                  <div className="grid grid-cols-5 gap-3 items-center mb-4">
                    <div
                      className="col-span-2 rounded-xl p-3 text-center"
                      style={{ background: "rgba(2,0,68,0.04)" }}
                    >
                      <p className="text-xs mb-1" style={{ color: "#6B6B8A" }}>
                        Has
                      </p>
                      <p
                        className="text-sm font-bold leading-tight"
                        style={{ color: "#020044" }}
                      >
                        {l.deviceName}
                      </p>
                      {l.storage && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#6B6B8A" }}
                        >
                          {l.storage}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: "#6B6B8A" }}>
                        🔋 {l.batteryHealth}%
                      </p>
                    </div>
                    <div
                      className="text-center text-xl"
                      style={{ color: "#774499" }}
                    >
                      ⇄
                    </div>
                    <div
                      className="col-span-2 rounded-xl p-3 text-center"
                      style={{ background: "rgba(119,68,153,0.06)" }}
                    >
                      <p className="text-xs mb-1" style={{ color: "#6B6B8A" }}>
                        Wants
                      </p>
                      <p
                        className="text-sm font-bold leading-tight"
                        style={{ color: "#774499" }}
                      >
                        {l.wantedDevice}
                      </p>
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-3 mb-4"
                    style={{ background: "rgba(2,0,68,0.03)" }}
                  >
                    <p className="text-xs mb-0.5" style={{ color: "#6B6B8A" }}>
                      Device value
                    </p>
                    <p className="font-bold" style={{ color: "#020044" }}>
                      {formatPrice(l.estimatedMin)} –{" "}
                      {formatPrice(l.estimatedMax)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#6B6B8A" }}>
                      Will pay the difference
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#6B6B8A" }}>
                      by {l.userName}
                    </span>
                    <a
                      href={`https://wa.me/${l.userPhone}?text=Hi ${l.userName}, I saw your swap request on TechNest. I can help you swap your ${l.deviceName} for ${l.wantedDevice}. Let's talk!`}
                      target="_blank"
                      className="text-xs font-semibold no-underline px-3 py-1.5 rounded-lg"
                      style={{ background: "#774499", color: "#fff" }}
                    >
                      💬 Discuss Swap
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: "#F8F8FC" }} className="min-h-screen" />
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
