/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Store,
  Check,
  X,
  MessageCircle,
  ClipboardList,
  Wallet,
  Repeat,
  ShieldCheck,
  BatteryFull,
  Camera,
} from "lucide-react";

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

const formatPrice = (n: number) => "₦" + n.toLocaleString("en-NG");

const statusBadge = (status: ListingStatus) => {
  const map = {
    pending: {
      bg: "rgba(217,119,6,0.12)",
      color: "var(--warning)",
      label: "Pending",
    },
    approved: {
      bg: "rgba(22,163,74,0.12)",
      color: "var(--success)",
      label: "Approved",
    },
    declined: {
      bg: "var(--accent-soft)",
      color: "var(--accent)",
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
    pending: {
      bg: "rgba(217,119,6,0.12)",
      color: "var(--warning)",
      label: "Pending",
    },
    approved: {
      bg: "rgba(22,163,74,0.12)",
      color: "var(--success)",
      label: "Approved",
    },
    rejected: {
      bg: "var(--accent-soft)",
      color: "var(--accent)",
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

type ChatEndRef = React.RefObject<HTMLDivElement | null>;

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
  const [extraMessages, setExtraMessages] = useState<Record<string, Message[]>>(
    {}
  );
  const [newMsg, setNewMsg] = useState("");
  const [tab, setTab] = useState<"detail" | "chat">("detail");
  const [showDetail, setShowDetail] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [vendorFilter, setVendorFilter] = useState<"all" | VendorStatus>("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetail, setShowVendorDetail] = useState(false);

  const messages: Message[] = selected
    ? [
        ...(MOCK_MESSAGES[selected.id] || []),
        ...(extraMessages[selected.id] || []),
      ]
    : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const timeAgo = (iso: string, now: number) => {
    const diff = now - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

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
      text: `Your listing has been declined: ${declineMsg}`,
      createdAt: new Date().toISOString(),
    };
    setExtraMessages((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), adminMsg],
    }));
    setDeclineModal(false);
    setDeclineMsg("");
    setTab("chat");
  };

  const sendMessage = (timestamp: number) => {
    if (!newMsg.trim() || !selected) return;
    const msg: Message = {
      id: timestamp.toString(),
      senderId: "admin",
      senderName: "TechNest Admin",
      senderRole: "admin",
      text: newMsg.trim(),
      createdAt: new Date().toISOString(),
    };
    setExtraMessages((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), msg],
    }));
    setNewMsg("");
  };

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
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <style>{`button, a, [role="button"], select { cursor: pointer !important; } * { box-sizing: border-box; }`}</style>

      <div
        className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold text-white flex-shrink-0"
            style={{ background: "var(--accent)" }}
          >
            A
          </div>
          <div>
            <p
              className="font-bold text-xs md:text-sm"
              style={{ color: "var(--ink)" }}
            >
              TechNest Admin
            </p>
            <p
              className="text-xs hidden sm:block"
              style={{ color: "var(--ink-soft)" }}
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
                background: "var(--accent-soft)",
                color: "var(--accent)",
                border: "1px solid var(--border)",
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
                background: "rgba(217,119,6,0.12)",
                color: "var(--warning)",
                border: "1px solid var(--border)",
              }}
            >
              {vendorCounts.pending} vendors pending
            </span>
          )}
          <button
            onClick={() => router.push("/")}
            className="text-xs px-2 md:px-3 py-1.5 rounded-lg"
            style={{
              color: "var(--ink-soft)",
              border: "1px solid var(--border)",
            }}
          >
            <span className="hidden sm:inline">← Back to site</span>
            <span className="sm:hidden">← Back</span>
          </button>
        </div>
      </div>

      <div
        className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-5 pb-0 flex gap-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {(
          [
            {
              key: "listings",
              Icon: Package,
              label: "Listings",
              count: listingCounts.pending,
            },
            {
              key: "vendors",
              Icon: Store,
              label: "Vendors",
              count: vendorCounts.pending,
            },
          ] as const
        ).map(({ key, Icon, label, count }) => (
          <button
            key={key}
            onClick={() => {
              setMainTab(key);
              setSelected(null);
              setSelectedVendor(null);
              setShowDetail(false);
              setShowVendorDetail(false);
            }}
            className="px-3 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-semibold rounded-t-xl flex items-center gap-1.5 md:gap-2"
            style={{
              background: mainTab === key ? "var(--bg)" : "transparent",
              color: mainTab === key ? "var(--ink)" : "var(--ink-soft)",
              borderBottom:
                mainTab === key
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
            }}
          >
            <Icon size={14} /> {label}
            {count > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {mainTab === "listings" && (
        <div className="relative flex-1 min-h-0">
          {showDetail && selected && (
            <div
              className="md:hidden absolute inset-0 z-20 flex flex-col"
              style={{ background: "var(--surface)" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                  style={{
                    color: "var(--ink-soft)",
                    border: "1px solid var(--border)",
                  }}
                >
                  ← Back
                </button>
                <div className="min-w-0">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--ink)" }}
                  >
                    {selected.deviceName}{" "}
                    {selected.storage && `(${selected.storage})`}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--ink-soft)" }}
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

          <div className="hidden md:flex h-full min-h-0">
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
                className="w-1/2 flex flex-col min-h-0"
                style={{ background: "var(--surface)" }}
              >
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--ink)" }}
                    >
                      {selected.deviceName}{" "}
                      {selected.storage && `(${selected.storage})`}
                    </p>
                    <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                      {selected.seller.name} · {selected.seller.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                    style={{
                      color: "var(--ink-soft)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <X size={12} /> Close
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

      {mainTab === "vendors" && (
        <div className="relative flex-1 min-h-0">
          {showVendorDetail && selectedVendor && (
            <div
              className="md:hidden absolute inset-0 z-20 flex flex-col overflow-y-auto"
              style={{ background: "var(--surface)" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-3 sticky top-0"
                style={{
                  background: "var(--surface)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <button
                  onClick={() => setShowVendorDetail(false)}
                  className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                  style={{
                    color: "var(--ink-soft)",
                    border: "1px solid var(--border)",
                  }}
                >
                  ← Back
                </button>
                <div className="min-w-0">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--ink)" }}
                  >
                    {selectedVendor.firstName} {selectedVendor.lastName}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--ink-soft)" }}
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

          <div className="hidden md:flex h-full min-h-0">
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
                className="w-1/2 flex flex-col min-h-0 overflow-y-auto"
                style={{ background: "var(--surface)" }}
              >
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--ink)" }}
                    >
                      {selectedVendor.firstName} {selectedVendor.lastName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                      {selectedVendor.businessName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                    style={{
                      color: "var(--ink-soft)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <X size={12} /> Close
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

      {declineModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="rounded-t-2xl sm:rounded-2xl p-5 md:p-6 w-full sm:max-w-md space-y-4"
            style={{ background: "var(--bg)" }}
          >
            <div>
              <h3 className="font-bold text-lg" style={{ color: "var(--ink)" }}>
                Decline Listing
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
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
              style={{
                borderColor: "var(--border)",
                color: "var(--ink)",
                background: "var(--bg)",
              }}
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
                    background: "var(--surface)",
                    color: "var(--ink-soft)",
                    border: "1px solid var(--border)",
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
                style={{ borderColor: "var(--border)", color: "var(--ink)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!declineMsg.trim()}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40"
                style={{ background: "var(--accent)" }}
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
  sendMessage: (timestamp: number) => void;
  handleApprove: (id: string) => void;
  setDeclineModal: (state: boolean) => void;
  chatEndRef: ChatEndRef;
  timeAgo: (iso: string, now: number) => string;
}) {
  const now = Date.now();

  return (
    <>
      <div
        className="flex-shrink-0 flex px-4 md:px-6 pt-3 md:pt-4 gap-1"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {(["detail", "chat"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-t-xl capitalize inline-flex items-center gap-1.5"
            style={{
              background: tab === t ? "var(--bg)" : "transparent",
              color: tab === t ? "var(--ink)" : "var(--ink-soft)",
              borderBottom:
                tab === t ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {t === "chat" ? (
              <>
                <MessageCircle size={13} /> Chat
                {messages.length > 0 ? ` (${messages.length})` : ""}
              </>
            ) : (
              <>
                <ClipboardList size={13} /> Details
              </>
            )}
          </button>
        ))}
      </div>

      {tab === "detail" && (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {statusBadge(selected.status)}
            {selected.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(selected.id)}
                  className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1"
                  style={{ background: "var(--success)", color: "#fff" }}
                >
                  <Check size={13} /> Approve
                </button>
                <button
                  onClick={() => setDeclineModal(true)}
                  className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <X size={13} /> Decline
                </button>
              </div>
            )}
            {selected.status === "approved" && (
              <span
                className="text-xs inline-flex items-center gap-1"
                style={{ color: "var(--success)" }}
              >
                <Check size={12} /> Live on marketplace
              </span>
            )}
          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="mono-label mb-3" style={{ color: "var(--ink-soft)" }}>
              SELLER INFO
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: "var(--accent)" }}
              >
                {selected.seller.name.charAt(0)}
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {selected.seller.name}
                </p>
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  {selected.seller.phone}
                </p>
                {selected.seller.email && (
                  <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    {selected.seller.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="mono-label mb-2" style={{ color: "var(--ink-soft)" }}>
              DEVICE DETAILS
            </p>
            <div className="flex justify-between text-xs md:text-sm gap-2">
              <span style={{ color: "var(--ink-soft)" }}>Device</span>
              <span
                className="font-medium text-right"
                style={{ color: "var(--ink)" }}
              >
                {selected.deviceName}
                {selected.storage ? ` ${selected.storage}` : ""}
              </span>
            </div>
            <div className="flex justify-between text-xs md:text-sm gap-2">
              <span style={{ color: "var(--ink-soft)" }}>Type</span>
              <span
                className="font-medium text-right inline-flex items-center gap-1"
                style={{ color: "var(--ink)" }}
              >
                {selected.listingType === "sell" ? (
                  <>
                    <Wallet size={12} /> For Sale
                  </>
                ) : (
                  <>
                    <Repeat size={12} /> Swap
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between text-xs md:text-sm gap-2">
              <span style={{ color: "var(--ink-soft)" }}>Battery</span>
              <span
                className="font-medium text-right"
                style={{ color: "var(--ink)" }}
              >
                {selected.batteryHealth}%
              </span>
            </div>
            <div className="flex justify-between text-xs md:text-sm gap-2">
              <span style={{ color: "var(--ink-soft)" }}>SIM Status</span>
              <span
                className="font-medium text-right"
                style={{ color: "var(--ink)" }}
              >
                {selected.simType || "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs md:text-sm gap-2">
              <span style={{ color: "var(--ink-soft)" }}>Face ID</span>
              <span
                className="font-medium text-right"
                style={{ color: "var(--ink)" }}
              >
                {selected.faceIdStatus || "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs md:text-sm gap-2">
              <span style={{ color: "var(--ink-soft)" }}>IMEI</span>
              <span
                className="font-medium text-right inline-flex items-center gap-1"
                style={{ color: "var(--ink)" }}
              >
                {selected.imeiVerified ? (
                  <>
                    <ShieldCheck
                      size={12}
                      style={{ color: "var(--success)" }}
                    />{" "}
                    Verified
                  </>
                ) : (
                  "Not verified"
                )}
              </span>
            </div>
            <div className="flex justify-between text-xs md:text-sm gap-2">
              <span style={{ color: "var(--ink-soft)" }}>Photos</span>
              <span
                className="font-medium text-right"
                style={{ color: "var(--ink)" }}
              >
                {selected.mediaCount} uploaded
              </span>
            </div>
            <div className="flex justify-between text-xs md:text-sm gap-2">
              <span style={{ color: "var(--ink-soft)" }}>Valuation</span>
              <span
                className="font-medium text-right"
                style={{ color: "var(--ink)" }}
              >
                {formatPrice(selected.estimatedMin)} –{" "}
                {formatPrice(selected.estimatedMax)}
              </span>
            </div>
            {selected.wantedDevice && (
              <div className="flex justify-between text-xs md:text-sm gap-2">
                <span style={{ color: "var(--ink-soft)" }}>Wants</span>
                <span
                  className="font-medium text-right"
                  style={{ color: "var(--ink)" }}
                >
                  {selected.wantedDevice}
                </span>
              </div>
            )}
            {selected.description && (
              <div
                className="pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Description
                </p>
                <p
                  className="text-xs md:text-sm"
                  style={{ color: "var(--ink)" }}
                >
                  {selected.description}
                </p>
              </div>
            )}
            {selected.repairs.length > 0 && (
              <div
                className="pt-2"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Repairs / History
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.repairs.map((r: string) => (
                    <span
                      key={r}
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
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
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="mono-label mb-3" style={{ color: "var(--ink-soft)" }}>
              LISTING REQUIREMENTS
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
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                {met ? (
                  <Check size={14} style={{ color: "var(--success)" }} />
                ) : (
                  <X size={14} style={{ color: "var(--accent)" }} />
                )}
                <span
                  className="text-xs"
                  style={{ color: met ? "var(--ink-soft)" : "var(--accent)" }}
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
                background: "var(--accent-soft)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: "var(--accent)" }}
              >
                Decline Reason
              </p>
              <p className="text-xs md:text-sm" style={{ color: "var(--ink)" }}>
                {selected.declineReason}
              </p>
            </div>
          )}

          <button
            onClick={() => setTab("chat")}
            className="w-full py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
            style={{
              background: "var(--surface)",
              color: "var(--ink-soft)",
              border: "1px solid var(--border)",
            }}
          >
            <MessageCircle size={14} /> Open Chat with Seller
          </button>
        </div>
      )}

      {tab === "chat" && (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div
                className="text-center py-12"
                style={{ color: "var(--ink-soft)" }}
              >
                <MessageCircle size={28} className="mx-auto mb-2" />
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
                    <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                      {m.senderName} · {timeAgo(m.createdAt, now)}
                    </p>
                    <div
                      className="px-4 py-2.5 rounded-2xl text-xs md:text-sm"
                      style={{
                        background: isAdmin
                          ? "var(--accent)"
                          : "var(--surface)",
                        color: isAdmin ? "#fff" : "var(--ink)",
                        borderTopRightRadius: isAdmin ? 4 : undefined,
                        borderTopLeftRadius: isAdmin ? undefined : 4,
                        border: isAdmin ? "none" : "1px solid var(--border)",
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
            className="flex-shrink-0 p-3 md:p-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {[
                "Please upload more photos",
                "Your IMEI check failed",
                "Add Parts & Services screenshot",
                "Your listing is approved",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => setNewMsg(t)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: "var(--surface)",
                    color: "var(--ink-soft)",
                    border: "1px solid var(--border)",
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
                onKeyDown={(e) => e.key === "Enter" && sendMessage(Date.now())}
                placeholder="Type a message..."
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--surface)",
                  color: "var(--ink)",
                  border: "1px solid var(--border)",
                }}
              />
              <button
                onClick={() => sendMessage(Date.now())}
                className="px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "var(--accent)", color: "#fff" }}
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
  timeAgo: (iso: string, now: number) => string;
  hasSelected: boolean;
}) {
  const now = Date.now();

  return (
    <div
      className={`flex flex-col min-h-0 ${
        hasSelected ? "w-1/2" : "w-full"
      } transition-all`}
      style={{ borderRight: hasSelected ? "1px solid var(--border)" : "none" }}
    >
      <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4 flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "declined"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setListingFilter(f)}
            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium"
            style={{
              background:
                listingFilter === f ? "var(--surface)" : "transparent",
              color: listingFilter === f ? "var(--ink)" : "var(--ink-soft)",
              border:
                listingFilter === f
                  ? "1px solid var(--border)"
                  : "1px solid transparent",
            }}
          >
            <span className="capitalize">{f}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background:
                  f === "pending"
                    ? "rgba(217,119,6,0.15)"
                    : f === "approved"
                    ? "rgba(22,163,74,0.15)"
                    : f === "declined"
                    ? "var(--accent-soft)"
                    : "var(--surface)",
                color:
                  f === "pending"
                    ? "var(--warning)"
                    : f === "approved"
                    ? "var(--success)"
                    : f === "declined"
                    ? "var(--accent)"
                    : "var(--ink-soft)",
              }}
            >
              {listingCounts[f]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 pb-6 space-y-2">
        {filteredListings.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "var(--ink-soft)" }}
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
                selected?.id === listing.id ? "var(--surface)" : "var(--bg)",
              border:
                selected?.id === listing.id
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className="text-xs md:text-sm font-semibold truncate"
                    style={{ color: "var(--ink)" }}
                  >
                    {listing.deviceName}{" "}
                    {listing.storage && `(${listing.storage})`}
                  </p>
                  {statusBadge(listing.status)}
                  {(listing.unreadMessages ?? 0) > 0 && (
                    <span
                      className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      {listing.unreadMessages}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-1 truncate"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {listing.seller.name} · {listing.seller.phone} ·{" "}
                  {timeAgo(listing.createdAt, now)}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                    style={{
                      background:
                        listing.listingType === "sell"
                          ? "rgba(22,163,74,0.12)"
                          : "var(--accent-soft)",
                      color:
                        listing.listingType === "sell"
                          ? "var(--success)"
                          : "var(--accent)",
                    }}
                  >
                    {listing.listingType === "sell" ? (
                      <>
                        <Wallet size={11} /> Sell
                      </>
                    ) : (
                      <>
                        <Repeat size={11} /> Swap
                      </>
                    )}
                  </span>
                  {listing.imeiVerified && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                      style={{
                        background: "rgba(22,163,74,0.12)",
                        color: "var(--success)",
                      }}
                    >
                      <ShieldCheck size={11} /> IMEI
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                    style={{
                      background: "var(--surface)",
                      color: "var(--ink-soft)",
                    }}
                  >
                    <BatteryFull size={11} /> {listing.batteryHealth}%
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1"
                    style={{
                      background: "var(--surface)",
                      color: "var(--ink-soft)",
                    }}
                  >
                    <Camera size={11} /> {listing.mediaCount}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className="text-xs md:text-sm font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  {formatPrice(listing.estimatedMin)}
                </p>
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
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
                  className="flex-1 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1"
                  style={{
                    background: "rgba(22,163,74,0.12)",
                    color: "var(--success)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Check size={12} /> Approve
                </button>
                <button
                  onClick={() => {
                    setSelected(listing);
                    setDeclineModal(true);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <X size={12} /> Decline
                </button>
                <button
                  onClick={() => {
                    setSelected(listing);
                    setTab("chat");
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "var(--surface)",
                    color: "var(--ink-soft)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <MessageCircle size={13} />
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
              className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1"
              style={{ background: "var(--success)", color: "#fff" }}
            >
              <Check size={13} /> Approve
            </button>
            <button
              onClick={() => handleVendorReject(vendor.id)}
              className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                border: "1px solid var(--border)",
              }}
            >
              <X size={13} /> Reject
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
          mono: false,
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
          mono: false,
        },
      ].map(({ title, rows, mono }) => (
        <div
          key={title}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="mono-label mb-2" style={{ color: "var(--ink-soft)" }}>
            {title.toUpperCase()}
          </p>
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between text-xs md:text-sm gap-2"
            >
              <span style={{ color: "var(--ink-soft)" }}>{k}</span>
              <span
                className="font-medium text-right max-w-[60%]"
                style={{
                  color: "var(--ink)",
                  ...(mono
                    ? { fontFamily: "monospace", letterSpacing: "0.1em" }
                    : {}),
                }}
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
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="mono-label mb-3" style={{ color: "var(--ink-soft)" }}>
          KYC CHECKLIST
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
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {met ? (
              <Check size={14} style={{ color: "var(--success)" }} />
            ) : (
              <X size={14} style={{ color: "var(--accent)" }} />
            )}
            <span
              className="text-xs"
              style={{ color: met ? "var(--ink-soft)" : "var(--accent)" }}
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
      className={`flex flex-col min-h-0 ${
        selectedVendor ? "w-1/2" : "w-full"
      } transition-all`}
      style={{
        borderRight: selectedVendor ? "1px solid var(--border)" : "none",
      }}
    >
      <div className="flex-shrink-0 px-6 pt-5 pb-4 flex gap-3 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setVendorFilter(f)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              background: vendorFilter === f ? "var(--surface)" : "transparent",
              color: vendorFilter === f ? "var(--ink)" : "var(--ink-soft)",
              border:
                vendorFilter === f
                  ? "1px solid var(--border)"
                  : "1px solid transparent",
            }}
          >
            <span className="capitalize">{f}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background:
                  f === "pending"
                    ? "rgba(217,119,6,0.15)"
                    : f === "approved"
                    ? "rgba(22,163,74,0.15)"
                    : f === "rejected"
                    ? "var(--accent-soft)"
                    : "var(--surface)",
                color:
                  f === "pending"
                    ? "var(--warning)"
                    : f === "approved"
                    ? "var(--success)"
                    : f === "rejected"
                    ? "var(--accent)"
                    : "var(--ink-soft)",
              }}
            >
              {vendorCounts[f]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-auto px-6 pb-6">
        {filteredVendors.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "var(--ink-soft)" }}
          >
            No vendors in this category
          </div>
        )}
        {filteredVendors.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--surface)",
                  borderBottom: "1px solid var(--border)",
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
                      color: "var(--ink-soft)",
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
                        ? "var(--surface)"
                        : i % 2 === 0
                        ? "transparent"
                        : "rgba(128,128,128,0.03)",
                    borderBottom: "1px solid var(--border)",
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
                          background: "var(--accent)",
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
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--ink)",
                        }}
                      >
                        {v.firstName} {v.lastName}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.email}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.phone}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "var(--ink-soft)",
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
                      color: "var(--ink-soft)",
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
                      color: "var(--ink)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.businessName}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "var(--ink-soft)",
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
                      color: "var(--ink-soft)",
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
                            color: "var(--success)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVendorReject(v.id)}
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {v.status === "approved" && (
                      <span style={{ fontSize: 11, color: "var(--success)" }}>
                        Active
                      </span>
                    )}
                    {v.status === "rejected" && (
                      <span style={{ fontSize: 11, color: "var(--accent)" }}>
                        Rejected
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
      <div className="flex-shrink-0 px-4 pt-4 pb-3 flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setVendorFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{
              background: vendorFilter === f ? "var(--surface)" : "transparent",
              color: vendorFilter === f ? "var(--ink)" : "var(--ink-soft)",
              border:
                vendorFilter === f
                  ? "1px solid var(--border)"
                  : "1px solid transparent",
            }}
          >
            <span className="capitalize">{f}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background:
                  f === "pending"
                    ? "rgba(217,119,6,0.15)"
                    : f === "approved"
                    ? "rgba(22,163,74,0.15)"
                    : f === "rejected"
                    ? "var(--accent-soft)"
                    : "var(--surface)",
                color:
                  f === "pending"
                    ? "var(--warning)"
                    : f === "approved"
                    ? "var(--success)"
                    : f === "rejected"
                    ? "var(--accent)"
                    : "var(--ink-soft)",
              }}
            >
              {vendorCounts[f]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 space-y-2">
        {filteredVendors.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "var(--ink-soft)" }}
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
              background:
                selectedVendor?.id === v.id ? "var(--surface)" : "var(--bg)",
              border:
                selectedVendor?.id === v.id
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: "var(--accent)" }}
                >
                  {v.firstName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {v.firstName} {v.lastName}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {v.businessName}
                  </p>
                </div>
              </div>
              {vendorBadge(v.status)}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  Phone
                </p>
                <p className="text-xs" style={{ color: "var(--ink)" }}>
                  {v.phone}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  State
                </p>
                <p className="text-xs" style={{ color: "var(--ink)" }}>
                  {v.state}
                </p>
              </div>
            </div>
            {v.status === "pending" && (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleVendorApprove(v.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1"
                  style={{
                    background: "rgba(22,163,74,0.12)",
                    color: "var(--success)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Check size={12} /> Approve
                </button>
                <button
                  onClick={() => handleVendorReject(v.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <X size={12} /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
