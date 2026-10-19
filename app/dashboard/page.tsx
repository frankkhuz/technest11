"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Bell,
  Repeat,
  Wallet,
  Inbox,
  BatteryFull,
  Signal,
  Lock,
  Unlock,
  Camera,
  HandCoins,
  Menu,
  X,
} from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import { apiFetch, apiJson } from "@/app/lib/api";
import { userIdOf } from "@/app/lib/auth";
import { notificationHref, type AppNotification } from "@/app/lib/notifications";
import type { MarketListing } from "@/app/types/backend";
import VendorBidModal from "@/app/component/shared/VendorBidModal";
import { OfferCount } from "@/app/component/shared/ListingBadges";
import VendorRequestsInbox from "@/app/component/vendor/VendorRequestsInbox";
import VendorStock from "@/app/component/vendor/VendorStock";
import VendorCommissions from "@/app/component/vendor/VendorCommissions";
import RatingsPanel from "@/app/component/shared/RatingsPanel";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { ThemeToggle } from "@/app/component/layout/Navbar";
import { PageSkeleton } from "@/app/component/ui/Skeleton";

type Listing = MarketListing;
type InventoryItem = {
  _id: string;
  deviceName: string;
  buyPrice: number;
  sellPrice: number;
  condition: string;
  status: string;
};
type Notification = AppNotification;
type Tab =
  | "overview"
  | "requests"
  | "leads"
  | "swaps"
  | "inventory"
  | "commission"
  | "ratings"
  | "analytics";

