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
  MessageCircle,
  UploadCloud,
  Plus,
  Trash2,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import { apiFetch } from "@/app/lib/api";
import {
  NIGERIA_PHONE_REGEX,
  NIGERIA_PHONE_TITLE,
  isValidNigerianPhone,
} from "@/app/lib/validation";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { ThemeToggle } from "@/app/component/layout/Navbar";

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
type Tab = "overview" | "leads" | "swaps" | "inventory" | "bulk" | "analytics";

type BulkRow = {
  deviceName: string;
  storage: string;
  category: "phone" | "laptop";
  priceMin: string;
  priceMax: string;
  batteryHealth: string;
};

const emptyBulkRow = (): BulkRow => ({
  deviceName: "",
  storage: "",
  category: "phone",
  priceMin: "",
  priceMax: "",
  batteryHealth: "100",
});

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
  const [bulkPhone, setBulkPhone] = useState("");
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    emptyBulkRow(),
    emptyBulkRow(),
    emptyBulkRow(),
  ]);
  const [bulkPublishing, setBulkPublishing] = useState(false);
  const [bulkPhoneError, setBulkPhoneError] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    published: number;
    failed: number;
  } | null>(null);

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
    await apiFetch("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const placeBid = async () => {
    if (!bidModal.listing || !bidModal.amount) return;
    await apiFetch("/api/vendor/bid", {
      method: "POST",
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
    await apiFetch("/api/vendor/inventory", {
      method: "POST",
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
    await apiFetch("/api/vendor/inventory", {
      method: "PATCH",
      body: JSON.stringify({ id, status: "sold" }),
    });
    fetchAll();
  };

  const updateBulkRow = (index: number, field: keyof BulkRow, value: string) => {
    setBulkRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const addBulkRow = () => setBulkRows((rows) => [...rows, emptyBulkRow()]);

  const removeBulkRow = (index: number) =>
    setBulkRows((rows) => rows.filter((_, i) => i !== index));

  const publishBulk = async () => {
    const validRows = bulkRows.filter(
      (r) => r.deviceName.trim() && r.priceMin && r.priceMax
    );
    if (validRows.length === 0 || !bulkPhone.trim()) return;
    if (!isValidNigerianPhone(bulkPhone)) {
      setBulkPhoneError(true);
      return;
    }

    setBulkPhoneError(false);
    setBulkPublishing(true);
    setBulkResult(null);
    let published = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        const res = await apiFetch("/api/listings", {
          method: "POST",
          body: JSON.stringify({
            userName: userName || "Vendor",
            userPhone: bulkPhone.trim(),
            deviceName: row.deviceName.trim(),
            deviceCategory: row.category,
            subType: "",
            storage: row.storage.trim() || null,
            batteryHealth: row.batteryHealth || "100",
            simType: null,
            faceIdStatus: null,
            repairs: [],
            mediaCount: 0,
            images: [],
            imeiVerified: false,
            estimatedMin: Number(row.priceMin),
            estimatedMax: Number(row.priceMax),
            listingType: "sell",
            wantedDevice: null,
          }),
        });
        if (res.ok) published += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }

    setBulkResult({ published, failed });
    setBulkPublishing(false);
    if (published > 0) {
      setBulkRows([emptyBulkRow(), emptyBulkRow(), emptyBulkRow()]);
      fetchAll();
    }
  };

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
  const inpS = { borderColor: "var(--border)", color: "var(--ink)" };

  if (isLoading)
    return (
      <div
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ background: "var(--bg)" }}
      >
        <p style={{ color: "var(--ink-soft)" }}>Loading...</p>
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
          {sideItem("leads", `Cash Leads`, cashLeads.length)}
          {sideItem("swaps", `Swap Requests`, swapLeads.length)}
          {sideItem("inventory", "Inventory")}
          {sideItem("bulk", "Bulk List")}
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
              {tab}
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
                          setTab(
                            n.type === "new_swap_request" ? "swaps" : "leads"
                          );
                          setShowNotifs(false);
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
                            lead.status === "open"
                              ? "rgba(22,163,74,0.08)"
                              : "var(--border)",
                          color: lead.status === "open" ? "#16a34a" : "var(--ink-soft)",
                        }}
                      >
                        {lead.status === "open" ? "Open" : lead.status}
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
                    {lead.bids && lead.bids.length > 0 && (
                      <div className="space-y-1.5">
                        <p
                          className="text-xs font-medium"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Bids ({lead.bids.length})
                        </p>
                        {lead.bids.map((bid, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-xs px-3 py-2 rounded-lg"
                            style={{ background: "var(--border)" }}
                          >
                            <span style={{ color: "var(--ink)" }}>
                              {bid.vendorName}
                            </span>
                            <span
                              className="font-semibold"
                              style={{ color: "var(--accent)" }}
                            >
                              {formatPrice(bid.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {lead.status === "open" && isVerified && (
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
                          style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
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
                          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl text-white text-center no-underline"
                          style={{ background: "#25d366" }}
                        >
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </a>
                      </div>
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
                    {swap.status === "open" && isVerified && (
                      <a
                        href={`https://wa.me/${swap.userPhone}?text=Hi ${swap.userName}, I can swap your ${swap.deviceName} for ${swap.wantedDevice}. Let's discuss the top-up amount!`}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full text-sm font-semibold py-2.5 rounded-xl text-white no-underline"
                        style={{ background: "#25d366" }}
                      >
                        <MessageCircle className="w-4 h-4" /> Discuss Swap on
                        WhatsApp
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
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  {inStock.length} devices in stock
                </p>
                <button
                  onClick={() => setShowAdd(!showAdd)}
                  style={{ background: "var(--accent)" }}
                  className="text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity"
                >
                  + Add Device
                </button>
              </div>
              {showAdd && (
                <div
                  className="rounded-xl p-5 border space-y-3"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--ink)" }}
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
                        borderColor: "var(--border)",
                        color: "var(--ink)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addInventory}
                      style={{ background: "var(--accent)" }}
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
                      className={`rounded-xl p-5 border space-y-3 ${
                        item.status === "sold" ? "opacity-60" : ""
                      }`}
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex justify-between">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "var(--ink)" }}
                        >
                          {item.deviceName}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background:
                              item.status === "sold"
                                ? "var(--border)"
                                : "rgba(22,163,74,0.08)",
                            color:
                              item.status === "sold" ? "var(--ink-soft)" : "#16a34a",
                          }}
                        >
                          {item.status === "sold" ? "Sold" : "In Stock"}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs flex-wrap">
                        <span style={{ color: "var(--ink-soft)" }}>
                          Bought:{" "}
                          <span
                            className="font-semibold"
                            style={{ color: "var(--ink)" }}
                          >
                            {formatPrice(item.buyPrice)}
                          </span>
                        </span>
                        <span style={{ color: "var(--ink-soft)" }}>
                          Selling:{" "}
                          <span
                            className="font-semibold"
                            style={{ color: "var(--accent)" }}
                          >
                            {formatPrice(item.sellPrice)}
                          </span>
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: profit > 0 ? "#16a34a" : "#DC2626" }}
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
                            borderColor: "var(--border)",
                            color: "var(--ink-soft)",
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

          {/* BULK LIST */}
          {tab === "bulk" && (
            <div className="space-y-4">
              <div
                className="rounded-xl p-5 border space-y-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: "var(--ink)" }}
                  >
                    Bulk list devices for sale
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    Add as many devices as you like, then publish them all at
                    once — they go live on the marketplace immediately.
                  </p>
                </div>

                <div>
                  <label
                    className="text-xs font-medium block mb-1.5"
                    style={{ color: "var(--ink)" }}
                  >
                    Contact number for these listings (WhatsApp)
                  </label>
                  <input
                    className={inp}
                    style={inpS}
                    type="tel"
                    placeholder="08012345678"
                    required
                    pattern={NIGERIA_PHONE_REGEX.source}
                    title={NIGERIA_PHONE_TITLE}
                    value={bulkPhone}
                    onChange={(e) => {
                      setBulkPhone(e.target.value);
                      setBulkPhoneError(false);
                    }}
                  />
                  {bulkPhoneError && (
                    <p className="text-xs mt-1" style={{ color: "#DC2626" }}>
                      Enter a valid Nigerian number, e.g. 08012345678
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {bulkRows.map((row, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3 space-y-2.5"
                      style={{ background: "var(--border)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Device {i + 1}
                        </span>
                        {bulkRows.length > 1 && (
                          <button
                            onClick={() => removeBulkRow(i)}
                            aria-label="Remove device"
                            style={{ color: "#DC2626", cursor: "pointer" }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        <input
                          className={inp}
                          style={{ ...inpS, background: "var(--surface)" }}
                          placeholder="Device name (e.g. iPhone 13 Pro)"
                          value={row.deviceName}
                          onChange={(e) =>
                            updateBulkRow(i, "deviceName", e.target.value)
                          }
                        />
                        <input
                          className={inp}
                          style={{ ...inpS, background: "var(--surface)" }}
                          placeholder="Storage (e.g. 128GB)"
                          value={row.storage}
                          onChange={(e) =>
                            updateBulkRow(i, "storage", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <select
                          className={inp}
                          style={{ ...inpS, background: "var(--surface)" }}
                          value={row.category}
                          onChange={(e) =>
                            updateBulkRow(i, "category", e.target.value)
                          }
                        >
                          <option value="phone">Phone</option>
                          <option value="laptop">Laptop</option>
                        </select>
                        <input
                          className={inp}
                          style={{ ...inpS, background: "var(--surface)" }}
                          type="number"
                          placeholder="Battery %"
                          value={row.batteryHealth}
                          onChange={(e) =>
                            updateBulkRow(i, "batteryHealth", e.target.value)
                          }
                        />
                        <input
                          className={inp}
                          style={{ ...inpS, background: "var(--surface)" }}
                          type="number"
                          placeholder="Min price (₦)"
                          value={row.priceMin}
                          onChange={(e) =>
                            updateBulkRow(i, "priceMin", e.target.value)
                          }
                        />
                        <input
                          className={inp}
                          style={{ ...inpS, background: "var(--surface)" }}
                          type="number"
                          placeholder="Max price (₦)"
                          value={row.priceMax}
                          onChange={(e) =>
                            updateBulkRow(i, "priceMax", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addBulkRow}
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                >
                  <Plus className="w-4 h-4" /> Add another device
                </button>

                {bulkResult && (
                  <div
                    className="rounded-xl p-3 text-sm"
                    style={{
                      background:
                        bulkResult.failed > 0
                          ? "rgba(217,119,6,0.08)"
                          : "rgba(22,163,74,0.08)",
                      color: bulkResult.failed > 0 ? "#d97706" : "#16a34a",
                    }}
                  >
                    Published {bulkResult.published} listing
                    {bulkResult.published === 1 ? "" : "s"} to the
                    marketplace
                    {bulkResult.failed > 0
                      ? ` — ${bulkResult.failed} failed, check the details and try again.`
                      : "."}
                  </div>
                )}

                <button
                  onClick={publishBulk}
                  disabled={
                    bulkPublishing ||
                    !bulkPhone.trim() ||
                    !bulkRows.some(
                      (r) => r.deviceName.trim() && r.priceMin && r.priceMax
                    )
                  }
                  style={{ background: "var(--accent)", cursor: "pointer" }}
                  className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {bulkPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Publish All to
                      Marketplace
                    </>
                  )}
                </button>
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

      {/* Bid Modal */}
      {bidModal.listing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(2,0,68,0.6)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md space-y-4"
            style={{ background: "var(--surface)" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3
                  className="font-bold text-lg"
                  style={{
                    color: "var(--ink)",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  Place a Bid
                </h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--ink-soft)" }}>
                  {bidModal.listing.deviceName}
                </p>
              </div>
              <button
                onClick={() =>
                  setBidModal({ listing: null, amount: "", message: "" })
                }
                className="text-xl"
                style={{ color: "var(--ink-soft)" }}
              >
                ×
              </button>
            </div>
            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: "var(--border)" }}
            >
              <span style={{ color: "var(--ink-soft)" }}>Seller asking: </span>
              <span className="font-bold" style={{ color: "var(--ink)" }}>
                {formatPrice(bidModal.listing.estimatedMin)} –{" "}
                {formatPrice(bidModal.listing.estimatedMax)}
              </span>
            </div>
            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Your Offer (₦)
              </label>
              <input
                type="number"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
                style={{ borderColor: "var(--border)", color: "var(--ink)" }}
                value={bidModal.amount}
                onChange={(e) =>
                  setBidModal((b) => ({ ...b, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Message (optional)
              </label>
              <textarea
                rows={2}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ borderColor: "var(--border)", color: "var(--ink)" }}
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
                style={{ borderColor: "var(--border)", color: "var(--ink)" }}
              >
                Cancel
              </button>
              <button
                onClick={placeBid}
                style={{ background: "var(--accent)" }}
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
