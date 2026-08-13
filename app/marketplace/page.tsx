"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/app/lib/helpers";
import { apiFetch } from "@/app/lib/api";
import {
  Search,
  MessageCircle,
  BatteryFull,
  Signal,
  ShieldCheck,
  ScanFace,
  Camera,
  Repeat,
  Hourglass,
  AlertTriangle,
  Inbox,
} from "lucide-react";

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
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState(searchParams.get("type") || "all");
  const [search, setSearch] = useState("");

  const loadListings = () => {
    setError(false);
    setLoading(true);
    apiFetch("/api/listings?limit=50")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => setListings(d.listings || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const fetchListings = async () => {
      await loadListings();
    };
    fetchListings();
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
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
        className="px-4 sm:px-6 py-8 sm:py-12"
      >
        <div className="max-w-5xl mx-auto">
          <p className="mono-label mb-3" style={{ color: "var(--accent)" }}>
            TECHNEST · LIVE INVENTORY
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2"
            style={{ color: "var(--ink)" }}
          >
            Marketplace
          </h1>
          <p
            className="mb-5 sm:mb-6 text-sm sm:text-base"
            style={{ color: "var(--ink-soft)" }}
          >
            Browse devices for sale and swap requests across Nigeria
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div
              className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              <Search size={16} style={{ color: "var(--ink-soft)" }} />
              <input
                className="flex-1 text-sm outline-none bg-transparent"
                style={{ color: "var(--ink)" }}
                placeholder="Search device"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => router.push("/value")}
              className="mono-label w-full sm:w-auto px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity text-center"
              style={{
                background: "var(--accent)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              + LIST YOUR DEVICE
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
        className="px-4 sm:px-6 py-4"
      >
        <div
          className="max-w-5xl mx-auto flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {[
            { val: "all", label: "ALL LISTINGS" },
            { val: "sell", label: "FOR SALE" },
            { val: "swap", label: "SWAP REQUESTS" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className="mono-label px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: filter === val ? "var(--accent)" : "transparent",
                color: filter === val ? "#fff" : "var(--ink-soft)",
                border:
                  filter === val
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {loading && (
          <div className="text-center py-16 sm:py-20">
            <Hourglass
              size={32}
              className="mx-auto mb-3"
              style={{ color: "var(--ink-soft)" }}
            />
            <p style={{ color: "var(--ink-soft)" }}>Loading listings...</p>
          </div>
        )}

        {!loading && error && (
          <div
            className="text-center py-16 sm:py-20 rounded-2xl"
            style={{ border: "1px solid var(--border)" }}
          >
            <AlertTriangle
              size={40}
              className="mx-auto mb-3"
              style={{ color: "var(--accent)" }}
            />
            <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Could not load listings
            </p>
            <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
              Check your connection or try again
            </p>
            <button
              onClick={loadListings}
              className="mono-label px-5 py-2.5 rounded-xl font-semibold"
              style={{
                background: "var(--accent)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              RETRY
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div
            className="text-center py-16 sm:py-20 rounded-2xl"
            style={{ border: "1px solid var(--border)" }}
          >
            <Inbox
              size={40}
              className="mx-auto mb-3"
              style={{ color: "var(--ink-soft)" }}
            />
            <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
              No listings found
            </p>
            <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
              Be the first to list your device
            </p>
            <button
              onClick={() => router.push("/value")}
              className="mono-label px-5 py-2.5 rounded-xl font-semibold hover:opacity-90"
              style={{
                background: "var(--accent)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              VALUE & LIST MY DEVICE →
            </button>
          </div>
        )}

        {/* FOR SALE */}
        {!loading &&
          !error &&
          (filter === "all" || filter === "sell") &&
          cashListings.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <h2
                  className="text-lg sm:text-xl font-bold"
                  style={{ color: "var(--ink)" }}
                >
                  For Sale
                </h2>
                <span
                  className="mono-label px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {cashListings.length} LISTINGS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cashListings.map((l) => (
                  <div
                    key={l._id}
                    className="rounded-2xl p-4 sm:p-5 transition-shadow"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold truncate text-sm sm:text-base"
                          style={{ color: "var(--ink)" }}
                        >
                          {l.deviceName}
                        </p>
                        {l.storage && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--ink-soft)" }}
                          >
                            {l.storage}
                          </p>
                        )}
                      </div>
                      <span
                        className="mono-label px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                        style={{
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                        }}
                      >
                        FOR SALE
                      </span>
                    </div>

                    <p
                      className="text-lg sm:text-xl font-bold mb-3"
                      style={{ color: "var(--ink)" }}
                    >
                      {formatPrice(l.estimatedMin)}
                      <span
                        className="text-xs sm:text-sm font-normal mx-1"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        – {formatPrice(l.estimatedMax)}
                      </span>
                    </p>

                    <div className="flex gap-1.5 flex-wrap mb-4">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{
                          background: "var(--surface)",
                          color: "var(--ink-soft)",
                        }}
                      >
                        <BatteryFull size={12} /> {l.batteryHealth}%
                      </span>
                      {l.simType && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          style={{
                            background: "var(--surface)",
                            color: "var(--ink-soft)",
                          }}
                        >
                          <Signal size={12} /> {l.simType}
                        </span>
                      )}
                      {l.imeiVerified && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          style={{
                            background: "rgba(22,163,74,0.1)",
                            color: "var(--success)",
                          }}
                        >
                          <ShieldCheck size={12} /> IMEI
                        </span>
                      )}
                      {l.faceIdStatus === "working" && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          style={{
                            background: "rgba(22,163,74,0.1)",
                            color: "var(--success)",
                          }}
                        >
                          <ScanFace size={12} /> Face ID
                        </span>
                      )}
                      {l.mediaCount > 0 && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                          }}
                        >
                          <Camera size={12} /> {l.mediaCount}
                        </span>
                      )}
                    </div>

                    {l.repairs.length > 0 && (
                      <p
                        className="text-xs mb-3"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        Repairs: {l.repairs.join(", ")}
                      </p>
                    )}

                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <span
                        className="text-xs truncate mr-2"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        by {l.userName}
                      </span>
                      <a
                        href={`https://wa.me/${l.userPhone?.replace(
                          /\D/g,
                          ""
                        )}?text=Hi ${
                          l.userName
                        }, I'm interested in buying your ${
                          l.deviceName
                        }. Is it still available?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold no-underline px-3 py-1.5 rounded-lg flex-shrink-0 inline-flex items-center gap-1"
                        style={{ background: "#25d366", color: "#fff" }}
                      >
                        <MessageCircle size={13} /> Buy
                      </a>
                    </div>

                    {l.bids && l.bids.length > 0 && (
                      <div
                        className="mt-3 pt-3"
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        <p
                          className="text-xs mb-1.5 font-medium"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          {l.bids.length} vendor bid
                          {l.bids.length > 1 ? "s" : ""}
                        </p>
                        <p
                          className="text-xs font-bold"
                          style={{ color: "var(--accent)" }}
                        >
                          Highest:{" "}
                          {formatPrice(
                            Math.max(...l.bids.map((b) => b.amount))
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* SWAP REQUESTS */}
        {!loading &&
          !error &&
          (filter === "all" || filter === "swap") &&
          swapListings.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <h2
                  className="text-lg sm:text-xl font-bold"
                  style={{ color: "var(--ink)" }}
                >
                  Swap Requests
                </h2>
                <span
                  className="mono-label px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {swapListings.length} REQUESTS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {swapListings.map((l) => (
                  <div
                    key={l._id}
                    className="rounded-2xl p-4 sm:p-5"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div className="grid grid-cols-5 gap-2 sm:gap-3 items-center mb-4">
                      <div
                        className="col-span-2 rounded-xl p-2.5 sm:p-3 text-center"
                        style={{ background: "var(--surface)" }}
                      >
                        <p
                          className="text-xs mb-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Has
                        </p>
                        <p
                          className="text-xs sm:text-sm font-bold leading-tight break-words"
                          style={{ color: "var(--ink)" }}
                        >
                          {l.deviceName}
                        </p>
                        {l.storage && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--ink-soft)" }}
                          >
                            {l.storage}
                          </p>
                        )}
                        <p
                          className="text-xs mt-1 inline-flex items-center gap-1 justify-center"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          <BatteryFull size={11} /> {l.batteryHealth}%
                        </p>
                      </div>
                      <div
                        className="flex justify-center"
                        style={{ color: "var(--accent)" }}
                      >
                        <Repeat size={20} />
                      </div>
                      <div
                        className="col-span-2 rounded-xl p-2.5 sm:p-3 text-center"
                        style={{ background: "var(--accent-soft)" }}
                      >
                        <p
                          className="text-xs mb-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Wants
                        </p>
                        <p
                          className="text-xs sm:text-sm font-bold leading-tight break-words"
                          style={{ color: "var(--accent)" }}
                        >
                          {l.wantedDevice}
                        </p>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-3 mb-4"
                      style={{ background: "var(--surface)" }}
                    >
                      <p
                        className="text-xs mb-0.5"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        Device value
                      </p>
                      <p
                        className="font-bold text-sm sm:text-base"
                        style={{ color: "var(--ink)" }}
                      >
                        {formatPrice(l.estimatedMin)} –{" "}
                        {formatPrice(l.estimatedMax)}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        Will pay the difference
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs truncate mr-2"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        by {l.userName}
                      </span>
                      <a
                        href={`https://wa.me/${l.userPhone?.replace(
                          /\D/g,
                          ""
                        )}?text=Hi ${
                          l.userName
                        }, I saw your swap request on TechNest. I can help you swap your ${
                          l.deviceName
                        } for ${l.wantedDevice}. Let's talk!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold no-underline px-3 py-1.5 rounded-lg flex-shrink-0 inline-flex items-center gap-1"
                        style={{ background: "var(--accent)", color: "#fff" }}
                      >
                        <MessageCircle size={13} /> Discuss Swap
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
        <div style={{ background: "var(--bg)" }} className="min-h-screen" />
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
