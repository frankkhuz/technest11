"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/app/lib/helpers";

type Bid = { vendorName: string; amount: number; message?: string };
type Listing = {
  _id: string;
  deviceName: string;
  storage?: string;
  batteryHealth: string;
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

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<"listings" | "notifications">("listings");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      if ((session?.user as { role: string })?.role === "vendor") {
        router.push("/vendor/dashboard");
        return;
      }
      fetchAll();
    }
  }, [status]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [lr, nr] = await Promise.all([
        fetch("/api/listings/mine"),
        fetch("/api/notifications"),
      ]);
      const ld = await lr.json();
      const nd = await nr.json();
      setListings(ld.listings || []);
      setNotifications(nd.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const unread = notifications.filter((n) => !n.read).length;
  const openListings = listings.filter((l) => l.status === "open").length;
  const withOffers = listings.filter(
    (l) => l.status === "offer_received" || (l.bids && l.bids.length > 0)
  ).length;

  if (status === "loading")
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8F8FC" }}
      >
        <p style={{ color: "#6B6B8A" }}>Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
      <nav
        style={{ background: "#020044" }}
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-50"
      >
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold text-white"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          Tech<span style={{ color: "#EF3F23" }}>Nest</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/marketplace")}
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Marketplace
          </button>
          <button
            onClick={() => router.push("/value")}
            style={{ background: "#EF3F23" }}
            className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity"
          >
            + Sell / Swap
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{
              color: "#020044",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            My Dashboard
          </h1>
          <p className="text-sm" style={{ color: "#6B6B8A" }}>
            Welcome back, {session?.user?.name as string}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Listings", val: openListings, color: "#020044" },
            { label: "Offers Received", val: withOffers, color: "#774499" },
            { label: "Unread Notifs", val: unread, color: "#EF3F23" },
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
          style={{ background: "rgba(2,0,68,0.06)" }}
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
                background: tab === t ? "#020044" : "transparent",
                color: tab === t ? "#fff" : "#6B6B8A",
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
                <p className="text-4xl mb-3">📱</p>
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
                  style={{ background: "#EF3F23" }}
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
                      ? "rgba(119,68,153,0.25)"
                      : "rgba(2,0,68,0.08)"
                  }`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold" style={{ color: "#020044" }}>
                      {l.deviceName} {l.storage && `(${l.storage})`}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "#6B6B8A" }}>
                      {new Date(l.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background:
                        l.status === "open"
                          ? "rgba(22,163,74,0.08)"
                          : "rgba(119,68,153,0.08)",
                      color: l.status === "open" ? "#16a34a" : "#774499",
                    }}
                  >
                    {l.status === "open" ? "Open" : "Offer received"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background:
                        l.listingType === "swap"
                          ? "rgba(119,68,153,0.08)"
                          : "rgba(239,63,35,0.08)",
                      color: l.listingType === "swap" ? "#774499" : "#EF3F23",
                    }}
                  >
                    {l.listingType === "swap" ? "🔄 Swap" : "💰 For Sale"}
                  </span>
                  <span className="text-xs" style={{ color: "#6B6B8A" }}>
                    🔋 {l.batteryHealth}%
                  </span>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: "#020044" }}
                  >
                    {formatPrice(l.estimatedMin)}
                  </span>
                </div>
                {l.listingType === "swap" && l.wantedDevice && (
                  <p className="text-xs" style={{ color: "#774499" }}>
                    Wants: {l.wantedDevice}
                  </p>
                )}

                {/* Bids/Offers */}
                {l.bids && l.bids.length > 0 && (
                  <div
                    className="rounded-xl p-4 space-y-2.5"
                    style={{
                      background: "rgba(119,68,153,0.05)",
                      border: "1px solid rgba(119,68,153,0.12)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "#774499" }}
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
                          <p className="font-bold" style={{ color: "#774499" }}>
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
                            style={{ color: "#EF3F23" }}
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
                <p className="text-3xl mb-2">🔔</p>
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
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{
                    background:
                      n.type === "bid_placed"
                        ? "rgba(119,68,153,0.1)"
                        : "rgba(239,63,35,0.1)",
                  }}
                >
                  {n.type === "bid_placed"
                    ? "💰"
                    : n.type === "new_swap_request"
                    ? "🔄"
                    : "📢"}
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
                    style={{ background: "#EF3F23" }}
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
