"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Smartphone,
  Repeat,
  Wallet,
  BatteryFull,
  Signal,
  Lock,
  Unlock,
  Camera,
  CheckCircle2,
  User as UserIcon,
  Mail,
  Clock,
  CheckCheck,
  EyeOff,
  RotateCcw,
  Send,
  Star,
  ShieldCheck,
  ScanLine,
  Settings,
  BadgeCheck,
  Phone,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import { apiFetch, apiJson } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import Navbar from "@/app/component/layout/Navbar";
import PayoutSetupCard from "@/app/component/shared/PayoutSetupCard";
import BuyAgainShelf from "@/app/component/shared/BuyAgainShelf";
import NotificationList from "@/app/component/shared/NotificationList";
import { ListingTrustBadges } from "@/app/component/shared/ListingBadges";
import type { AppNotification } from "@/app/lib/notifications";
import type { MarketListing, ListingStatus } from "@/app/types/backend";
import { PageSkeleton } from "@/app/component/ui/Skeleton";
import { Pill, timeAgo, formatDate, type Tone } from "@/app/component/ui/kit";

const ACCENT = "var(--accent)";
const CONFIRM_EVERY_DAYS = 30;

const LISTING_STATUS: Record<ListingStatus, { label: string; tone: Tone }> = {
  pending_review: { label: "In review", tone: "amber" },
  active: { label: "Live", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  removed: { label: "Removed", tone: "neutral" },
  sold: { label: "Sold", tone: "purple" },
  swapped: { label: "Swapped", tone: "purple" },
  expired: { label: "Expired", tone: "red" },
};

function daysUntilConfirm(l: MarketListing) {
  const from = l.lastConfirmedAt ?? l.createdAt;
  const due = new Date(from).getTime() + CONFIRM_EVERY_DAYS * 86400000;
  return Math.ceil((due - Date.now()) / 86400000);
}

const SHORTCUTS: { label: string; desc: string; href: string; Icon: LucideIcon }[] = [
  { label: "My requests", desc: "Get offers from vendors", href: "/requests", Icon: Send },
  { label: "Rate a deal", desc: "Review who you dealt with", href: "/reviews", Icon: Star },
  { label: "Get verified", desc: "ID check for a seller badge", href: "/account/verify", Icon: ShieldCheck },
  { label: "IMEI check", desc: "Is a phone reported stolen?", href: "/imei", Icon: ScanLine },
];

export default function BuyerDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  const [listings, setListings] = useState<MarketListing[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tab, setTab] = useState<"listings" | "notifications">("listings");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [listingMsg, setListingMsg] = useState<{ id: string; text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login?from=/user");
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  // Deep links from notifications (/user#listing-<id>) land on the card.
  useEffect(() => {
    if (loading || !window.location.hash) return;
    document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [loading]);

  const updateListing = (id: string, patch: Partial<MarketListing>) =>
    setListings((ls) => ls.map((l) => (l._id === id ? { ...l, ...patch } : l)));

  // Listings expire after 30 days without this; confirming an expired one
  // brings it back (or sends it back through review if it's been long).
  const confirmAvailable = async (l: MarketListing) => {
    setBusy(l._id);
    setListingMsg(null);
    const res = await apiJson<{ listing: MarketListing }>(`/api/listings/${l._id}/confirm`, { method: "POST" });
    setBusy(null);
    if (!res.ok) return setListingMsg({ id: l._id, text: res.message, error: true });
    const next = res.data?.listing;
    updateListing(l._id, next ?? { lastConfirmedAt: new Date().toISOString(), status: "active" });
    setListingMsg({
      id: l._id,
      text:
        next?.status === "pending_review"
          ? "Thanks — it's back in review and goes live once approved."
          : "Thanks — your listing stays live for another 30 days.",
    });
  };

  const markSold = async (l: MarketListing) => {
    if (!window.confirm(`Mark your ${l.deviceName} as sold? It will leave the marketplace.`)) return;
    setBusy(l._id);
    const res = await apiJson(`/api/listings/${l._id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "sold" }),
    });
    setBusy(null);
    if (!res.ok) return setListingMsg({ id: l._id, text: res.message, error: true });
    updateListing(l._id, { status: "sold" });
  };

  const handleAcceptBid = async (listingId: string, bidId: string) => {
    setAccepting(bidId);
    try {
      const res = await apiFetch(`/api/listings/${listingId}/bids/${bidId}/accept`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) await fetchAll();
      else setListingMsg({ id: listingId, text: data.message || "Could not accept this offer.", error: true });
    } finally {
      setAccepting(null);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    const [lr, nr] = await Promise.all([
      apiJson<{ listings: MarketListing[] }>("/api/listings/mine"),
      apiJson<{ notifications: AppNotification[] }>("/api/notifications"),
    ]);
    setListings(lr.data?.listings ?? []);
    setNotifications(nr.data?.notifications ?? []);
    setLoading(false);
  };

  const markAllRead = async () => {
    await apiFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ id: "all" }) });
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const unread = notifications.filter((n) => !n.read).length;
  const liveListings = listings.filter((l) => l.status === "active").length;
  const withOffers = listings.filter((l) => (l.bids?.length ?? l.bidCount ?? 0) > 0).length;

  if (isLoading || loading)
    return (
      <div className="min-h-screen transition-colors duration-300" style={{ background: "var(--bg)", color: "var(--ink)" }}>
        <Navbar />
        <PageSkeleton />
      </div>
    );

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
              My Dashboard
            </h1>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Welcome back, {user?.name?.split(" ")[0]}
            </p>
          </div>
          <button
            onClick={() => router.push("/account")}
            className="rounded-xl px-4 py-3 flex items-center gap-3 text-left"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--accent-soft)", color: ACCENT }}
            >
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1 text-sm font-semibold leading-tight" style={{ color: "var(--ink)" }}>
                {user?.name}
                {user?.identityVerified && (
                  <BadgeCheck className="w-3.5 h-3.5" style={{ color: "#1d9bf0" }} aria-label="Verified" />
                )}
                {user?.phoneVerified && <Phone className="w-3 h-3" style={{ color: "#16a34a" }} aria-label="Phone verified" />}
              </p>
              <p className="inline-flex items-center gap-1 text-xs leading-tight" style={{ color: "var(--ink-soft)" }}>
                <Mail className="w-3 h-3" /> {user?.email}
              </p>
            </div>
            <Settings className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ink-soft)" }} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SHORTCUTS.map(({ label, desc, href, Icon }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="rounded-xl p-3 text-left card-hover"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
            >
              <Icon className="w-4 h-4 mb-2" style={{ color: ACCENT }} />
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                {label}
              </p>
              <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                {desc}
              </p>
            </button>
          ))}
        </div>

        <BuyAgainShelf />

        <PayoutSetupCard />

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Live Listings", val: liveListings, color: "var(--ink)" },
            { label: "With Offers", val: withOffers, color: ACCENT },
            { label: "Unread Notifs", val: unread, color: "#DC2626" },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-xl p-4 border" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-xs mb-1" style={{ color: "var(--ink-soft)" }}>
                {label}
              </p>
              <p className="text-2xl font-bold" style={{ color, fontFamily: "Space Grotesk, sans-serif" }}>
                {val}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--border)" }}>
            {[
              { t: "listings", label: "My Listings" },
              { t: "notifications", label: `Notifications${unread > 0 ? ` (${unread})` : ""}` },
            ].map(({ t, label }) => (
              <button
                key={t}
                onClick={() => setTab(t as "listings" | "notifications")}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tab === t ? "var(--accent)" : "transparent",
                  color: tab === t ? "#fff" : "var(--ink-soft)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "notifications" && unread > 0 && (
            <button onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: ACCENT }}>
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* Listings */}
        {tab === "listings" && (
          <div className="space-y-4">
            {listings.length === 0 && (
              <div className="rounded-xl p-12 text-center border" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <Smartphone className="w-9 h-9 mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
                <p className="font-semibold mb-1" style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
                  No listings yet
                </p>
                <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
                  Value your device to sell or swap
                </p>
                <button
                  onClick={() => router.push("/value")}
                  style={{ background: ACCENT }}
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                >
                  Value My Device →
                </button>
              </div>
            )}
            {listings.map((l) => {
              const status = LISTING_STATUS[l.status] ?? { label: l.status, tone: "neutral" as Tone };
              const dueIn = daysUntilConfirm(l);
              const canConfirm = l.status === "active" || l.status === "expired";
              const bids = l.bids ?? [];
              return (
                <div
                  key={l._id}
                  id={`listing-${l._id}`}
                  className="rounded-xl p-5 border space-y-3 scroll-mt-24"
                  style={{
                    background: "var(--surface)",
                    border: `1px solid ${bids.length > 0 ? "var(--accent-soft)" : "var(--border)"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold" style={{ color: "var(--ink)" }}>
                        {l.deviceName} {l.storage && `(${l.storage})`}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                        Listed {formatDate(l.createdAt)}
                      </p>
                    </div>
                    <Pill tone={status.tone}>{status.label}</Pill>
                  </div>

                  {l.status === "rejected" && l.rejectionReason && (
                    <p className="text-xs rounded-lg px-3 py-2" style={{ background: "rgba(220,38,38,0.06)", color: "#DC2626" }}>
                      Reason: {l.rejectionReason}
                    </p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: l.listingType === "swap" ? "var(--accent-soft)" : "rgba(220,38,38,0.08)",
                        color: l.listingType === "swap" ? ACCENT : "#DC2626",
                      }}
                    >
                      {l.listingType === "swap" ? (
                        <>
                          <Repeat className="w-3 h-3" /> Swap
                        </>
                      ) : (
                        <>
                          <Wallet className="w-3 h-3" /> For Sale
                        </>
                      )}
                    </span>
                    <span className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                      {formatPrice(l.estimatedMin)}
                      {l.estimatedMax && l.estimatedMax !== l.estimatedMin && (
                        <span className="font-normal" style={{ color: "var(--ink-soft)" }}>
                          {" "}
                          – {formatPrice(l.estimatedMax)}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--border)", color: "var(--ink-soft)" }}>
                      <BatteryFull className="w-3 h-3" /> {l.batteryHealth}%
                    </span>
                    {l.simType && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--border)", color: "var(--ink-soft)" }}>
                        <Signal className="w-3 h-3" /> {l.simType}
                      </span>
                    )}
                    <ListingTrustBadges listing={{ ...l, lastConfirmedAt: null }} />
                    {l.faceIdStatus === "working" && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(22,163,74,0.08)", color: "#16a34a" }}>
                        <Lock className="w-3 h-3" /> Face ID
                      </span>
                    )}
                    {l.faceIdStatus === "broken" && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626" }}>
                        <Unlock className="w-3 h-3" /> Face ID broken
                      </span>
                    )}
                    {!!l.mediaCount && l.mediaCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--accent-soft)", color: ACCENT }}>
                        <Camera className="w-3 h-3" /> {l.mediaCount}
                      </span>
                    )}
                  </div>

                  {/* Keep it live — listings need a "still available" every 30 days */}
                  {canConfirm && (
                    <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 flex-wrap" style={{ background: "var(--bg)" }}>
                      <span
                        className="inline-flex items-center gap-1 text-xs"
                        style={{ color: l.status === "expired" || dueIn <= 7 ? "#DC2626" : "var(--ink-soft)" }}
                      >
                        <Clock className="w-3 h-3" />
                        {l.status === "expired"
                          ? "Expired — off the marketplace until you confirm"
                          : `Confirmed ${timeAgo(l.lastConfirmedAt ?? l.createdAt)} · ${
                              dueIn > 0 ? `confirm again within ${dueIn} day${dueIn === 1 ? "" : "s"}` : "confirm today"
                            }`}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => confirmAvailable(l)}
                          disabled={busy === l._id}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg disabled:opacity-40"
                          style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", cursor: "pointer" }}
                        >
                          {l.status === "expired" ? <RotateCcw className="w-3 h-3" /> : <CheckCheck className="w-3 h-3" />}
                          {l.status === "expired" ? "Bring it back" : "Still available"}
                        </button>
                        {l.status === "active" && (
                          <button
                            onClick={() => markSold(l)}
                            disabled={busy === l._id}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg disabled:opacity-40"
                            style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", cursor: "pointer" }}
                          >
                            <EyeOff className="w-3 h-3" /> Mark sold
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {listingMsg?.id === l._id && (
                    <p className="text-xs" style={{ color: listingMsg.error ? "#DC2626" : "#16a34a" }}>
                      {listingMsg.text}
                    </p>
                  )}

                  {l.repairs && l.repairs.length > 0 && (
                    <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                      Repairs: {l.repairs.join(", ")}
                    </p>
                  )}

                  {l.listingType === "swap" && l.wantedDevice && (
                    <p className="text-xs" style={{ color: ACCENT }}>
                      Wants: {l.wantedDevice}
                    </p>
                  )}

                  {/* Vendor offers — the seller sees every bid */}
                  {bids.length > 0 && (
                    <div className="rounded-xl p-4 space-y-2.5" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-soft)" }}>
                      <p className="text-xs font-semibold" style={{ color: ACCENT }}>
                        Vendor Offers ({bids.length})
                      </p>
                      {[...bids]
                        .sort((a, b) => b.amount - a.amount)
                        .map((bid, i) => (
                          <div key={bid._id ?? i} className="flex justify-between items-center gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                                {bid.vendorName}
                                {i === 0 && bids.length > 1 && (
                                  <span className="ml-1.5 text-[10px] font-semibold" style={{ color: "#16a34a" }}>
                                    Highest
                                  </span>
                                )}
                              </p>
                              {bid.message && (
                                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                                  {bid.message}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold mb-1" style={{ color: ACCENT }}>
                                {formatPrice(bid.amount)}
                              </p>
                              {bid._id && l.status === "active" && (
                                <button
                                  onClick={() => handleAcceptBid(l._id, bid._id)}
                                  disabled={accepting === bid._id}
                                  className="text-xs font-semibold px-2.5 py-1 rounded-lg disabled:opacity-50"
                                  style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
                                >
                                  {accepting === bid._id ? "Accepting..." : "Accept"}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                        Accepting creates a deal under My Transactions — TechNest arranges the handover.
                      </p>
                    </div>
                  )}

                  {(l.status === "sold" || l.status === "swapped") && (
                    <button
                      onClick={() => router.push("/transactions")}
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{ color: ACCENT }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> View the deal <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            {listings.length > 0 && (
              <button
                onClick={() => router.push("/value")}
                className="w-full border text-sm font-medium py-3 rounded-xl transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--ink)" }}
              >
                + Value Another Device
              </button>
            )}
          </div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <NotificationList
            notifications={notifications}
            onRead={(id) => setNotifications((n) => n.map((x) => (x._id === id ? { ...x, read: true } : x)))}
          />
        )}
      </div>
    </div>
  );
}