export default function VendorDashboard() {
  const router = useRouter();
  const { dark, toggle } = useTheme();

  const { user, isLoading, signOut } = useAuth();
  const userName: string | undefined = user?.name;
const isVerified: boolean = !!user?.vendorVerified;
  const isAuthenticated = !!user;

  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bidListing, setBidListing] = useState<Listing | null>(null);
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user?.userType !== "vendor") {
      router.push("/dashboard");
      return;
    }
    fetchAll();
  }, [isLoading, isAuthenticated]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [lr, ir, nr] = await Promise.all([
        apiJson<{ listings: Listing[] }>("/api/listings?limit=100&sort=newest"),
        apiJson<{ inventory?: InventoryItem[]; items?: InventoryItem[] }>("/api/vendor/inventory"),
        apiJson<{ notifications: Notification[] }>("/api/notifications"),
      ]);
      setListings(lr.data?.listings ?? []);
      setInventory(ir.data?.inventory ?? ir.data?.items ?? []);
      setNotifications(nr.data?.notifications ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markNotifsRead = async () => {
    await apiFetch("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  // Public listings come back active; reserved ones are held for a buyer.
  const cashLeads = listings.filter(
    (l) => l.listingType === "sell" && l.status === "active" && !l.isReserved
  );
  const swapLeads = listings.filter(
    (l) => l.listingType === "swap" && l.status === "active" && !l.isReserved
  );
  const inStock = inventory.filter((i) => i.status === "in_stock");
  const soldItems = inventory.filter((i) => i.status === "sold");
  const totalProfit = soldItems.reduce(
    (a, i) => a + (i.sellPrice - i.buyPrice),
    0
  );
  const totalBought = inventory.reduce((a, i) => a + i.buyPrice, 0);
  const totalRevenue = soldItems.reduce((a, i) => a + i.sellPrice, 0);
  const unread = notifications.filter((n) => !n.read).length;

  if (isLoading)
    return (
      <div className="min-h-screen transition-colors duration-300" style={{ background: "var(--bg)" }}>
        <PageSkeleton />
      </div>
    );

  const sideItem = (t: Tab, label: string, count?: number) => (
    <button
      key={t}
      onClick={() => {
        setTab(t);
        setSidebarOpen(false);
      }}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left"
      style={{
        background: tab === t ? "rgba(255,255,255,0.1)" : "transparent",
        color: tab === t ? "#fff" : "rgba(255,255,255,0.5)",
        fontWeight: tab === t ? 600 : 400,
      }}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold"
          style={{ background: "#DC2626" }}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      {/* Sidebar backdrop (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 md:w-56 min-h-screen flex flex-col fixed md:sticky top-0 h-screen z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{ background: "#020044" }}
      >
        <div
          className="px-5 py-5 border-b flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div>
            <button
              onClick={() => router.push("/")}
              className="text-lg font-bold text-white"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Tech<span style={{ color: "var(--accent)" }}>Nest</span>
            </button>
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Vendor Portal
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ color: "rgba(255,255,255,0.6)" }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {sideItem("overview", "Overview")}
          {sideItem("requests", "Customer Requests")}
          {sideItem("leads", `Cash Leads`, cashLeads.length)}
          {sideItem("swaps", `Swap Requests`, swapLeads.length)}
          {sideItem("inventory", "Stock")}
          {sideItem("commission", "Commission")}
          {sideItem("ratings", "My Ratings")}
          {sideItem("analytics", "Analytics")}
        </nav>
        <div
          className="px-3 py-4 border-t space-y-2"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <p
            className="text-xs px-3"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {userName}
          </p>
          {isVerified ? (
            <p
              className="inline-flex items-center gap-1 text-xs px-3"
              style={{ color: "#4ade80" }}
            >
              <CheckCircle2 className="w-3 h-3" /> Verified
            </p>
          ) : (
            <p
              className="inline-flex items-center gap-1 text-xs px-3"
              style={{ color: "#fbbf24" }}
            >
              <Clock className="w-3 h-3" /> Pending
            </p>
          )}
          <button
            onClick={() => router.push("/")}
            className="w-full text-left px-3 py-1.5 text-xs rounded-lg"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            ← Marketplace
          </button>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-3 py-1.5 text-xs rounded-lg"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 px-4 sm:px-6 py-4 flex items-center justify-between border-b gap-2"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg"
              style={{ background: "var(--border)", color: "var(--ink)" }}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1
              className="font-bold text-lg capitalize truncate"
              style={{
                color: "var(--ink)",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              {tab === "inventory" ? "Stock" : tab === "requests" ? "Customer requests" : tab}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle dark={dark} onToggle={toggle} size="w-8 h-8" />
            {!isVerified && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(217,119,6,0.1)", color: "#d97706" }}
              >
                Pending approval
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs) markNotifsRead();
                }}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "var(--border)", color: "var(--ink)" }}
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    style={{ background: "#DC2626", fontSize: "9px" }}
                  >
                    {unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div
                  className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-16 sm:top-11 sm:w-80 rounded-xl shadow-lg border z-50 overflow-hidden"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="px-4 py-3 border-b flex justify-between"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--ink)" }}
                    >
                      Notifications
                    </span>
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="text-xs"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p
                        className="text-xs text-center py-6"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        No notifications
                      </p>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className="px-4 py-3 border-b cursor-pointer transition-colors"
                        style={{
                          borderColor: "var(--border)",
                          background: n.read ? "var(--surface)" : "var(--border)",
                        }}
                        onClick={() => {
                          setShowNotifs(false);
                          const href = notificationHref(n, { userType: "vendor" });
                          if (n.type === "new_swap_request") setTab("swaps");
                          else if (n.type === "new_cash_listing") setTab("leads");
                          else if (["device_request", "offer_accepted", "offer_update"].includes(n.type)) setTab("requests");
                          else if (href && href !== "/dashboard") router.push(href);
                        }}
                      >
                        <p
                          className="text-xs font-medium mb-0.5"
                          style={{ color: "var(--ink)" }}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {!isVerified && (
            <div
              className="rounded-xl p-4 text-sm"
              style={{
                background: "rgba(217,119,6,0.08)",
                border: "1px solid rgba(217,119,6,0.2)",
                color: "#d97706",
              }}
            >
              Account under review — you can browse leads but cannot make offers
              until approved (within 24 hours).
            </div>
          )}

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Cash Leads",
                    val: cashLeads.length,
                    color: "#DC2626",
                  },
                  {
                    label: "Swap Requests",
                    val: swapLeads.length,
                    color: "var(--accent)",
                  },
                  { label: "In Stock", val: inStock.length, color: "var(--ink)" },
                  {
                    label: "Net Profit",
                    val: formatPrice(totalProfit),
                    color: "#16a34a",
                  },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    className="rounded-xl p-4 border"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "var(--ink-soft)" }}>
                      {label}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color, fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {val}
                    </p>
                  </div>
                ))}
              </div>
              {notifications
                .filter((n) => !n.read)
                .slice(0, 3)
                .map((n) => (
                  <div
                    key={n._id}
                    className="rounded-xl p-4 border flex items-start gap-3"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          n.type === "new_swap_request"
                            ? "var(--accent-soft)"
                            : "rgba(220,38,38,0.1)",
                        color:
                          n.type === "new_swap_request"
                            ? "var(--accent)"
                            : "#DC2626",
                      }}
                    >
                      {n.type === "new_swap_request" ? (
                        <Repeat className="w-4 h-4" />
                      ) : (
                        <Wallet className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-semibold mb-0.5"
                        style={{ color: "var(--ink)" }}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                        {n.message}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setTab(
                          n.type === "new_swap_request" ? "swaps" : "leads"
                        )
                      }
                      className="text-xs font-medium flex-shrink-0"
                      style={{ color: "#DC2626" }}
                    >
                      View →
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* CASH LEADS */}
          {tab === "leads" && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {cashLeads.length} sellers waiting for offers
              </p>
              {listings.filter((l) => l.listingType === "sell").length === 0 &&
                !loading && (
                  <div
                    className="rounded-xl p-12 text-center border"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <Inbox
                      className="w-8 h-8 mx-auto mb-2"
                      style={{ color: "var(--ink-soft)" }}
                    />
                    <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                      No cash leads yet
                    </p>
                  </div>
                )}
              {listings
                .filter((l) => l.listingType === "sell")
                .map((lead) => (
                  <div
                    key={lead._id}
                    className="rounded-xl p-5 border space-y-4"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className="text-xs mb-0.5"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          {lead.userName} •{" "}
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                        <h3
                          className="font-bold"
                          style={{
                            color: "var(--ink)",
                            fontFamily: "Space Grotesk, sans-serif",
                          }}
                        >
                          {lead.deviceName}{" "}
                          {lead.storage && `(${lead.storage})`}
                        </h3>
                      </div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background:
                            lead.status === "active"
                              ? "rgba(22,163,74,0.08)"
                              : "var(--border)",
                          color: lead.status === "active" ? "#16a34a" : "var(--ink-soft)",
                        }}
                      >
                        {lead.isReserved ? "Reserved" : lead.status === "active" ? "Open" : lead.status}
                      </span>
                    </div>
                    <div
                      className="rounded-xl p-3 grid grid-cols-3 gap-3 text-center"
                      style={{ background: "var(--border)" }}
                    >
                      <div>
                        <p
                          className="text-xs mb-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Buy at
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: "var(--ink)" }}
                        >
                          {formatPrice(lead.estimatedMin)}
                        </p>
                      </div>
                      <div
                        className="border-x"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <p
                          className="text-xs mb-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Sell for ~
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: "var(--accent)" }}
                        >
                          {formatPrice(Math.round(lead.estimatedMax * 1.2))}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-xs mb-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Est. profit
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: "#16a34a" }}
                        >
                          {formatPrice(
                            Math.round(lead.estimatedMax * 1.2) -
                              lead.estimatedMin
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: "var(--border)",
                          color: "var(--ink-soft)",
                        }}
                      >
                        <BatteryFull className="w-3 h-3" /> {lead.batteryHealth}%
                      </span>
                      {lead.simType && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "var(--border)",
                            color: "var(--ink-soft)",
                          }}
                        >
                          <Signal className="w-3 h-3" /> {lead.simType}
                        </span>
                      )}
                      {lead.imeiVerified && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(22,163,74,0.08)",
                            color: "#16a34a",
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3" /> IMEI
                        </span>
                      )}
                      {lead.faceIdStatus === "working" && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(22,163,74,0.08)",
                            color: "#16a34a",
                          }}
                        >
                          <Lock className="w-3 h-3" /> Face ID
                        </span>
                      )}
                      {lead.faceIdStatus === "broken" && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(220,38,38,0.08)",
                            color: "#DC2626",
                          }}
                        >
                          <Unlock className="w-3 h-3" /> Face ID broken
                        </span>
                      )}
                      {lead.mediaCount > 0 && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                          }}
                        >
                          <Camera className="w-3 h-3" /> {lead.mediaCount}
                        </span>
                      )}
                    </div>
                    {lead.repairs.length > 0 && (
                      <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                        Repairs: {lead.repairs.join(", ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <OfferCount count={lead.bidCount} />
                      {lead.bids?.[0] && (
                        <span className="text-xs" style={{ color: "var(--ink)" }}>
                          Your offer: <strong style={{ color: "var(--accent)" }}>{formatPrice(lead.bids[0].amount)}</strong>
                        </span>
                      )}
                    </div>
                    {lead.status === "active" && !lead.isReserved && isVerified && (
                      <button
                        onClick={() => setBidListing(lead)}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        <HandCoins className="w-4 h-4" /> {lead.bids?.[0] ? "Update Offer" : "Make an Offer"}
                      </button>
                    )}
                    {!isVerified && (
                      <p
                        className="text-xs text-center"
                        style={{ color: "#DC2626" }}
                      >
                        Awaiting approval
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* SWAPS */}
          {tab === "swaps" && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {swapLeads.length} swap requests
              </p>
              {listings.filter((l) => l.listingType === "swap").length === 0 &&
                !loading && (
                  <div
                    className="rounded-xl p-12 text-center border"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <Repeat
                      className="w-8 h-8 mx-auto mb-2"
                      style={{ color: "var(--ink-soft)" }}
                    />
                    <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                      No swap requests yet
                    </p>
                  </div>
                )}
              {listings
                .filter((l) => l.listingType === "swap")
                .map((swap) => (
                  <div
                    key={swap._id}
                    className="rounded-xl p-5 border space-y-4"
                    style={{ background: "var(--surface)", border: "1px solid var(--accent-soft)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className="text-xs mb-0.5"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          {swap.userName} •{" "}
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--accent)" }}
                        >
                          Swap Request
                        </p>
                      </div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                        }}
                      >
                        {swap.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-3 items-center">
                      <div
                        className="col-span-2 rounded-xl p-3 text-center"
                        style={{ background: "var(--border)" }}
                      >
                        <p
                          className="text-xs mb-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Offering
                        </p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: "var(--ink)" }}
                        >
                          {swap.deviceName}
                        </p>
                        {swap.storage && (
                          <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                            {swap.storage}
                          </p>
                        )}
                        <p
                          className="inline-flex items-center gap-1 text-xs mt-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          <BatteryFull className="w-3 h-3" /> {swap.batteryHealth}%
                        </p>
                      </div>
                      <div
                        className="flex items-center justify-center"
                        style={{ color: "var(--accent)" }}
                      >
                        <Repeat className="w-5 h-5" />
                      </div>
                      <div
                        className="col-span-2 rounded-xl p-3 text-center"
                        style={{ background: "var(--accent-soft)" }}
                      >
                        <p
                          className="text-xs mb-1"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Wants
                        </p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: "var(--accent)" }}
                        >
                          {swap.wantedDevice}
                        </p>
                      </div>
                    </div>
                    <div
                      className="rounded-xl p-3"
                      style={{ background: "var(--border)" }}
                    >
                      <p
                        className="text-xs mb-0.5"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        Their device value
                      </p>
                      <p className="font-bold" style={{ color: "var(--ink)" }}>
                        {formatPrice(swap.estimatedMin)} –{" "}
                        {formatPrice(swap.estimatedMax)}
                      </p>
                    </div>
                    <OfferCount count={swap.bidCount} />
                    {swap.status === "active" && !swap.isReserved && isVerified && (
                      <button
                        onClick={() => setBidListing(swap)}
                        className="flex items-center justify-center gap-2 w-full text-sm font-semibold py-2.5 rounded-xl text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        <HandCoins className="w-4 h-4" /> {swap.bids?.[0] ? "Update Offer" : "Make a Swap Offer"}
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}

          {tab === "requests" && <VendorRequestsInbox />}

          {/* STOCK */}
          {tab === "inventory" && <VendorStock />}

          {tab === "commission" && <VendorCommissions />}

          {tab === "ratings" && user && <RatingsPanel userId={userIdOf(user)} canReply />}

          {/* ANALYTICS */}
          {tab === "analytics" && (
            <div className="space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Total Invested",
                    val: formatPrice(totalBought),
                    color: "var(--ink)",
                  },
                  {
                    label: "Total Revenue",
                    val: formatPrice(totalRevenue),
                    color: "var(--accent)",
                  },
                  {
                    label: "Net Profit",
                    val: formatPrice(totalProfit),
                    color: totalProfit >= 0 ? "#16a34a" : "#DC2626",
                  },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    className="rounded-xl p-5 border"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <p className="text-xs mb-2" style={{ color: "var(--ink-soft)" }}>
                      {label}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color, fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {val}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div
                  className="rounded-xl p-5 border"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <p
                    className="font-semibold mb-4 text-sm"
                    style={{ color: "var(--ink)" }}
                  >
                    Best Performers
                  </p>
                  {soldItems.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                      No sold devices yet
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {soldItems
                        .sort(
                          (a, b) =>
                            b.sellPrice -
                            b.buyPrice -
                            (a.sellPrice - a.buyPrice)
                        )
                        .slice(0, 5)
                        .map((item) => (
                          <div
                            key={item._id}
                            className="flex justify-between text-sm"
                          >
                            <span
                              className="truncate mr-2"
                              style={{ color: "var(--ink)" }}
                            >
                              {item.deviceName}
                            </span>
                            <span
                              className="font-semibold whitespace-nowrap"
                              style={{ color: "#16a34a" }}
                            >
                              +{formatPrice(item.sellPrice - item.buyPrice)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div
                  className="rounded-xl p-5 border"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <p
                    className="font-semibold mb-4 text-sm"
                    style={{ color: "var(--ink)" }}
                  >
                    Summary
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Total devices", val: inventory.length },
                      { label: "In stock", val: inStock.length },
                      { label: "Sold", val: soldItems.length },
                      { label: "Cash leads", val: cashLeads.length },
                      { label: "Swap requests", val: swapLeads.length },
                      {
                        label: "Avg profit/sale",
                        val:
                          soldItems.length > 0
                            ? formatPrice(
                                Math.round(totalProfit / soldItems.length)
                              )
                            : "—",
                      },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span style={{ color: "var(--ink-soft)" }}>{label}</span>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--ink)" }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {bidListing && (
        <VendorBidModal listing={bidListing} onClose={() => setBidListing(null)} onPlaced={fetchAll} />
      )}
    </div>
  );
}
