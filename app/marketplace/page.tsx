"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  AlertTriangle,
  Inbox,
  BatteryFull,
  Signal,
  Lock,
  Camera,
  Repeat,
  CheckCircle2,
  Watch,
  PenTool,
  Keyboard,
  Headphones,
  Tablet,
  ArrowRight,
  Cctv,
  Plane,
  Sun,
  Router,
  Wifi,
  Laptop,
  Gamepad2,
  ShoppingBag,
  SlidersHorizontal,
  Hourglass,
  HandCoins,
  type LucideIcon,
} from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import Navbar from "../component/layout/Navbar";
import SectionBackground from "../component/home/SectionBackground";
import { gadgets, type GadgetCategoryKey } from "@/app/data/gadget";
import SwapModal, { type SwapTargetListing } from "../component/transactions/SwapModal";
import { CardGridSkeleton } from "@/app/component/ui/Skeleton";
import type { MarketListing } from "@/app/types/backend";
import { ListingTrustBadges, SellerLine, OfferCount } from "@/app/component/shared/ListingBadges";
import VendorBidModal from "@/app/component/shared/VendorBidModal";
import { Chip, fieldStyle } from "@/app/component/ui/kit";

const ACCENT = "#C2542D";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const GADGET_CATEGORY_ICONS: Record<GadgetCategoryKey, LucideIcon> = {
  camera: Camera,
  watch: Watch,
  stylus: PenTool,
  keyboard: Keyboard,
  audio: Headphones,
  tablet: Tablet,
  accessory: CheckCircle2,
  security: Cctv,
  drone: Plane,
  power: Sun,
  router: Router,
  mifi: Wifi,
  laptop: Laptop,
  console: Gamepad2,
};

const FEATURED_GADGET_IDS = [
  "canon-eos-r50",
  "apple-watch-series-10",
  "apple-pencil-pro",
  "apple-magic-keyboard",
  "airpods-pro-2",
  "ipad-air",
];

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const PAGE_SIZE = 24;

