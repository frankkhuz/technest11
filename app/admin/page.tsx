/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────
type ListingStatus = "pending" | "approved" | "declined";
type VendorStatus = "pending" | "approved" | "rejected";

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
  description?: string;
  seller: { name: string; phone: string; email?: string };
  declineReason?: string;
  unreadMessages?: number;
};

type Vendor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nin: string;
  bvn: string;
  businessName: string;
  businessAddress: string;
  state: string;
  status: VendorStatus;
  createdAt: string;
};

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "seller";
  text: string;
  createdAt: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
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

const vendorBadge = (status: VendorStatus) => {
  const map = {
    pending: { bg: "rgba(217,119,6,0.1)", color: "#d97706", label: "Pending" },
    approved: {
      bg: "rgba(22,163,74,0.1)",
      color: "#16a34a",
      label: "Approved",
    },
    rejected: {
      bg: "rgba(239,63,35,0.1)",
      color: "#EF3F23",
      label: "Rejected",
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

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_VENDORS: Vendor[] = [
  {
    id: "v001",
    firstName: "Emeka",
    lastName: "Okafor",
    email: "emeka@gmail.com",
    phone: "08012345678",
    nin: "12345678901",
    bvn: "22345678901",
    businessName: "Emeka Tech Store",
    businessAddress: "14 Broad Street, Lagos Island",
    state: "Lagos",
    status: "pending",
    createdAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "v002",
    firstName: "Fatima",
    lastName: "Aliyu",
    email: "fatima@yahoo.com",
    phone: "09087654321",
    nin: "98765432109",
    bvn: "22987654321",
    businessName: "Fatima Gadgets Hub",
    businessAddress: "7 Wuse Zone 4, Abuja",
    state: "FCT",
    status: "approved",
    createdAt: "2026-04-18T08:30:00Z",
  },
  {
    id: "v003",
    firstName: "Chidi",
    lastName: "Nwosu",
    email: "chidi@gmail.com",
    phone: "07011223344",
    nin: "11223344556",
    bvn: "22112233445",
    businessName: "Chidi Mobile World",
    businessAddress: "22 Ogui Road, Enugu",
    state: "Enugu",
    status: "rejected",
    createdAt: "2026-04-15T14:00:00Z",
  },
];

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
    simType: "Physical SIM",
    faceIdStatus: "working",
    description:
      "Bought in UK, used for 8 months. Comes with original box and charger.",
    seller: {
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
    simType: "Locked",
    wantedDevice: "MacBook Air M2",
    description: "Locked to EE UK network. IMEI clean.",
    seller: {
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
    description: "Space Grey, barely used. Original charger included.",
    seller: { name: "Femi Adeleke", phone: "08098765432" },
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
    simType: "eSIM Unlocked",
    faceIdStatus: "broken",
    declineReason:
      "Only 2 photos uploaded — please add at least 5 clear photos including Parts & Services screenshot.",
    description: "Face ID broken. Screen is OEM replacement.",
    seller: { name: "Ngozi Eze", phone: "07012345678" },
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
  ],
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const router = useRouter();

  const [mainTab, setMainTab] = useState<"listings" | "vendors">("listings");

  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [listingFilter, setListingFilter] = useState<"all" | ListingStatus>(
    "all"
  );
  const [selected, setSelected] = useState<Listing | null>(null);
  const [declineModal, setDeclineModal] = useState(false);
  const [declineMsg, setDeclineMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [tab, setTab] = useState<"detail" | "chat">("detail");
  const [showDetail, setShowDetail] = useState(false); // mobile: show detail panel
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [vendorFilter, setVendorFilter] = useState<"all" | VendorStatus>("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetail, setShowVendorDetail] = useState(false);

  useEffect(() => {
    if (selected) setMessages(MOCK_MESSAGES[selected.id] || []);
  }, [selected]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  // ── Listing actions ──────────────────────────────────────────────────────────
  const handleApprove = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "approved" } : l))
    );
    if (selected?.id === id)
      setSelected((s) => (s ? { ...s, status: "approved" } : s));
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
    const adminMsg: Message = {
      id: Date.now().toString(),
      senderId: "admin",
      senderName: "TechNest Admin",
      senderRole: "admin",
      text: `❌ Your listing has been declined: ${declineMsg}`,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, adminMsg]);
    setDeclineModal(false);
    setDeclineMsg("");
    setTab("chat");
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
    setNewMsg("");
  };

  // ── Vendor actions ───────────────────────────────────────────────────────────
  const handleVendorApprove = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "approved" } : v))
    );
    if (selectedVendor?.id === id)
      setSelectedVendor((v) => (v ? { ...v, status: "approved" } : v));
  };

  const handleVendorReject = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "rejected" } : v))
    );
    if (selectedVendor?.id === id)
      setSelectedVendor((v) => (v ? { ...v, status: "rejected" } : v));
  };

  // ── Counts ───────────────────────────────────────────────────────────────────
  const listingCounts = {
    all: listings.length,
    pending: listings.filter((l) => l.status === "pending").length,
    approved: listings.filter((l) => l.status === "approved").length,
    declined: listings.filter((l) => l.status === "declined").length,
  };

  const vendorCounts = {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === "pending").length,
    approved: vendors.filter((v) => v.status === "approved").length,
    rejected: vendors.filter((v) => v.status === "rejected").length,
  };

  const filteredListings = listings.filter(
    (l) => listingFilter === "all" || l.status === listingFilter
  );
  const filteredVendors = vendors.filter(
    (v) => vendorFilter === "all" || v.status === vendorFilter
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0A0A1A", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        button, a, [role="button"], select { cursor: pointer !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-50 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
        style={{
          background: "#020044",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold text-white flex-shrink-0"
            style={{ background: "#EF3F23" }}
          >
            A
          </div>
          <div>
            <p
              className="text-white font-bold text-xs md:text-sm"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Tech<span style={{ color: "#EF3F23" }}>Nest</span> Admin
            </p>
            <p
              className="text-xs hidden sm:block"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {listingCounts.pending > 0 && (
            <span
              className="text-xs font-bold px-2 md:px-3 py-1 rounded-full"
              style={{
                background: "rgba(239,63,35,0.15)",
                color: "#EF3F23",
                border: "1px solid rgba(239,63,35,0.3)",
              }}
            >
              <span className="hidden sm:inline">
                {listingCounts.pending} listings pending
              </span>
              <span className="sm:hidden">{listingCounts.pending} pending</span>
            </span>
          )}
          {vendorCounts.pending > 0 && (
            <span
              className="text-xs font-bold px-2 md:px-3 py-1 rounded-full hidden sm:inline-block"
              style={{
                background: "rgba(217,119,6,0.15)",
                color: "#d97706",
                border: "1px solid rgba(217,119,6,0.3)",
              }}
            >
              {vendorCounts.pending} vendors pending
            </span>
          )}
          <button
            onClick={() => router.push("/")}
            className="text-xs px-2 md:px-3 py-1.5 rounded-lg"
            style={{
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
            }}
          >
            ← <span className="hidden sm:inline">Back to site</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </div>

      {/* ── Main Tabs ─────────────────────────────────────────────────────────── */}
      <div
        className="px-4 md:px-6 pt-4 md:pt-5 pb-0 flex gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {(
          [
            {
              key: "listings",
              label: "📦 Listings",
              count: listingCounts.pending,
            },
            {
              key: "vendors",
              label: "🏪 Vendors",
              count: vendorCounts.pending,
            },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => {
              setMainTab(key);
              setSelected(null);
              setSelectedVendor(null);
              setShowDetail(false);
              setShowVendorDetail(false);
            }}
            className="px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold rounded-t-xl flex items-center gap-1 md:gap-2"
            style={{
              background:
                mainTab === key ? "rgba(255,255,255,0.07)" : "transparent",
              color: mainTab === key ? "#fff" : "rgba(255,255,255,0.4)",
              borderBottom:
                mainTab === key ? "2px solid #EF3F23" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {label}
            {count > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(239,63,35,0.2)", color: "#EF3F23" }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════ LISTINGS TAB ════════ */}
      {mainTab === "listings" && (
        <div className="relative" style={{ height: "calc(100vh - 120px)" }}>
          {/* Mobile: detail panel slides over list */}
          {showDetail && selected && (
            <div
              className="md:hidden absolute inset-0 z-20 flex flex-col"
              style={{ background: "#0D0D20" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {selected.deviceName}{" "}
                    {selected.storage && `(${selected.storage})`}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {selected.seller.name}
                  </p>
                </div>
              </div>
              {renderDetailContent({
                selected,
                tab,
                setTab,
                messages,
                newMsg,
                setNewMsg,
                sendMessage,
                handleApprove,
                setDeclineModal,
                chatEndRef,
                timeAgo,
              })}
            </div>
          )}

          {/* Desktop: side-by-side */}
          <div className="hidden md:flex h-full">
            <ListingList
              filteredListings={filteredListings}
              listingFilter={listingFilter}
              setListingFilter={setListingFilter}
              listingCounts={listingCounts}
              selected={selected}
              setSelected={(l) => {
                setSelected(l);
                setTab("detail");
              }}
              handleApprove={handleApprove}
              setDeclineModal={setDeclineModal}
              setTab={setTab}
              timeAgo={timeAgo}
              hasSelected={!!selected}
            />
            {selected && (
              <div
                className="w-1/2 flex flex-col"
                style={{ background: "#0D0D20" }}
              >
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
                      cursor: "pointer",
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
                {renderDetailContent({
                  selected,
                  tab,
                  setTab,
                  messages,
                  newMsg,
                  setNewMsg,
                  sendMessage,
                  handleApprove,
                  setDeclineModal,
                  chatEndRef,
                  timeAgo,
                })}
              </div>
            )}
          </div>

          {/* Mobile: list */}
          <div
            className="md:hidden h-full flex flex-col"
            style={{ display: showDetail ? "none" : "flex" }}
          >
            <ListingList
              filteredListings={filteredListings}
              listingFilter={listingFilter}
              setListingFilter={setListingFilter}
              listingCounts={listingCounts}
              selected={selected}
              setSelected={(l) => {
                setSelected(l);
                setTab("detail");
                setShowDetail(true);
              }}
              handleApprove={handleApprove}
              setDeclineModal={setDeclineModal}
              setTab={(t) => {
                setTab(t);
                setShowDetail(true);
              }}
              timeAgo={timeAgo}
              hasSelected={false}
            />
          </div>
        </div>
      )}

      {/* ════════ VENDORS TAB ════════ */}
      {mainTab === "vendors" && (
        <div className="relative" style={{ height: "calc(100vh - 120px)" }}>
          {/* Mobile vendor detail */}
          {showVendorDetail && selectedVendor && (
            <div
              className="md:hidden absolute inset-0 z-20 flex flex-col overflow-y-auto"
              style={{ background: "#0D0D20" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-3 sticky top-0"
                style={{
                  background: "#0D0D20",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button
                  onClick={() => setShowVendorDetail(false)}
                  className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm">
                    {selectedVendor.firstName} {selectedVendor.lastName}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {selectedVendor.businessName}
                  </p>
                </div>
              </div>
              <VendorDetailContent
                vendor={selectedVendor}
                handleVendorApprove={handleVendorApprove}
                handleVendorReject={handleVendorReject}
              />
            </div>
          )}

          <div className="hidden md:flex h-full">
            <VendorList
              filteredVendors={filteredVendors}
              vendorFilter={vendorFilter}
              setVendorFilter={setVendorFilter}
              vendorCounts={vendorCounts}
              selectedVendor={selectedVendor}
              setSelectedVendor={setSelectedVendor}
              handleVendorApprove={handleVendorApprove}
              handleVendorReject={handleVendorReject}
            />
            {selectedVendor && (
              <div
                className="w-1/2 flex flex-col overflow-y-auto"
                style={{ background: "#0D0D20" }}
              >
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {selectedVendor.firstName} {selectedVendor.lastName}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {selectedVendor.businessName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
                <VendorDetailContent
                  vendor={selectedVendor}
                  handleVendorApprove={handleVendorApprove}
                  handleVendorReject={handleVendorReject}
                />
              </div>
            )}
          </div>

          {/* Mobile vendor list */}
          <div
            className="md:hidden h-full flex flex-col"
            style={{ display: showVendorDetail ? "none" : "flex" }}
          >
            <MobileVendorList
              filteredVendors={filteredVendors}
              vendorFilter={vendorFilter}
              setVendorFilter={setVendorFilter}
              vendorCounts={vendorCounts}
              selectedVendor={selectedVendor}
              setSelectedVendor={(v) => {
                setSelectedVendor(v);
                setShowVendorDetail(true);
              }}
              handleVendorApprove={handleVendorApprove}
              handleVendorReject={handleVendorReject}
            />
          </div>
        </div>
      )}

      {/* ── Decline Modal ──────────────────────────────────────────────────────── */}
      {declineModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 md:p-6 w-full sm:max-w-md space-y-4">
            <div>
              <h3 className="font-bold text-lg" style={{ color: "#020044" }}>
                Decline Listing
              </h3>
              <p className="text-sm mt-1" style={{ color: "#6B6B8A" }}>
                Tell the seller what needs to be fixed. This will be sent to
                their chat.
              </p>
            </div>
            <textarea
              rows={4}
              value={declineMsg}
              onChange={(e) => setDeclineMsg(e.target.value)}
              placeholder="e.g. Please upload at least 5 clear photos..."
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none"
              style={{ borderColor: "rgba(2,0,68,0.2)", color: "#020044" }}
            />
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
                    cursor: "pointer",
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
                style={{
                  borderColor: "rgba(2,0,68,0.2)",
                  color: "#020044",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!declineMsg.trim()}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40"
                style={{ background: "#EF3F23", cursor: "pointer" }}
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function renderDetailContent({
  selected,
  tab,
  setTab,
  messages,
  newMsg,
  setNewMsg,
  sendMessage,
  handleApprove,
  setDeclineModal,
  chatEndRef,
  timeAgo,
}: {
  selected: Listing;
  tab: "detail" | "chat";
  setTab: (tab: "detail" | "chat") => void;
  messages: Message[];
  newMsg: string;
  setNewMsg: (msg: string) => void;
  sendMessage: () => void;
  handleApprove: (id: string) => void;
  setDeclineModal: (state: boolean) => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  timeAgo: (iso: string) => string;
}) {
  return (
    <>
      {/* Sub-tabs */}
      <div
        className="flex px-4 md:px-6 pt-3 md:pt-4 gap-1"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {(["detail", "chat"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-t-xl capitalize"
            style={{
              background: tab === t ? "rgba(255,255,255,0.06)" : "transparent",
              color: tab === t ? "#fff" : "rgba(255,255,255,0.35)",
              borderBottom:
                tab === t ? "2px solid #EF3F23" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t === "chat"
              ? `💬 Chat${messages.length > 0 ? ` (${messages.length})` : ""}`
              : "📋 Details"}
          </button>
        ))}
      </div>

      {tab === "detail" && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {statusBadge(selected.status)}
            {selected.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(selected.id)}
                  className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => setDeclineModal(true)}
                  className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background: "rgba(239,63,35,0.15)",
                    color: "#EF3F23",
                    border: "1px solid rgba(239,63,35,0.3)",
                    cursor: "pointer",
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
          <div
            className="rounded-2xl p-4"
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
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
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
                selected.listingType === "sell" ? "💰 For Sale" : "🔄 Swap",
              ],
              ["Battery", `${selected.batteryHealth}%`],
              ["SIM Status", selected.simType || "—"],
              ["Face ID", selected.faceIdStatus || "—"],
              ["IMEI", selected.imeiVerified ? "✓ Verified" : "Not verified"],
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
            ].map(([k, v]: [string, string]) => (
              <div
                key={k}
                className="flex justify-between text-xs md:text-sm gap-2"
              >
                <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
                <span className="font-medium text-white text-right">{v}</span>
              </div>
            ))}
            {selected.description && (
              <div
                className="pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Description
                </p>
                <p
                  className="text-xs md:text-sm"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {selected.description}
                </p>
              </div>
            )}
            {selected.repairs.length > 0 && (
              <div
                className="pt-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p
                  className="text-xs mb-2"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Repairs / History
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.repairs.map((r: string) => (
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
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Listing Requirements
            </p>
            {[
              {
                label: "Min 5 clear photos uploaded",
                met: selected.mediaCount >= 5,
              },
              {
                label: "Parts & Services screenshot",
                met: selected.mediaCount >= 5,
              },
              {
                label: "Battery health provided",
                met: !!selected.batteryHealth,
              },
              { label: "IMEI verified", met: selected.imeiVerified },
              { label: "SIM type specified", met: !!selected.simType },
              {
                label: "Face ID status provided",
                met: !!selected.faceIdStatus,
              },
              { label: "Valuation range set", met: selected.estimatedMin > 0 },
              { label: "Description added", met: !!selected.description },
              ...(selected.listingType === "swap"
                ? [
                    {
                      label: "Wanted device specified",
                      met: !!selected.wantedDevice,
                    },
                  ]
                : []),
            ].map(({ label, met }: { label: string; met: boolean }) => (
              <div
                key={label}
                className="flex items-center gap-2 py-1.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <span
                  style={{ color: met ? "#16a34a" : "#EF3F23", fontSize: 14 }}
                >
                  {met ? "✓" : "✗"}
                </span>
                <span
                  className="text-xs"
                  style={{
                    color: met
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(239,63,35,0.8)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
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
                className="text-xs md:text-sm"
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
              cursor: "pointer",
            }}
          >
            💬 Open Chat with Seller
          </button>
        </div>
      )}

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
            {messages.map((m: Message) => {
              const isAdmin = m.senderRole === "admin";
              return (
                <div
                  key={m.id}
                  className={`flex ${
                    isAdmin ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] flex flex-col gap-1 ${
                      isAdmin ? "items-end" : "items-start"
                    }`}
                  >
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {m.senderName} · {timeAgo(m.createdAt)}
                    </p>
                    <div
                      className="px-4 py-2.5 rounded-2xl text-xs md:text-sm"
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
            className="p-3 md:p-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
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
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
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
                className="px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "#EF3F23",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ListingList({
  filteredListings,
  listingFilter,
  setListingFilter,
  listingCounts,
  selected,
  setSelected,
  handleApprove,
  setDeclineModal,
  setTab,
  timeAgo,
  hasSelected,
}: {
  filteredListings: Listing[];
  listingFilter: "all" | ListingStatus;
  setListingFilter: (filter: "all" | ListingStatus) => void;
  listingCounts: Record<"all" | ListingStatus, number>;
  selected: Listing | null;
  setSelected: (listing: Listing | null) => void;
  handleApprove: (id: string) => void;
  setDeclineModal: (state: boolean) => void;
  setTab: (tab: "detail" | "chat") => void;
  timeAgo: (iso: string) => string;
  hasSelected: boolean;
}) {
  return (
    <div
      className={`flex flex-col ${
        hasSelected ? "w-1/2" : "w-full"
      } transition-all`}
      style={{
        borderRight: hasSelected ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="px-4 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4 flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "declined"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setListingFilter(f)}
            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium"
            style={{
              background:
                listingFilter === f ? "rgba(255,255,255,0.08)" : "transparent",
              color: listingFilter === f ? "#fff" : "rgba(255,255,255,0.4)",
              border:
                listingFilter === f
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid transparent",
              cursor: "pointer",
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
              {listingCounts[f]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 space-y-2">
        {filteredListings.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            No listings in this category
          </div>
        )}
        {filteredListings.map((listing: Listing) => (
          <div
            key={listing.id}
            onClick={() => {
              setSelected(listing);
              setTab("detail");
            }}
            className="p-3 md:p-4 rounded-2xl transition-all"
            style={{
              background:
                selected?.id === listing.id
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(255,255,255,0.03)",
              border:
                selected?.id === listing.id
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs md:text-sm font-semibold text-white truncate">
                    {listing.deviceName}{" "}
                    {listing.storage && `(${listing.storage})`}
                  </p>
                  {statusBadge(listing.status)}
                  {(listing.unreadMessages ?? 0) > 0 && (
                    <span
                      className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "#EF3F23", color: "#fff" }}
                    >
                      {listing.unreadMessages}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-1 truncate"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {listing.seller.name} · {listing.seller.phone} ·{" "}
                  {timeAgo(listing.createdAt)}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        listing.listingType === "sell"
                          ? "rgba(22,163,74,0.1)"
                          : "rgba(119,68,153,0.1)",
                      color:
                        listing.listingType === "sell" ? "#16a34a" : "#774499",
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
                    className="text-xs px-2 py-0.5 rounded-full hidden sm:inline-block"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    📷 {listing.mediaCount}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className="text-xs md:text-sm font-bold"
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
            {listing.status === "pending" && (
              <div
                className="flex gap-2 mt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleApprove(listing.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(22,163,74,0.12)",
                    color: "#16a34a",
                    border: "1px solid rgba(22,163,74,0.25)",
                    cursor: "pointer",
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => {
                    setSelected(listing);
                    setDeclineModal(true);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(239,63,35,0.1)",
                    color: "#EF3F23",
                    border: "1px solid rgba(239,63,35,0.2)",
                    cursor: "pointer",
                  }}
                >
                  ✗ Decline
                </button>
                <button
                  onClick={() => {
                    setSelected(listing);
                    setTab("chat");
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
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
  );
}

function VendorDetailContent({
  vendor,
  handleVendorApprove,
  handleVendorReject,
}: {
  vendor: Vendor;
  handleVendorApprove: (id: string) => void;
  handleVendorReject: (id: string) => void;
}) {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {vendorBadge(vendor.status)}
        {vendor.status === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={() => handleVendorApprove(vendor.id)}
              className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "#16a34a",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ✓ Approve
            </button>
            <button
              onClick={() => handleVendorReject(vendor.id)}
              className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "rgba(239,63,35,0.15)",
                color: "#EF3F23",
                border: "1px solid rgba(239,63,35,0.3)",
                cursor: "pointer",
              }}
            >
              ✗ Reject
            </button>
          </div>
        )}
      </div>
      {[
        {
          title: "Personal Information",
          rows: [
            ["First Name", vendor.firstName],
            ["Last Name", vendor.lastName],
            ["Email", vendor.email],
            ["Phone", vendor.phone],
          ],
        },
        {
          title: "Identity Verification",
          rows: [
            ["NIN", vendor.nin],
            ["BVN", vendor.bvn],
          ],
          mono: true,
        },
        {
          title: "Business Information",
          rows: [
            ["Business Name", vendor.businessName],
            ["Address", vendor.businessAddress],
            ["State", vendor.state],
            [
              "Applied",
              new Date(vendor.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            ],
          ],
        },
      ].map(({ title, rows, mono }) => (
        <div
          key={title}
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
            {title}
          </p>
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between text-xs md:text-sm gap-2"
            >
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
              <span
                className="font-medium text-white text-right max-w-[60%]"
                style={
                  mono
                    ? { fontFamily: "monospace", letterSpacing: "0.1em" }
                    : {}
                }
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      ))}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          KYC Checklist
        </p>
        {[
          {
            label: "Full name provided",
            met: !!(vendor.firstName && vendor.lastName),
          },
          { label: "Email address provided", met: !!vendor.email },
          { label: "Phone number provided", met: !!vendor.phone },
          { label: "NIN provided (11 digits)", met: vendor.nin.length === 11 },
          { label: "BVN provided (11 digits)", met: vendor.bvn.length === 11 },
          { label: "Business name provided", met: !!vendor.businessName },
          { label: "Business address provided", met: !!vendor.businessAddress },
          { label: "State provided", met: !!vendor.state },
        ].map(({ label, met }) => (
          <div
            key={label}
            className="flex items-center gap-2 py-1.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span style={{ color: met ? "#16a34a" : "#EF3F23", fontSize: 14 }}>
              {met ? "✓" : "✗"}
            </span>
            <span
              className="text-xs"
              style={{
                color: met ? "rgba(255,255,255,0.6)" : "rgba(239,63,35,0.8)",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorList({
  filteredVendors,
  vendorFilter,
  setVendorFilter,
  vendorCounts,
  selectedVendor,
  setSelectedVendor,
  handleVendorApprove,
  handleVendorReject,
}: {
  filteredVendors: Vendor[];
  vendorFilter: "all" | VendorStatus;
  setVendorFilter: (filter: "all" | VendorStatus) => void;
  vendorCounts: Record<"all" | VendorStatus, number>;
  selectedVendor: Vendor | null;
  setSelectedVendor: (vendor: Vendor | null) => void;
  handleVendorApprove: (id: string) => void;
  handleVendorReject: (id: string) => void;
}) {
  return (
    <div
      className={`flex flex-col ${
        selectedVendor ? "w-1/2" : "w-full"
      } transition-all`}
      style={{
        borderRight: selectedVendor
          ? "1px solid rgba(255,255,255,0.06)"
          : "none",
      }}
    >
      <div className="px-6 pt-5 pb-4 flex gap-3 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setVendorFilter(f)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              background:
                vendorFilter === f ? "rgba(255,255,255,0.08)" : "transparent",
              color: vendorFilter === f ? "#fff" : "rgba(255,255,255,0.4)",
              border:
                vendorFilter === f
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid transparent",
              cursor: "pointer",
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
                    : f === "rejected"
                    ? "rgba(239,63,35,0.2)"
                    : "rgba(255,255,255,0.1)",
                color:
                  f === "pending"
                    ? "#d97706"
                    : f === "approved"
                    ? "#16a34a"
                    : f === "rejected"
                    ? "#EF3F23"
                    : "rgba(255,255,255,0.6)",
              }}
            >
              {vendorCounts[f]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        {filteredVendors.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            No vendors in this category
          </div>
        )}
        {filteredVendors.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {[
                  "Name",
                  "Email",
                  "Phone",
                  "NIN",
                  "BVN",
                  "Business",
                  "State",
                  "Status",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 14px",
                      textAlign: "left",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((v: Vendor, i: number) => (
                <tr
                  key={v.id}
                  onClick={() =>
                    setSelectedVendor(selectedVendor?.id === v.id ? null : v)
                  }
                  style={{
                    background:
                      selectedVendor?.id === v.id
                        ? "rgba(255,255,255,0.06)"
                        : i % 2 === 0
                        ? "transparent"
                        : "rgba(255,255,255,0.01)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: "#EF3F23",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {v.firstName.charAt(0)}
                      </div>
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}
                      >
                        {v.firstName} {v.lastName}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.email}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.phone}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                      fontFamily: "monospace",
                    }}
                  >
                    {v.nin}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                      fontFamily: "monospace",
                    }}
                  >
                    {v.bvn}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.businessName}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.state}
                  </td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    {vendorBadge(v.status)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(v.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td
                    style={{ padding: "12px 14px", whiteSpace: "nowrap" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {v.status === "pending" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleVendorApprove(v.id)}
                          style={{
                            background: "rgba(22,163,74,0.12)",
                            color: "#16a34a",
                            border: "1px solid rgba(22,163,74,0.25)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleVendorReject(v.id)}
                          style={{
                            background: "rgba(239,63,35,0.1)",
                            color: "#EF3F23",
                            border: "1px solid rgba(239,63,35,0.2)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {v.status === "approved" && (
                      <span style={{ fontSize: 11, color: "#16a34a" }}>
                        ✓ Active
                      </span>
                    )}
                    {v.status === "rejected" && (
                      <span style={{ fontSize: 11, color: "#EF3F23" }}>
                        ✗ Rejected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MobileVendorList({
  filteredVendors,
  vendorFilter,
  setVendorFilter,
  vendorCounts,
  selectedVendor,
  setSelectedVendor,
  handleVendorApprove,
  handleVendorReject,
}: {
  filteredVendors: Vendor[];
  vendorFilter: "all" | VendorStatus;
  setVendorFilter: (filter: "all" | VendorStatus) => void;
  vendorCounts: Record<"all" | VendorStatus, number>;
  selectedVendor: Vendor | null;
  setSelectedVendor: (vendor: Vendor | null) => void;
  handleVendorApprove: (id: string) => void;
  handleVendorReject: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setVendorFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{
              background:
                vendorFilter === f ? "rgba(255,255,255,0.08)" : "transparent",
              color: vendorFilter === f ? "#fff" : "rgba(255,255,255,0.4)",
              border:
                vendorFilter === f
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid transparent",
              cursor: "pointer",
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
                    : f === "rejected"
                    ? "rgba(239,63,35,0.2)"
                    : "rgba(255,255,255,0.1)",
                color:
                  f === "pending"
                    ? "#d97706"
                    : f === "approved"
                    ? "#16a34a"
                    : f === "rejected"
                    ? "#EF3F23"
                    : "rgba(255,255,255,0.6)",
              }}
            >
              {vendorCounts[f]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {filteredVendors.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            No vendors in this category
          </div>
        )}
        {filteredVendors.map((v: Vendor) => (
          <div
            key={v.id}
            onClick={() => setSelectedVendor(v)}
            className="p-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: "#EF3F23" }}
                >
                  {v.firstName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {v.firstName} {v.lastName}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {v.businessName}
                  </p>
                </div>
              </div>
              {vendorBadge(v.status)}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Phone
                </p>
                <p className="text-xs text-white">{v.phone}</p>
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  State
                </p>
                <p className="text-xs text-white">{v.state}</p>
              </div>
            </div>
            {v.status === "pending" && (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleVendorApprove(v.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(22,163,74,0.12)",
                    color: "#16a34a",
                    border: "1px solid rgba(22,163,74,0.25)",
                    cursor: "pointer",
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleVendorReject(v.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(239,63,35,0.1)",
                    color: "#EF3F23",
                    border: "1px solid rgba(239,63,35,0.2)",
                    cursor: "pointer",
                  }}
                >
                  ✗ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
