"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// ── Types ────────────────────────────────────────────────────────────────────
type ListingStatus = "pending" | "approved" | "declined";

type Listing = {
  id: string;
  deviceName: string;
  storage?: string;
  batteryHealth: string;
  estimatedMin: number;
  estimatedMax: number;
  listingType: "sell" | "swap";
  status: ListingStatus;
  createdAt: string;
  imeiVerified: boolean;
  repairs: string[];
  mediaCount: number;
  simType?: string;
  faceIdStatus?: string;
  wantedDevice?: string;
  seller: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  declineReason?: string;
  unreadMessages?: number;
};

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "seller";
  text: string;
  createdAt: string;
};

const formatPrice = (n: number) => "₦" + n.toLocaleString("en-NG");

const statusBadge = (status: ListingStatus) => {
  const map = {
    pending: { bg: "rgba(217,119,6,0.1)", color: "#d97706", label: "Pending" },
    approved: {
      bg: "rgba(22,163,74,0.1)",
      color: "#16a34a",
      label: "Approved",
    },
    declined: {
      bg: "rgba(239,63,35,0.1)",
      color: "#EF3F23",
      label: "Declined",
    },
  };
  const s = map[status];
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

// ── Mock data (replace with real API calls) ──────────────────────────────────
const MOCK_LISTINGS: Listing[] = [
  {
    id: "lst_001",
    deviceName: "iPhone 15 Pro Max",
    storage: "512GB",
    batteryHealth: "89",
    estimatedMin: 1350000,
    estimatedMax: 1580000,
    listingType: "sell",
    status: "pending",
    createdAt: "2026-04-23T10:30:00Z",
    imeiVerified: true,
    repairs: ["Battery replaced"],
    mediaCount: 6,
    simType: "physical",
    faceIdStatus: "working",
    seller: {
      id: "usr_01",
      name: "Chukwuemeka Obi",
      phone: "08012345678",
      email: "chukwu@email.com",
    },
    unreadMessages: 2,
  },
  {
    id: "lst_002",
    deviceName: "Samsung S24 Ultra",
    storage: "256GB",
    batteryHealth: "94",
    estimatedMin: 900000,
    estimatedMax: 1100000,
    listingType: "swap",
    status: "pending",
    createdAt: "2026-04-23T09:15:00Z",
    imeiVerified: false,
    repairs: [],
    mediaCount: 3,
    simType: "locked",
    wantedDevice: "MacBook Air M2",
    seller: {
      id: "usr_02",
      name: "Adaeze Nwosu",
      phone: "09087654321",
      email: "ada@email.com",
    },
    unreadMessages: 0,
  },
  {
    id: "lst_003",
    deviceName: "MacBook Pro M3",
    storage: "1TB",
    batteryHealth: "97",
    estimatedMin: 1900000,
    estimatedMax: 2200000,
    listingType: "sell",
    status: "approved",
    createdAt: "2026-04-22T14:00:00Z",
    imeiVerified: false,
    repairs: [],
    mediaCount: 8,
    seller: { id: "usr_03", name: "Femi Adeleke", phone: "08098765432" },
    unreadMessages: 0,
  },
  {
    id: "lst_004",
    deviceName: "iPhone 14 Pro",
    storage: "256GB",
    batteryHealth: "72",
    estimatedMin: 700000,
    estimatedMax: 850000,
    listingType: "sell",
    status: "declined",
    createdAt: "2026-04-22T08:00:00Z",
    imeiVerified: true,
    repairs: ["Screen replaced", "Camera replaced"],
    mediaCount: 2,
    simType: "esim-unlocked",
    faceIdStatus: "broken",
    declineReason:
      "Only 2 photos uploaded — please add at least 5 clear photos including Parts & Services screenshot.",
    seller: { id: "usr_04", name: "Ngozi Eze", phone: "07012345678" },
    unreadMessages: 1,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  lst_001: [
    {
      id: "m1",
      senderId: "usr_01",
      senderName: "Chukwuemeka Obi",
      senderRole: "seller",
      text: "Hello, I just submitted my iPhone 15 Pro Max. Please review.",
      createdAt: "2026-04-23T10:35:00Z",
    },
    {
      id: "m2",
      senderId: "admin",
      senderName: "TechNest Admin",
      senderRole: "admin",
      text: "Hi Chukwuemeka! We've received your listing. We'll review it shortly.",
      createdAt: "2026-04-23T10:40:00Z",
    },
    {
      id: "m3",
      senderId: "usr_01",
      senderName: "Chukwuemeka Obi",
      senderRole: "seller",
      text: "Thank you! Is there anything else you need from me?",
      createdAt: "2026-04-23T10:42:00Z",
    },
  ],
  lst_004: [
    {
      id: "m4",
      senderId: "admin",
      senderName: "TechNest Admin",
      senderRole: "admin",
      text: "Hi Ngozi, we had to decline your listing. Please upload more photos — at least 5 including the Parts & Services screenshot.",
      createdAt: "2026-04-22T09:00:00Z",
    },
    {
      id: "m5",
      senderId: "usr_04",
      senderName: "Ngozi Eze",
      senderRole: "seller",
      text: "Okay, I'll re-upload and resubmit. Thank you.",
      createdAt: "2026-04-22T09:15:00Z",
    },
  ],
};

// ── Admin Panel ──────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { data: session } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [filter, setFilter] = useState<"all" | ListingStatus>("all");
  const [selected, setSelected] = useState<Listing | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [declineModal, setDeclineModal] = useState(false);
  const [declineMsg, setDeclineMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [tab, setTab] = useState<"detail" | "chat">("detail");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Guard: only admin
  // In production, check session role === 'admin'

  useEffect(() => {
    if (selected) {
      setMessages(MOCK_MESSAGES[selected.id] || []);
    }
  }, [selected]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = listings.filter(
    (l) => filter === "all" || l.status === filter
  );

  const counts = {
    all: listings.length,
    pending: listings.filter((l) => l.status === "pending").length,
    approved: listings.filter((l) => l.status === "approved").length,
    declined: listings.filter((l) => l.status === "declined").length,
  };

  const handleApprove = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "approved" } : l))
    );
    if (selected?.id === id)
      setSelected((s) => (s ? { ...s, status: "approved" } : s));
    // In production: await fetch(`/api/admin/listings/${id}/approve`, { method: 'POST' })
  };

  const handleDecline = () => {
    if (!selected || !declineMsg.trim()) return;
    setListings((prev) =>
      prev.map((l) =>
        l.id === selected.id
          ? { ...l, status: "declined", declineReason: declineMsg }
          : l
      )
    );
    setSelected((s) =>
      s ? { ...s, status: "declined", declineReason: declineMsg } : s
    );

    // Auto-send decline message in chat
    const adminMsg: Message = {
      id: Date.now().toString(),
      senderId: "admin",
      senderName: "TechNest Admin",
      senderRole: "admin",
      text: `❌ Your listing has been declined: ${declineMsg}`,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, adminMsg]);
    MOCK_MESSAGES[selected.id] = [
      ...(MOCK_MESSAGES[selected.id] || []),
      adminMsg,
    ];

    setDeclineModal(false);
    setDeclineMsg("");
    setTab("chat");
    // In production: POST to API
  };

  const sendMessage = () => {
    if (!newMsg.trim() || !selected) return;
    const msg: Message = {
      id: Date.now().toString(),
      senderId: "admin",
      senderName: "TechNest Admin",
      senderRole: "admin",
      text: newMsg.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    MOCK_MESSAGES[selected.id] = [...(MOCK_MESSAGES[selected.id] || []), msg];
    setNewMsg("");
  };

  const timeAgo = (iso: string, now: number) => {
    const diff = now - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0A0A1A", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: "#020044",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "#EF3F23" }}
          >
            A
          </div>
          <div>
            <p
              className="text-white font-bold text-sm"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Tech<span style={{ color: "#EF3F23" }}>Nest</span> Admin
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Listing Management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {counts.pending > 0 && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: "rgba(239,63,35,0.15)",
                color: "#EF3F23",
                border: "1px solid rgba(239,63,35,0.3)",
              }}
            >
              {counts.pending} pending
            </span>
          )}
          <button
            onClick={() => router.push("/")}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            ← Back to site
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* LEFT — Listings table */}
        <div
          className={`flex flex-col ${
            selected ? "w-1/2" : "w-full"
          } transition-all`}
          style={{
            borderRight: selected ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          {/* Stats bar */}
          <div className="px-6 pt-6 pb-4 flex gap-3 flex-wrap">
            {(["all", "pending", "approved", "declined"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background:
                    filter === f ? "rgba(255,255,255,0.08)" : "transparent",
                  color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
                  border:
                    filter === f
                      ? "1px solid rgba(255,255,255,0.15)"
                      : "1px solid transparent",
                }}
              >
                <span className="capitalize">{f}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      f === "pending"
                        ? "rgba(217,119,6,0.2)"
                        : f === "approved"
                        ? "rgba(22,163,74,0.2)"
                        : f === "declined"
                        ? "rgba(239,63,35,0.2)"
                        : "rgba(255,255,255,0.1)",
                    color:
                      f === "pending"
                        ? "#d97706"
                        : f === "approved"
                        ? "#16a34a"
                        : f === "declined"
                        ? "#EF3F23"
                        : "rgba(255,255,255,0.6)",
                  }}
                >
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
            {filtered.length === 0 && (
              <div
                className="text-center py-20"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                No listings in this category
              </div>
            )}
            {filtered.map((listing) => (
              <div
                key={listing.id}
                onClick={() => {
                  setSelected(listing);
                  setTab("detail");
                }}
                className="p-4 rounded-2xl cursor-pointer transition-all"
                style={{
                  background:
                    selected?.id === listing.id
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    selected?.id === listing.id
                      ? "1px solid rgba(255,255,255,0.15)"
                      : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate">
                        {listing.deviceName}{" "}
                        {listing.storage && `(${listing.storage})`}
                      </p>
                      {statusBadge(listing.status)}
                      {listing.unreadMessages! > 0 && (
                        <span
                          className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "#EF3F23", color: "#fff" }}
                        >
                          {listing.unreadMessages}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {listing.seller.name} · {listing.seller.phone}
                      </p>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        {timeAgo(listing.createdAt, Date.now())}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            listing.listingType === "sell"
                              ? "rgba(22,163,74,0.1)"
                              : "rgba(119,68,153,0.1)",
                          color:
                            listing.listingType === "sell"
                              ? "#16a34a"
                              : "#774499",
                        }}
                      >
                        {listing.listingType === "sell" ? "💰 Sell" : "🔄 Swap"}
                      </span>
                      {listing.imeiVerified && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(22,163,74,0.1)",
                            color: "#16a34a",
                          }}
                        >
                          ✓ IMEI
                        </span>
                      )}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        🔋 {listing.batteryHealth}%
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        📷 {listing.mediaCount} photos
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#EF3F23" }}
                    >
                      {formatPrice(listing.estimatedMin)}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      – {formatPrice(listing.estimatedMax)}
                    </p>
                  </div>
                </div>

                {/* Quick action buttons for pending */}
                {listing.status === "pending" && (
                  <div
                    className="flex gap-2 mt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleApprove(listing.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: "rgba(22,163,74,0.12)",
                        color: "#16a34a",
                        border: "1px solid rgba(22,163,74,0.25)",
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelected(listing);
                        setDeclineModal(true);
                      }}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: "rgba(239,63,35,0.1)",
                        color: "#EF3F23",
                        border: "1px solid rgba(239,63,35,0.2)",
                      }}
                    >
                      ✗ Decline
                    </button>
                    <button
                      onClick={() => {
                        setSelected(listing);
                        setTab("chat");
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      💬
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Detail + Chat panel */}
        {selected && (
          <div
            className="w-1/2 flex flex-col"
            style={{ background: "#0D0D20" }}
          >
            {/* Panel header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div>
                <p className="text-white font-semibold text-sm">
                  {selected.deviceName}{" "}
                  {selected.storage && `(${selected.storage})`}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {selected.seller.name} · {selected.seller.phone}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex px-6 pt-4 gap-1"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {(["detail", "chat"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-4 py-2 text-sm font-medium rounded-t-xl capitalize transition-all"
                  style={{
                    background:
                      tab === t ? "rgba(255,255,255,0.06)" : "transparent",
                    color: tab === t ? "#fff" : "rgba(255,255,255,0.35)",
                    borderBottom:
                      tab === t ? "2px solid #EF3F23" : "2px solid transparent",
                  }}
                >
                  {t === "chat"
                    ? `💬 Chat ${
                        messages.length > 0 ? `(${messages.length})` : ""
                      }`
                    : "📋 Details"}
                </button>
              ))}
            </div>

            {/* Detail tab */}
            {tab === "detail" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Status + action */}
                <div className="flex items-center justify-between">
                  {statusBadge(selected.status)}
                  {selected.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(selected.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: "#16a34a", color: "#fff" }}
                      >
                        ✓ Approve & Publish
                      </button>
                      <button
                        onClick={() => setDeclineModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold"
                        style={{
                          background: "rgba(239,63,35,0.15)",
                          color: "#EF3F23",
                          border: "1px solid rgba(239,63,35,0.3)",
                        }}
                      >
                        ✗ Decline
                      </button>
                    </div>
                  )}
                  {selected.status === "approved" && (
                    <span className="text-xs" style={{ color: "#16a34a" }}>
                      ✓ Live on marketplace
                    </span>
                  )}
                </div>

                {/* Seller info */}
                <div
                  className="rounded-2xl p-4 space-y-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Seller Info
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: "#EF3F23" }}
                    >
                      {selected.seller.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {selected.seller.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {selected.seller.phone}
                      </p>
                      {selected.seller.email && (
                        <p
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          {selected.seller.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Device info */}
                <div
                  className="rounded-2xl p-4 space-y-3"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Device Details
                  </p>
                  {[
                    [
                      "Device",
                      `${selected.deviceName}${
                        selected.storage ? " " + selected.storage : ""
                      }`,
                    ],
                    [
                      "Type",
                      selected.listingType === "sell"
                        ? "💰 For Sale"
                        : "🔄 Swap",
                    ],
                    ["Battery", `${selected.batteryHealth}%`],
                    ["SIM Status", selected.simType || "—"],
                    ["Face ID", selected.faceIdStatus || "—"],
                    [
                      "IMEI",
                      selected.imeiVerified ? "✓ Verified" : "Not verified",
                    ],
                    ["Photos", `${selected.mediaCount} uploaded`],
                    [
                      "Valuation",
                      `${formatPrice(selected.estimatedMin)} – ${formatPrice(
                        selected.estimatedMax
                      )}`,
                    ],
                    ...(selected.wantedDevice
                      ? [["Wants", selected.wantedDevice]]
                      : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>
                        {k}
                      </span>
                      <span className="font-medium text-white">{v}</span>
                    </div>
                  ))}
                  {selected.repairs.length > 0 && (
                    <div
                      className="pt-2"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p
                        className="text-xs mb-2"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        Repairs
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.repairs.map((r) => (
                          <span
                            key={r}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{
                              background: "rgba(239,63,35,0.1)",
                              color: "#EF3F23",
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Decline reason if any */}
                {selected.declineReason && (
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(239,63,35,0.06)",
                      border: "1px solid rgba(239,63,35,0.2)",
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: "#EF3F23" }}
                    >
                      Decline Reason
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {selected.declineReason}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setTab("chat")}
                  className="w-full py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  💬 Open Chat with Seller
                </button>
              </div>
            )}

            {/* Chat tab */}
            {tab === "chat" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div
                      className="text-center py-12"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      <p className="text-2xl mb-2">💬</p>
                      <p className="text-sm">
                        No messages yet. Start the conversation.
                      </p>
                    </div>
                  )}
                  {messages.map((m) => {
                    const isAdmin = m.senderRole === "admin";
                    return (
                      <div
                        key={m.id}
                        className={`flex ${
                          isAdmin ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] ${
                            isAdmin ? "items-end" : "items-start"
                          } flex flex-col gap-1`}
                        >
                          <p
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                          >
                            {m.senderName} · {timeAgo(m.createdAt)}
                          </p>
                          <div
                            className="px-4 py-2.5 rounded-2xl text-sm"
                            style={{
                              background: isAdmin
                                ? "#020044"
                                : "rgba(255,255,255,0.07)",
                              color: "#fff",
                              borderTopRightRadius: isAdmin ? 4 : undefined,
                              borderTopLeftRadius: isAdmin ? undefined : 4,
                              border: isAdmin
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            {m.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <div
                  className="p-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* Quick templates */}
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {[
                      "Please upload more photos",
                      "Your IMEI check failed",
                      "Add Parts & Services screenshot",
                      "Your listing is approved ✓",
                    ].map((t) => (
                      <button
                        key={t}
                        onClick={() => setNewMsg(t)}
                        className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.4)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.1)",
                        caretColor: "#EF3F23",
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{ background: "#EF3F23", color: "#fff" }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {declineModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <div>
              <h3 className="font-bold text-lg" style={{ color: "#020044" }}>
                Decline Listing
              </h3>
              <p className="text-sm mt-1" style={{ color: "#6B6B8A" }}>
                Tell the seller what needs to be fixed. This message will be
                sent to their chat automatically.
              </p>
            </div>
            <textarea
              rows={4}
              value={declineMsg}
              onChange={(e) => setDeclineMsg(e.target.value)}
              placeholder="e.g. Please upload at least 5 clear photos, including a Parts & Services screenshot..."
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none"
              style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
            />
            {/* Quick templates */}
            <div className="space-y-1.5">
              {[
                "Please upload at least 5 clear photos including a Parts & Services screenshot.",
                "Your IMEI verification failed. Please verify your device and resubmit.",
                "Photos are too blurry. Please retake and resubmit.",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => setDeclineMsg(t)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(2,0,68,0.04)",
                    color: "#6B6B8A",
                    border: "1px solid rgba(2,0,68,0.08)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeclineModal(false)}
                className="flex-1 border rounded-xl py-2.5 text-sm font-medium"
                style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!declineMsg.trim()}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40"
                style={{ background: "#EF3F23" }}
              >
                Decline & Notify Seller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