type SortOption = "newest" | "price-asc" | "price-desc";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isVendor = user?.userType === "vendor";
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState(searchParams.get("type") || "all");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [storageFilter, setStorageFilter] = useState<string>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [imeiOnly, setImeiOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [swapListing, setSwapListing] = useState<SwapTargetListing | null>(null);
  const [bidListing, setBidListing] = useState<MarketListing | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Non-vendors never see swap requests, so ask only for sale listings —
  // that keeps the server's paging and totals honest.
  const listingType = !isVendor ? "sell" : filter === "all" ? "" : filter;

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), sort: sortBy });
    if (listingType) params.set("listingType", listingType);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (storageFilter !== "all") params.set("storage", storageFilter);
    if (Number(minPrice) > 0) params.set("minPrice", String(Number(minPrice)));
    if (Number(maxPrice) > 0) params.set("maxPrice", String(Number(maxPrice)));
    if (imeiOnly) params.set("imeiVerified", "true");
    if (availableOnly) params.set("available", "true");
    return params.toString();
  }, [listingType, debouncedSearch, storageFilter, minPrice, maxPrice, imeiOnly, availableOnly, sortBy]);

  const loadListings = (nextPage = 1) => {
    setError(false);
    if (nextPage === 1) setLoading(true);
    else setLoadingMore(true);
    apiFetch(`/api/listings?${query}&page=${nextPage}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => {
        const rows: MarketListing[] = d.data?.listings ?? [];
        setListings((prev) => (nextPage === 1 ? rows : [...prev, ...rows]));
        setTotal(d.data?.total ?? rows.length);
        setPages(d.data?.pages ?? 1);
        setPage(nextPage);
      })
      .catch(() => setError(true))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    loadListings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const activeFilterCount =
    (storageFilter !== "all" ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (imeiOnly ? 1 : 0) +
    (availableOnly ? 1 : 0);

  const clearFilters = () => {
    setStorageFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setImeiOnly(false);
    setAvailableOnly(false);
  };

  const filtered = listings.filter((l) => isVendor || l.listingType !== "swap");
  const cashListings = filtered.filter((l) => l.listingType === "sell");
  const swapListings = filtered.filter((l) => l.listingType === "swap");

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <Navbar />

      {/* ── Header ── */}
      <div
        style={{ background: "#020044" }}
        className="relative overflow-hidden px-4 sm:px-6 py-8 sm:py-12"
      >
        <SectionBackground dark={true} minCount={10} maxCount={22} />
        <div className="relative max-w-5xl mx-auto">
          <h1
            className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Marketplace
          </h1>
          <p
            className="mb-5 sm:mb-6 text-sm sm:text-base"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Browse devices for sale and swap requests across Nigeria
          </p>

          {/* CHANGED: search + button stack vertically on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3">
              <Search className="w-4 h-4" style={{ color: "var(--ink-soft)" }} />
              {/* placeholder shortened to "Search device" */}
              <input
                className="flex-1 text-sm outline-none"
                style={{ color: "var(--ink)" }}
                placeholder="Search device, e.g. iPhone 13 Pro"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* CHANGED: full-width on mobile, auto on sm+ */}
            <button
              onClick={() => router.push("/value")}
              style={{ background: "var(--accent)" }}
              className="w-full sm:w-auto text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity text-center"
            >
              + List Your Device
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div
        style={{
          background: "#020044",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
        className="px-4 sm:px-6 pb-4"
      >
        {/* CHANGED: overflow-x-auto so tabs scroll on tiny screens */}
        <div
          className="max-w-5xl mx-auto flex gap-2 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          {[
            { val: "all", label: "All Listings" },
            { val: "sell", label: "For Sale" },
            ...(isVendor ? [{ val: "swap", label: "Swap Requests" }] : []),
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background:
                  filter === val ? "var(--accent)" : "rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* Sort & filter */}
        <div className="-mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs px-3 py-2 rounded-lg outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
                cursor: "pointer",
              }}
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg"
              style={{
                background: showFilters || activeFilterCount ? "var(--accent-soft)" : "var(--surface)",
                border: "1px solid var(--border)",
                color: showFilters || activeFilterCount ? "var(--accent)" : "var(--ink)",
                cursor: "pointer",
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </button>
            <Chip active={imeiOnly} onClick={() => setImeiOnly((v) => !v)}>
              IMEI checked
            </Chip>
            <Chip active={availableOnly} onClick={() => setAvailableOnly((v) => !v)}>
              Available now
            </Chip>
            {!loading && !error && (
              <span className="text-xs ml-auto" style={{ color: "var(--ink-soft)" }}>
                {total} listing{total === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {showFilters && (
            <div
              className="rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <label className="text-xs" style={{ color: "var(--ink-soft)" }}>
                Min price (₦)
                <input
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="0"
                  className="mt-1 w-full text-sm px-3 py-2 rounded-lg outline-none"
                  style={fieldStyle}
                />
              </label>
              <label className="text-xs" style={{ color: "var(--ink-soft)" }}>
                Max price (₦)
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="Any"
                  className="mt-1 w-full text-sm px-3 py-2 rounded-lg outline-none"
                  style={fieldStyle}
                />
              </label>
              <label className="text-xs" style={{ color: "var(--ink-soft)" }}>
                Storage
                <select
                  value={storageFilter}
                  onChange={(e) => setStorageFilter(e.target.value)}
                  className="mt-1 w-full text-sm px-3 py-2 rounded-lg outline-none"
                  style={{ ...fieldStyle, cursor: "pointer" }}
                >
                  <option value="all">Any storage</option>
                  {STORAGE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  disabled={!activeFilterCount}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-40"
                  style={{ border: "1px solid var(--border)", color: "var(--ink)", cursor: "pointer" }}
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <CardGridSkeleton count={6} imageHeight={220} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" />
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="text-center py-16 sm:py-20 rounded-2xl border"
            style={{ background: "var(--surface)", border: "1px solid rgba(220,38,38,0.15)" }}
          >
            <AlertTriangle
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "#DC2626" }}
            />
            <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Could not load listings
            </p>
            <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
              Check your connection or try again
            </p>
            <button
              onClick={() => loadListings(1)}
              style={{ background: "#020044" }}
              className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div
            className="text-center py-16 sm:py-20 rounded-2xl border"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <Inbox
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--ink-soft)" }}
            />
            <p
              className="font-semibold mb-1"
              style={{
                color: "var(--ink)",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              No listings found
            </p>
            <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
              {debouncedSearch || activeFilterCount
                ? "Nothing matches — try fewer filters, or ask vendors for it with a request."
                : "Be the first to list your device"}
            </p>
            {(!!debouncedSearch || activeFilterCount > 0) && (
              <button
                onClick={() =>
                  router.push(`/requests/new?type=buy${debouncedSearch ? `&device=${encodeURIComponent(debouncedSearch)}` : ""}`)
                }
                className="text-sm font-semibold px-5 py-2.5 rounded-xl mr-2 mb-2"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                Request it from vendors
              </button>
            )}
            <button
              onClick={() => router.push("/value")}
              style={{ background: "var(--accent)" }}
              className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90"
            >
              Value & List My Device →
            </button>
          </div>
        )}

        {/* ── FOR SALE ── */}
        {!loading &&
          !error &&
          (filter === "all" || filter === "sell") &&
          cashListings.length > 0 && (
            <div
              className="rounded-2xl p-4 sm:p-6 shadow-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <h2
                  className="text-lg sm:text-xl font-bold"
                  style={{
                    color: "var(--ink)",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  For Sale
                </h2>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {listingType === "sell" ? total : cashListings.length} listings
                </span>
              </div>

              {/* CHANGED: 1 col mobile → 2 col sm → 3 col lg */}
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {cashListings.map((l) => (
                  <motion.div
                    key={l._id}
                    variants={cardVariants}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl p-4 sm:p-5 border transition-shadow duration-200 hover:shadow-md"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {/* Thumbnail */}
                    {l.images && l.images.length > 0 && (
                      <div
                        className="w-full rounded-xl overflow-hidden mb-3"
                        style={{
                          aspectRatio: "4/3",
                          background: "var(--border)",
                        }}
                      >
                        <img
                          src={l.images[0]}
                          alt={l.deviceName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium truncate text-sm sm:text-base"
                          style={{
                            color: "var(--ink)",
                            fontFamily: "Space Grotesk, sans-serif",
                          }}
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
                        className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                        }}
                      >
                        For Sale
                      </span>
                    </div>

                    {/* Price */}
                    <p
                      className="text-base sm:text-lg font-semibold mb-3"
                      style={{
                        color: "var(--ink)",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      {formatPrice(l.estimatedMin)}
                      <span
                        className="text-xs sm:text-sm font-normal mx-1"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        – {formatPrice(l.estimatedMax)}
                      </span>
                    </p>

                    {/* Tags */}
                    <div className="flex gap-1.5 flex-wrap mb-4">
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--border)",
                          color: "var(--ink-soft)",
                        }}
                      >
                        <BatteryFull className="w-3 h-3" /> {l.batteryHealth}%
                      </span>
                      {l.simType && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "var(--border)",
                            color: "var(--ink-soft)",
                          }}
                        >
                          <Signal className="w-3 h-3" /> {l.simType}
                        </span>
                      )}
                      {l.faceIdStatus === "working" && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(22,163,74,0.08)",
                            color: "#16a34a",
                          }}
                        >
                          <Lock className="w-3 h-3" /> Face ID
                        </span>
                      )}
                      {l.mediaCount > 0 && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                          }}
                        >
                          <Camera className="w-3 h-3" /> {l.mediaCount}
                        </span>
                      )}
                      <ListingTrustBadges listing={l} />
                    </div>

                    {l.repairs.length > 0 && (
                      <p className="text-xs mb-3" style={{ color: "var(--ink-soft)" }}>
                        Repairs: {l.repairs.join(", ")}
                      </p>
                    )}

                    {/* Footer */}
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <SellerLine listing={l} />
                      <button
                        onClick={() => router.push(`/checkout?listingId=${l._id}`)}
                        disabled={l.isReserved || l.isAvailable === false}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 disabled:opacity-50"
                        style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
                      >
                        {l.isReserved ? (
                          <>
                            <Hourglass className="w-3.5 h-3.5" /> Reserved
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" /> Buy via TechNest
                          </>
                        )}
                      </button>
                    </div>

                    {(!!l.bidCount || (isVendor && l.status === "active")) && (
                      <div
                        className="mt-3 pt-3 flex items-center justify-between gap-2"
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        <OfferCount count={l.bidCount} />
                        {isVendor && (
                          <button
                            onClick={() => setBidListing(l)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ml-auto"
                            style={{ background: "var(--accent-soft)", color: "var(--accent)", cursor: "pointer" }}
                          >
                            <HandCoins className="w-3.5 h-3.5" />
                            {l.bids?.[0] ? `Your offer: ${formatPrice(l.bids[0].amount)}` : "Make an offer"}
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

        {/* ── SWAP REQUESTS ── */}
        {!loading &&
          !error &&
          (filter === "all" || filter === "swap") &&
          swapListings.length > 0 && (
            <div
              className="rounded-2xl p-4 sm:p-6 shadow-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--accent-soft)" }}
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <h2
                  className="text-lg sm:text-xl font-bold"
                  style={{
                    color: "var(--ink)",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  Swap Requests
                </h2>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {swapListings.length} requests
                </span>
              </div>

              {/* CHANGED: 1 col mobile → 2 col sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {swapListings.map((l) => (
                  <div
                    key={l._id}
                    className="rounded-2xl p-4 sm:p-5 border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--accent-soft)",
                    }}
                  >
                    {/* Thumbnail */}
                    {l.images && l.images.length > 0 && (
                      <div
                        className="w-full rounded-xl overflow-hidden mb-3"
                        style={{
                          aspectRatio: "4/3",
                          background: "var(--border)",
                        }}
                      >
                        <img
                          src={l.images[0]}
                          alt={l.deviceName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Has ⇄ Wants */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-3 items-center mb-4">
                      <div
                        className="col-span-2 rounded-xl p-2.5 sm:p-3 text-center"
                        style={{ background: "var(--border)" }}
                      >
                        <p
                          className="text-xs mb-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Has
                        </p>
                        {/* CHANGED: text-xs on mobile so long device names don't overflow */}
                        <p
                          className="text-xs sm:text-sm font-semibold leading-tight break-words"
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
                          className="inline-flex items-center gap-1 text-xs mt-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          <BatteryFull className="w-3 h-3" /> {l.batteryHealth}%
                        </p>
                      </div>
                      <div
                        className="flex items-center justify-center"
                        style={{ color: "var(--accent)" }}
                      >
                        <Repeat className="w-5 h-5" />
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
                          className="text-xs sm:text-sm font-semibold leading-tight break-words"
                          style={{ color: "var(--accent)" }}
                        >
                          {l.wantedDevice}
                        </p>
                      </div>
                    </div>

                    {/* Value */}
                    <div
                      className="rounded-xl p-3 mb-4"
                      style={{ background: "var(--border)" }}
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

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <ListingTrustBadges listing={l} />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-2">
                      <SellerLine listing={l} />
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {l.owner?._id && l.owner._id !== user?.id && (
                          <button
                            onClick={() =>
                              setSwapListing({
                                id: l._id,
                                sellerId: l.owner!._id,
                                sellerName: l.owner!.name || l.userName,
                                deviceName: l.deviceName,
                                storage: l.storage,
                                estimatedMin: l.estimatedMin,
                                estimatedMax: l.estimatedMax,
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                            style={{
                              background: "var(--bg)",
                              border: "1px solid var(--accent)",
                              color: "var(--accent)",
                              cursor: "pointer",
                            }}
                          >
                            <Repeat className="w-3.5 h-3.5" /> Swap Request
                          </button>
                        )}
                        <button
                          onClick={() => setBidListing(l)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: "var(--accent)", color: "#fff", cursor: "pointer" }}
                        >
                          <HandCoins className="w-3.5 h-3.5" /> Offer
                        </button>
                      </div>
                    </div>
                    {!!l.bidCount && (
                      <div className="mt-2">
                        <OfferCount count={l.bidCount} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {!loading && !error && page < pages && (
          <div className="text-center -mt-2">
            <button
              onClick={() => loadListings(page + 1)}
              disabled={loadingMore}
              className="text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
            >
              {loadingMore ? "Loading…" : `Load more (${Math.max(0, total - listings.length)} left)`}
            </button>
          </div>
        )}

        {/* ── FEATURED GADGETS ── */}
        <div
          className="rounded-2xl p-4 sm:p-6 shadow-sm"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2
                className="text-lg sm:text-xl font-bold"
                style={{
                  color: "var(--ink)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                More Gadgets
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                Cameras, smartwatches, styluses, keyboards & more
              </p>
            </div>
            <button
              onClick={() => router.push("/buy")}
              className="inline-flex items-center gap-1 text-sm font-medium flex-shrink-0"
              style={{ color: "var(--accent)", cursor: "pointer" }}
            >
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURED_GADGET_IDS.map((id) => {
              const gadget = gadgets.find((g) => g.id === id);
              if (!gadget) return null;
              const GadgetIcon = GADGET_CATEGORY_ICONS[gadget.gadgetCategory];
              return (
                <div
                  key={gadget.id}
                  onClick={() => router.push("/buy")}
                  className="rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div
                    className="flex items-center justify-center py-6"
                    style={{ background: "var(--accent-soft)" }}
                  >
                    <GadgetIcon
                      className="w-8 h-8"
                      style={{ color: "var(--accent)" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="p-2.5">
                    <p
                      className="text-xs font-medium leading-snug line-clamp-2 mb-1"
                      style={{ color: "var(--ink)" }}
                    >
                      {gadget.name}
                    </p>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "var(--accent)" }}
                    >
                      {formatPrice(gadget.priceUkUsed)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {bidListing && (
        <VendorBidModal
          listing={bidListing}
          onClose={() => setBidListing(null)}
          onPlaced={() => loadListings(1)}
        />
      )}

      {swapListing && (
        <SwapModal
          listing={swapListing}
          onClose={() => setSwapListing(null)}
          onSubmitted={() => {}}
        />
      )}
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
