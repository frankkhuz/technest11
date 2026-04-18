"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/app/lib/helpers";

type Listing = {
  _id: string;
  userName: string;
  userPhone: string;
  deviceName: string;
  storage?: string;
  batteryHealth: string;
  simType?: string;
  faceIdStatus?: string;
  repairs: string[];
  estimatedMin: number;
  estimatedMax: number;
  mediaCount: number;
  imeiVerified: boolean;
  listingType: string;
  wantedDevice?: string;
  bids?: { vendorName: string; amount: number }[];
  status: string;
  createdAt: string;
};
type InventoryItem = {
  _id: string;
  deviceName: string;
  buyPrice: number;
  sellPrice: number;
  condition: string;
  status: string;
};
type Notification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  listingId?: string;
};
type Tab = "overview" | "leads" | "swaps" | "inventory" | "analytics";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [listings, setListings] = useState<Listing[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [bidModal, setBidModal] = useState<{
    listing: Listing | null;
    amount: string;
    message: string;
  }>({ listing: null, amount: "", message: "" });
  const [invForm, setInvForm] = useState({
    deviceName: "",
    buyPrice: "",
    sellPrice: "",
    condition: "UK Used",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      if ((session?.user as User)?.role !== "vendor") {
        router.push("/dashboard");
        return;
      }
      fetchAll();
    }
  }, [status]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [lr, ir, nr] = await Promise.all([
        fetch("/api/listings?limit=50"),
        fetch("/api/vendor/inventory"),
        fetch("/api/notifications"),
      ]);
      const ld = await lr.json();
      const id = await ir.json();
      const nd = await nr.json();
      setListings(ld.listings || []);
      setInventory(id.inventory || []);
      setNotifications(nd.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markNotifsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const placeBid = async () => {
    if (!bidModal.listing || !bidModal.amount) return;
    await fetch("/api/vendor/bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: bidModal.listing._id,
        amount: bidModal.amount,
        message: bidModal.message,
      }),
    });
    setBidModal({ listing: null, amount: "", message: "" });
    fetchAll();
  };

  const addInventory = async () => {
    if (!invForm.deviceName || !invForm.buyPrice || !invForm.sellPrice) return;
    await fetch("/api/vendor/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invForm),
    });
    setInvForm({
      deviceName: "",
      buyPrice: "",
      sellPrice: "",
      condition: "UK Used",
    });
    setShowAdd(false);
    fetchAll();
  };

  const markSold = async (id: string) => {
    await fetch("/api/vendor/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "sold" }),
    });
    fetchAll();
  };

  type User = {
    name?: string;
    email?: string;
    image?: string;
    role?: string;
    vendorStatus?: string;
  };

  const vendorStatus = (session?.user as User)?.vendorStatus;
  const cashLeads = listings.filter(
    (l) => l.listingType === "sell" && l.status === "open"
  );
  const swapLeads = listings.filter(
    (l) => l.listingType === "swap" && l.status === "open"
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

  const inp =
    "w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors";
  const inpS = { borderColor: "rgba(2,0,68,0.2)", color: "#020044" };

  if (status === "loading")
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8F8FC" }}
      >
        <p style={{ color: "#6B6B8A" }}>Loading...</p>
      </div>
    );

  const sideItem = (t: Tab, label: string, count?: number) => (
    <button
      key={t}
      onClick={() => setTab(t)}
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
          style={{ background: "#EF3F23" }}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#F8F8FC" }}>
      {/* Sidebar */}
      <div
        className="w-56 min-h-screen flex flex-col sticky top-0 h-screen"
        style={{ background: "#020044" }}
      >
        <div
          className="px-5 py-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <button
            onClick={() => router.push("/")}
            className="text-lg font-bold text-white"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Tech<span style={{ color: "#EF3F23" }}>Nest</span>
          </button>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Vendor Portal
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {sideItem("overview", "Overview")}
          {sideItem("leads", `Cash Leads`, cashLeads.length)}
          {sideItem("swaps", `Swap Requests`, swapLeads.length)}
          {sideItem("inventory", "Inventory")}
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
            {(session?.user as User)?.name}
          </p>
          {vendorStatus === "approved" && (
            <p className="text-xs px-3" style={{ color: "#4ade80" }}>
              ✓ Verified
            </p>
          )}
          {vendorStatus === "pending" && (
            <p className="text-xs px-3" style={{ color: "#fbbf24" }}>
              ⏳ Pending
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
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-1.5 text-xs rounded-lg"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b"
          style={{ background: "#fff", borderColor: "rgba(2,0,68,0.08)" }}
        >
          <h1
            className="font-bold text-lg capitalize"
            style={{
              color: "#020044",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            {tab}
          </h1>
          <div className="flex items-center gap-3">
            {vendorStatus === "pending" && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(239,63,35,0.08)", color: "#EF3F23" }}
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
                style={{ background: "rgba(2,0,68,0.04)" }}
              >
                🔔
                {unread > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    style={{ background: "#EF3F23", fontSize: "9px" }}
                  >
                    {unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div
                  className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-lg border z-50 overflow-hidden"
                  style={{ border: "1px solid rgba(2,0,68,0.1)" }}
                >
                  <div
                    className="px-4 py-3 border-b flex justify-between"
                    style={{ borderColor: "rgba(2,0,68,0.08)" }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#020044" }}
                    >
                      Notifications
                    </span>
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="text-xs"
                      style={{ color: "#6B6B8A" }}
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p
                        className="text-xs text-center py-6"
                        style={{ color: "#6B6B8A" }}
                      >
                        No notifications
                      </p>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className="px-4 py-3 border-b cursor-pointer transition-colors"
                        style={{
                          borderColor: "rgba(2,0,68,0.06)",
                          background: n.read ? "#fff" : "rgba(2,0,68,0.02)",
                        }}
                        onClick={() => {
                          setTab(
                            n.type === "new_swap_request" ? "swaps" : "leads"
                          );
                          setShowNotifs(false);
                        }}
                      >
                        <p
                          className="text-xs font-medium mb-0.5"
                          style={{ color: "#020044" }}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs" style={{ color: "#6B6B8A" }}>
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
          {vendorStatus === "pending" && (
            <div
              className="rounded-xl p-4 text-sm"
              style={{
                background: "rgba(239,63,35,0.06)",
                border: "1px solid rgba(239,63,35,0.15)",
                color: "#EF3F23",
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
                    color: "#EF3F23",
                  },
                  {
                    label: "Swap Requests",
                    val: swapLeads.length,
                    color: "#774499",
                  },
                  { label: "In Stock", val: inStock.length, color: "#020044" },
                  {
                    label: "Net Profit",
                    val: formatPrice(totalProfit),
                    color: "#16a34a",
                  },
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

              {/* Recent lead notifications */}
              {notifications
                .filter((n) => !n.read)
                .slice(0, 3)
                .map((n) => (
                  <div
                    key={n._id}
                    className="bg-white rounded-xl p-4 border flex items-start gap-3"
                    style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{
                        background:
                          n.type === "new_swap_request"
                            ? "rgba(119,68,153,0.1)"
                            : "rgba(239,63,35,0.1)",
                      }}
                    >
                      {n.type === "new_swap_request" ? "🔄" : "💰"}
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-semibold mb-0.5"
                        style={{ color: "#020044" }}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs" style={{ color: "#6B6B8A" }}>
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
                      style={{ color: "#EF3F23" }}
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
              <p className="text-sm" style={{ color: "#6B6B8A" }}>
                {cashLeads.length} sellers waiting for offers
              </p>
              {listings.filter((l) => l.listingType === "sell").length === 0 &&
                !loading && (
                  <div
                    className="bg-white rounded-xl p-12 text-center border"
                    style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                  >
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-sm" style={{ color: "#6B6B8A" }}>
                      No cash leads yet
                    </p>
                  </div>
                )}
              {listings
                .filter((l) => l.listingType === "sell")
                .map((lead) => (
                  <div
                    key={lead._id}
                    className="bg-white rounded-xl p-5 border space-y-4"
                    style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className="text-xs mb-0.5"
                          style={{ color: "#6B6B8A" }}
                        >
                          {lead.userName} •{" "}
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                        <h3
                          className="font-bold"
                          style={{
                            color: "#020044",
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
                            lead.status === "open"
                              ? "rgba(22,163,74,0.08)"
                              : "rgba(2,0,68,0.06)",
                          color: lead.status === "open" ? "#16a34a" : "#6B6B8A",
                        }}
                      >
                        {lead.status === "open" ? "Open" : lead.status}
                      </span>
                    </div>
                    <div
                      className="rounded-xl p-3 grid grid-cols-3 gap-3 text-center"
                      style={{ background: "rgba(2,0,68,0.03)" }}
                    >
                      <div>
                        <p
                          className="text-xs mb-1"
                          style={{ color: "#6B6B8A" }}
                        >
                          Buy at
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: "#020044" }}
                        >
                          {formatPrice(lead.estimatedMin)}
                        </p>
                      </div>
                      <div
                        className="border-x"
                        style={{ borderColor: "rgba(2,0,68,0.08)" }}
                      >
                        <p
                          className="text-xs mb-1"
                          style={{ color: "#6B6B8A" }}
                        >
                          Sell for ~
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: "#774499" }}
                        >
                          {formatPrice(Math.round(lead.estimatedMax * 1.2))}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-xs mb-1"
                          style={{ color: "#6B6B8A" }}
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
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(2,0,68,0.06)",
                          color: "#6B6B8A",
                        }}
                      >
                        🔋 {lead.batteryHealth}%
                      </span>
                      {lead.simType && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(2,0,68,0.06)",
                            color: "#6B6B8A",
                          }}
                        >
                          📶 {lead.simType}
                        </span>
                      )}
                      {lead.imeiVerified && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(22,163,74,0.08)",
                            color: "#16a34a",
                          }}
                        >
                          ✓ IMEI
                        </span>
                      )}
                      {lead.faceIdStatus === "working" && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(22,163,74,0.08)",
                            color: "#16a34a",
                          }}
                        >
                          🔐 Face ID
                        </span>
                      )}
                      {lead.faceIdStatus === "broken" && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(239,63,35,0.08)",
                            color: "#EF3F23",
                          }}
                        >
                          🔓 Face ID broken
                        </span>
                      )}
                      {lead.mediaCount > 0 && (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(119,68,153,0.08)",
                            color: "#774499",
                          }}
                        >
                          📸 {lead.mediaCount}
                        </span>
                      )}
                    </div>
                    {lead.repairs.length > 0 && (
                      <p className="text-xs" style={{ color: "#6B6B8A" }}>
                        Repairs: {lead.repairs.join(", ")}
                      </p>
                    )}
                    {lead.bids && lead.bids.length > 0 && (
                      <div className="space-y-1.5">
                        <p
                          className="text-xs font-medium"
                          style={{ color: "#6B6B8A" }}
                        >
                          Bids ({lead.bids.length})
                        </p>
                        {lead.bids.map(
                          (
                            bid: { vendorName: string; amount: number },
                            i: number
                          ) => (
                            <div
                              key={i}
                              className="flex justify-between text-xs px-3 py-2 rounded-lg"
                              style={{ background: "rgba(2,0,68,0.03)" }}
                            >
                              <span style={{ color: "#020044" }}>
                                {bid.vendorName}
                              </span>
                              <span
                                className="font-semibold"
                                style={{ color: "#774499" }}
                              >
                                {formatPrice(bid.amount)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {lead.status === "open" && vendorStatus === "approved" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            setBidModal({
                              listing: lead,
                              amount: String(lead.estimatedMin),
                              message: "",
                            })
                          }
                          className="flex-1 text-sm font-semibold py-2.5 rounded-xl border transition-colors"
                          style={{ borderColor: "#020044", color: "#020044" }}
                        >
                          Place Bid
                        </button>
                        <a
                          href={`https://wa.me/${lead.userPhone}?text=Hi ${
                            lead.userName
                          }, I'm interested in buying your ${
                            lead.deviceName
                          } at ${formatPrice(
                            lead.estimatedMin
                          )}. Still selling?`}
                          target="_blank"
                          className="flex-1 text-sm font-semibold py-2.5 rounded-xl text-white text-center no-underline"
                          style={{ background: "#25d366" }}
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    )}
                    {vendorStatus === "pending" && (
                      <p
                        className="text-xs text-center"
                        style={{ color: "#EF3F23" }}
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
              <p className="text-sm" style={{ color: "#6B6B8A" }}>
                {swapLeads.length} swap requests
              </p>
              {listings.filter((l) => l.listingType === "swap").length === 0 &&
                !loading && (
                  <div
                    className="bg-white rounded-xl p-12 text-center border"
                    style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                  >
                    <p className="text-3xl mb-2">🔄</p>
                    <p className="text-sm" style={{ color: "#6B6B8A" }}>
                      No swap requests yet
                    </p>
                  </div>
                )}
              {listings
                .filter((l) => l.listingType === "swap")
                .map((swap) => (
                  <div
                    key={swap._id}
                    className="bg-white rounded-xl p-5 border space-y-4"
                    style={{ border: "1px solid rgba(119,68,153,0.15)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className="text-xs mb-0.5"
                          style={{ color: "#6B6B8A" }}
                        >
                          {swap.userName} •{" "}
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "#774499" }}
                        >
                          Swap Request
                        </p>
                      </div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(119,68,153,0.08)",
                          color: "#774499",
                        }}
                      >
                        {swap.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-3 items-center">
                      <div
                        className="col-span-2 rounded-xl p-3 text-center"
                        style={{ background: "rgba(2,0,68,0.04)" }}
                      >
                        <p
                          className="text-xs mb-1"
                          style={{ color: "#6B6B8A" }}
                        >
                          Offering
                        </p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: "#020044" }}
                        >
                          {swap.deviceName}
                        </p>
                        {swap.storage && (
                          <p className="text-xs" style={{ color: "#6B6B8A" }}>
                            {swap.storage}
                          </p>
                        )}
                        <p
                          className="text-xs mt-1"
                          style={{ color: "#6B6B8A" }}
                        >
                          🔋 {swap.batteryHealth}%
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
                        <p
                          className="text-xs mb-1"
                          style={{ color: "#6B6B8A" }}
                        >
                          Wants
                        </p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: "#774499" }}
                        >
                          {swap.wantedDevice}
                        </p>
                      </div>
                    </div>
                    <div
                      className="rounded-xl p-3"
                      style={{ background: "rgba(2,0,68,0.03)" }}
                    >
                      <p
                        className="text-xs mb-0.5"
                        style={{ color: "#6B6B8A" }}
                      >
                        Their device value
                      </p>
                      <p className="font-bold" style={{ color: "#020044" }}>
                        {formatPrice(swap.estimatedMin)} –{" "}
                        {formatPrice(swap.estimatedMax)}
                      </p>
                    </div>
                    {swap.status === "open" && vendorStatus === "approved" && (
                      <a
                        href={`https://wa.me/${swap.userPhone}?text=Hi ${swap.userName}, I can swap your ${swap.deviceName} for ${swap.wantedDevice}. Let's discuss the top-up amount!`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full text-sm font-semibold py-2.5 rounded-xl text-white no-underline"
                        style={{ background: "#25d366" }}
                      >
                        💬 Discuss Swap on WhatsApp
                      </a>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* INVENTORY */}
          {tab === "inventory" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm" style={{ color: "#6B6B8A" }}>
                  {inStock.length} devices in stock
                </p>
                <button
                  onClick={() => setShowAdd(!showAdd)}
                  style={{ background: "#020044" }}
                  className="text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity"
                >
                  + Add Device
                </button>
              </div>
              {showAdd && (
                <div
                  className="bg-white rounded-xl p-5 border space-y-3"
                  style={{ border: "1px solid rgba(2,0,68,0.12)" }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#020044" }}
                  >
                    Add to Inventory
                  </p>
                  <input
                    className={inp}
                    style={inpS}
                    placeholder="Device name"
                    value={invForm.deviceName}
                    onChange={(e) =>
                      setInvForm({ ...invForm, deviceName: e.target.value })
                    }
                  />
                  <div className="flex gap-3">
                    <input
                      className={inp}
                      style={inpS}
                      type="number"
                      placeholder="Buy price (₦)"
                      value={invForm.buyPrice}
                      onChange={(e) =>
                        setInvForm({ ...invForm, buyPrice: e.target.value })
                      }
                    />
                    <input
                      className={inp}
                      style={inpS}
                      type="number"
                      placeholder="Sell price (₦)"
                      value={invForm.sellPrice}
                      onChange={(e) =>
                        setInvForm({ ...invForm, sellPrice: e.target.value })
                      }
                    />
                  </div>
                  <select
                    className={inp}
                    style={inpS}
                    value={invForm.condition}
                    onChange={(e) =>
                      setInvForm({ ...invForm, condition: e.target.value })
                    }
                  >
                    <option>UK Used</option>
                    <option>New</option>
                    <option>Refurbished</option>
                    <option>Nigerian Used</option>
                  </select>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAdd(false)}
                      className="flex-1 border text-sm font-medium py-2.5 rounded-xl"
                      style={{
                        borderColor: "rgba(2,0,68,0.2)",
                        color: "#020044",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addInventory}
                      style={{ background: "#020044" }}
                      className="flex-1 text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {inventory.map((item) => {
                  const profit = item.sellPrice - item.buyPrice;
                  const margin = Math.round((profit / item.buyPrice) * 100);
                  return (
                    <div
                      key={item._id}
                      className={`bg-white rounded-xl p-5 border space-y-3 ${
                        item.status === "sold" ? "opacity-60" : ""
                      }`}
                      style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                    >
                      <div className="flex justify-between">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "#020044" }}
                        >
                          {item.deviceName}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background:
                              item.status === "sold"
                                ? "rgba(2,0,68,0.06)"
                                : "rgba(22,163,74,0.08)",
                            color:
                              item.status === "sold" ? "#6B6B8A" : "#16a34a",
                          }}
                        >
                          {item.status === "sold" ? "Sold" : "In Stock"}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs flex-wrap">
                        <span style={{ color: "#6B6B8A" }}>
                          Bought:{" "}
                          <span
                            className="font-semibold"
                            style={{ color: "#020044" }}
                          >
                            {formatPrice(item.buyPrice)}
                          </span>
                        </span>
                        <span style={{ color: "#6B6B8A" }}>
                          Selling:{" "}
                          <span
                            className="font-semibold"
                            style={{ color: "#774499" }}
                          >
                            {formatPrice(item.sellPrice)}
                          </span>
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: profit > 0 ? "#16a34a" : "#EF3F23" }}
                        >
                          {profit > 0 ? "+" : ""}
                          {formatPrice(profit)} ({margin}%)
                        </span>
                      </div>
                      {item.status === "in_stock" && (
                        <button
                          onClick={() => markSold(item._id)}
                          className="w-full border text-xs py-2 rounded-xl transition-colors"
                          style={{
                            borderColor: "rgba(2,0,68,0.12)",
                            color: "#6B6B8A",
                          }}
                        >
                          Mark as Sold
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {tab === "analytics" && (
            <div className="space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Total Invested",
                    val: formatPrice(totalBought),
                    color: "#020044",
                  },
                  {
                    label: "Total Revenue",
                    val: formatPrice(totalRevenue),
                    color: "#774499",
                  },
                  {
                    label: "Net Profit",
                    val: formatPrice(totalProfit),
                    color: totalProfit >= 0 ? "#16a34a" : "#EF3F23",
                  },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    className="bg-white rounded-xl p-5 border"
                    style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                  >
                    <p className="text-xs mb-2" style={{ color: "#6B6B8A" }}>
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
                  className="bg-white rounded-xl p-5 border"
                  style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                >
                  <p
                    className="font-semibold mb-4 text-sm"
                    style={{ color: "#020044" }}
                  >
                    Best Performers
                  </p>
                  {soldItems.length === 0 ? (
                    <p className="text-sm" style={{ color: "#6B6B8A" }}>
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
                              style={{ color: "#020044" }}
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
                  className="bg-white rounded-xl p-5 border"
                  style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                >
                  <p
                    className="font-semibold mb-4 text-sm"
                    style={{ color: "#020044" }}
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
                        <span style={{ color: "#6B6B8A" }}>{label}</span>
                        <span
                          className="font-semibold"
                          style={{ color: "#020044" }}
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

      {/* Bid Modal */}
      {bidModal.listing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(2,0,68,0.6)" }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3
                  className="font-bold text-lg"
                  style={{
                    color: "#020044",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  Place a Bid
                </h3>
                <p className="text-sm mt-0.5" style={{ color: "#6B6B8A" }}>
                  {bidModal.listing.deviceName}
                </p>
              </div>
              <button
                onClick={() =>
                  setBidModal({ listing: null, amount: "", message: "" })
                }
                className="text-xl"
                style={{ color: "#6B6B8A" }}
              >
                ×
              </button>
            </div>
            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: "rgba(2,0,68,0.04)" }}
            >
              <span style={{ color: "#6B6B8A" }}>Seller asking: </span>
              <span className="font-bold" style={{ color: "#020044" }}>
                {formatPrice(bidModal.listing.estimatedMin)} –{" "}
                {formatPrice(bidModal.listing.estimatedMax)}
              </span>
            </div>
            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "#020044" }}
              >
                Your Offer (₦)
              </label>
              <input
                type="number"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
                style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
                value={bidModal.amount}
                onChange={(e) =>
                  setBidModal((b) => ({ ...b, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "#020044" }}
              >
                Message (optional)
              </label>
              <textarea
                rows={2}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
                placeholder="e.g. Ready to pick up today"
                value={bidModal.message}
                onChange={(e) =>
                  setBidModal((b) => ({ ...b, message: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setBidModal({ listing: null, amount: "", message: "" })
                }
                className="flex-1 border text-sm font-medium py-3 rounded-xl"
                style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
              >
                Cancel
              </button>
              <button
                onClick={placeBid}
                style={{ background: "#020044" }}
                className="flex-1 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
