"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Smartphone,
  Repeat,
  Wallet,
  BatteryFull,
  Bell,
  Megaphone,
  Signal,
  Lock,
  Unlock,
  Camera,
  CheckCircle2,
  User as UserIcon,
  Mail,
} from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import Navbar from "@/app/component/layout/Navbar";

type Bid = { vendorName: string; amount: number; message?: string };
type Listing = {
  _id: string;
  deviceName: string;
  storage?: string;
  batteryHealth: string;
  simType?: string;
  faceIdStatus?: string;
  repairs?: string[];
  mediaCount?: number;
  imeiVerified?: boolean;
  estimatedMin: number;
  estimatedMax: number;
  listingType: string;
  wantedDevice?: string;
  bids?: Bid[];
  status: string;
  createdAt: string;
};
type Notification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const ACCENT = "#C2542D";

export default function BuyerDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  const [listings, setListings] = useState<Listing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<"listings" | "notifications">("listings");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login?from=/user");
      return;
    }
    fetchAll();
  }, [isLoading, isAuthenticated]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [lr, nr] = await Promise.all([
        apiFetch("/api/listings/mine"),
        apiFetch("/api/notifications"),
      ]);
      const ld = await lr.json();
      const nd = await nr.json();
      setListings(ld.data?.listings ?? ld.listings ?? []);
      setNotifications(nd.data?.notifications ?? nd.notifications ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async () => {
    await apiFetch("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const unread = notifications.filter((n) => !n.read).length;
  const openListings = listings.filter((l) => l.status === "open").length;
  const withOffers = listings.filter(
    (l) => l.status === "offer_received" || (l.bids && l.bids.length > 0)
  ).length;

  if (isLoading || loading)
    return (
      <div className="min-h-screen" style={{ background: "#18131A" }}>
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen" style={{ background: "#18131A" }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{
                color: "#fff",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              My Dashboard
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Welcome back, {user?.name?.split(" ")[0]}
            </p>
          </div>
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: "#fff", border: "1px solid rgba(2,0,68,0.08)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(194, 84, 45,0.1)", color: ACCENT }}
            >
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <p
                className="text-sm font-semibold leading-tight"
                style={{ color: "#020044" }}
              >
                {user?.name}
              </p>
              <p
                className="inline-flex items-center gap-1 text-xs leading-tight"
                style={{ color: "#6B6B8A" }}
              >
                <Mail className="w-3 h-3" /> {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Listings", val: openListings, color: "#020044" },
            { label: "Offers Received", val: withOffers, color: ACCENT },
            { label: "Unread Notifs", val: unread, color: "#DC2626" },
          ].map(({ label, val, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-4 border"
              style={{ border: "1px solid rgba(2,0,68,0.08)" }}
            >
              <p className="text-xs mb-1" style={{ color: "#6B6B8A" }}>
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

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          {[
            { t: "listings", label: "My Listings" },
            {
              t: "notifications",
              label: `Notifications${unread > 0 ? ` (${unread})` : ""}`,
            },
          ].map(({ t, label }) => (
            <button
              key={t}
              onClick={() => {
                setTab(t as "listings" | "notifications");
                if (t === "notifications") markRead();
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t ? "#C2542D" : "transparent",
                color: tab === t ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {tab === "listings" && (
          <div className="space-y-4">
            {listings.length === 0 && !loading && (
              <div
                className="bg-white rounded-xl p-12 text-center border"
                style={{ border: "1px solid rgba(2,0,68,0.08)" }}
              >
                <Smartphone
                  className="w-9 h-9 mx-auto mb-3"
                  style={{ color: "#6B6B8A" }}
                />
                <p
                  className="font-semibold mb-1"
                  style={{
                    color: "#020044",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  No listings yet
                </p>
                <p className="text-sm mb-5" style={{ color: "#6B6B8A" }}>
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
            {listings.map((l) => (
              <div
                key={l._id}
                className="bg-white rounded-xl p-5 border space-y-3"
                style={{
                  border: `1px solid ${
                    l.bids && l.bids.length > 0
                      ? "rgba(194, 84, 45,0.25)"
                      : "rgba(2,0,68,0.08)"
                  }`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold" style={{ color: "#020044" }}>
                      {l.deviceName} {l.storage && `(${l.storage})`}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "#6B6B8A" }}>
                      Listed {new Date(l.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background:
                        l.status === "open"
                          ? "rgba(22,163,74,0.08)"
                          : "rgba(194, 84, 45,0.08)",
                      color: l.status === "open" ? "#16a34a" : ACCENT,
                    }}
                  >
                    {l.status === "open" ? "Open" : "Offer received"}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background:
                        l.listingType === "swap"
                          ? "rgba(194, 84, 45,0.08)"
                          : "rgba(220,38,38,0.08)",
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
                  <span
                    className="font-semibold text-sm"
                    style={{ color: "#020044" }}
                  >
                    {formatPrice(l.estimatedMin)}
                    {l.estimatedMax && l.estimatedMax !== l.estimatedMin && (
                      <span className="font-normal" style={{ color: "#6B6B8A" }}>
                        {" "}
                        – {formatPrice(l.estimatedMax)}
                      </span>
                    )}
                  </span>
                </div>

                {/* Detailed device condition badges */}
                <div className="flex gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(2,0,68,0.06)", color: "#6B6B8A" }}
                  >
                    <BatteryFull className="w-3 h-3" /> {l.batteryHealth}%
                  </span>
                  {l.simType && (
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(2,0,68,0.06)", color: "#6B6B8A" }}
                    >
                      <Signal className="w-3 h-3" /> {l.simType}
                    </span>
                  )}
                  {l.imeiVerified && (
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(22,163,74,0.08)",
                        color: "#16a34a",
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" /> IMEI verified
                    </span>
                  )}
                  {l.faceIdStatus === "working" && (
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
                  {l.faceIdStatus === "broken" && (
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
                  {!!l.mediaCount && l.mediaCount > 0 && (
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(194, 84, 45,0.08)",
                        color: ACCENT,
                      }}
                    >
                      <Camera className="w-3 h-3" /> {l.mediaCount}
                    </span>
                  )}
                </div>

                {l.repairs && l.repairs.length > 0 && (
                  <p className="text-xs" style={{ color: "#6B6B8A" }}>
                    Repairs: {l.repairs.join(", ")}
                  </p>
                )}

                {l.listingType === "swap" && l.wantedDevice && (
                  <p className="text-xs" style={{ color: ACCENT }}>
                    Wants: {l.wantedDevice}
                  </p>
                )}

                {/* Bids/Offers */}
                {l.bids && l.bids.length > 0 && (
                  <div
                    className="rounded-xl p-4 space-y-2.5"
                    style={{
                      background: "rgba(194, 84, 45,0.05)",
                      border: "1px solid rgba(194, 84, 45,0.12)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: ACCENT }}
                    >
                      Vendor Offers ({l.bids.length})
                    </p>
                    {l.bids.map((bid: Bid, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "#020044" }}
                          >
                            {bid.vendorName}
                          </p>
                          {bid.message && (
                            <p className="text-xs" style={{ color: "#6B6B8A" }}>
                              {bid.message}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: ACCENT }}>
                            {formatPrice(bid.amount)}
                          </p>
                          <a
                            href={`https://wa.me/?text=Hi ${
                              bid.vendorName
                            }, I'm responding to your offer of ${formatPrice(
                              bid.amount
                            )} for my ${l.deviceName}`}
                            target="_blank"
                            className="text-xs no-underline"
                            style={{ color: ACCENT }}
                          >
                            Reply →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {listings.length > 0 && (
              <button
                onClick={() => router.push("/value")}
                className="w-full border text-sm font-medium py-3 rounded-xl transition-colors"
                style={{ borderColor: "rgba(2,0,68,0.15)", color: "#020044" }}
              >
                + Value Another Device
              </button>
            )}
          </div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <div className="space-y-3">
            {notifications.length === 0 && (
              <div
                className="bg-white rounded-xl p-12 text-center border"
                style={{ border: "1px solid rgba(2,0,68,0.08)" }}
              >
                <Bell
                  className="w-8 h-8 mx-auto mb-2"
                  style={{ color: "#6B6B8A" }}
                />
                <p className="text-sm" style={{ color: "#6B6B8A" }}>
                  No notifications yet
                </p>
              </div>
            )}
            {notifications.map((n) => (
              <div
                key={n._id}
                className="bg-white rounded-xl p-4 border flex gap-3"
                style={{
                  border: "1px solid rgba(2,0,68,0.08)",
                  background: n.read ? "#fff" : "rgba(2,0,68,0.015)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      n.type === "bid_placed"
                        ? "rgba(194, 84, 45,0.1)"
                        : "rgba(220,38,38,0.1)",
                    color:
                      n.type === "bid_placed" || n.type === "new_swap_request"
                        ? ACCENT
                        : "#DC2626",
                  }}
                >
                  {n.type === "bid_placed" ? (
                    <Wallet className="w-4 h-4" />
                  ) : n.type === "new_swap_request" ? (
                    <Repeat className="w-4 h-4" />
                  ) : (
                    <Megaphone className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-medium mb-0.5"
                    style={{ color: "#020044" }}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs" style={{ color: "#6B6B8A" }}>
                    {n.message}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "rgba(2,0,68,0.3)" }}
                  >
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!n.read && (
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: "#DC2626" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
