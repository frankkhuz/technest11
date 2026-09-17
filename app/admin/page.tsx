/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import { ThemeToggle } from "@/app/component/layout/Navbar";
import { useTheme } from "@/app/hooks/useTheme";
function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

type VendorStatus = "pending" | "approved";

type Vendor = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessRegNumber?: string;
  shopAddress?: string;
  vendorVerified: boolean;
  createdAt: string;
  status: VendorStatus;
};

type ListingStatus = "pending_review" | "active" | "rejected";

type Listing = {
  id: string;
  deviceName: string;
  storage?: string;
  listingType: string; // "sell"/"cash" or "swap" depending on where it was created
  wantedDevice?: string;
  estimatedMin?: number;
  estimatedMax?: number;
  batteryHealth?: string;
  simType?: string;
  faceIdStatus?: string;
  repairs?: string[];
  imeiVerified?: boolean;
  mediaCount?: number;
  ownerName?: string;
  ownerEmail?: string;
  status: ListingStatus;
  rejectionReason?: string | null;
  createdAt: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const vendorBadge = (status: VendorStatus) => {
  const map = {
    pending: { bg: "rgba(217,119,6,0.1)", color: "#d97706", label: "Pending" },
    approved: {
      bg: "rgba(22,163,74,0.1)",
      color: "#16a34a",
      label: "Approved",
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

const listingBadge = (status: ListingStatus) => {
  const map = {
    pending_review: {
      bg: "rgba(217,119,6,0.1)",
      color: "#d97706",
      label: "Pending review",
    },
    active: { bg: "rgba(22,163,74,0.1)", color: "#16a34a", label: "Active" },
    rejected: {
      bg: "rgba(220,38,38,0.1)",
      color: "#DC2626",
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

const formatPrice = (n?: number) =>
  typeof n === "number" ? `₦${n.toLocaleString()}` : "—";

export default function AdminPanel() {
  const router = useRouter();
  const { dark, toggle } = useTheme();

  const [section, setSection] = useState<"vendors" | "listings">("vendors");

  // ── Vendors state (unchanged) ──
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [vendorFilter, setVendorFilter] = useState<"all" | VendorStatus>("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetail, setShowVendorDetail] = useState(false);

  // ── Listings state ──
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [listingActionError, setListingActionError] = useState<string | null>(
    null
  );

  const [listingFilter, setListingFilter] = useState<"all" | ListingStatus>(
    "pending_review"
  );
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showListingDetail, setShowListingDetail] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/admin/vendors");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load vendors");

      const raw = json.data?.vendors ?? json.vendors ?? [];

      const mapped: Vendor[] = raw
        .filter((v: any) => v.vendorVerified || v.vendorProfile)
        .map((v: any) => ({
          id: v._id,
          name: v.name,
          email: v.email,
          phone: v.vendorProfile?.phone,
          businessRegNumber: v.vendorProfile?.businessRegNumber,
          shopAddress: v.vendorProfile?.shopAddress,
          vendorVerified: v.vendorVerified,
          createdAt: v.createdAt,
          status: v.vendorVerified ? "approved" : "pending",
        }));

      setVendors(mapped);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    setLoadingListings(true);
    setListingsError(null);
    try {
      const res = await apiFetch("/api/admin/listings");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load listings");

      const raw = json.data?.listings ?? json.listings ?? [];

      const mapped: Listing[] = raw.map((l: any) => ({
        id: l._id,
        deviceName: l.deviceName,
        storage: l.storage,
        listingType: l.listingType,
        wantedDevice: l.wantedDevice,
        estimatedMin: l.estimatedMin,
        estimatedMax: l.estimatedMax,
        batteryHealth: l.batteryHealth,
        simType: l.simType,
        faceIdStatus: l.faceIdStatus,
        repairs: l.repairs ?? [],
        imeiVerified: l.imeiVerified,
        mediaCount: l.mediaCount,
        ownerName: l.owner?.name,
        ownerEmail: l.owner?.email,
        status: l.status,
        rejectionReason: l.rejectionReason,
        createdAt: l.createdAt,
      }));

      setListings(mapped);
    } catch (e: any) {
      setListingsError(e.message || "Something went wrong");
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchListings();
  }, []);

  const handleVendorApprove = async (id: string) => {
    setActionError(null);
    try {
      const res = await apiFetch(`/api/admin/vendors/${id}/approve`, {
        method: "PATCH",
        headers: { "X-CSRF-Token": getCsrfToken() },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Approve failed");

      setVendors((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, vendorVerified: true, status: "approved" } : v
        )
      );
      if (selectedVendor?.id === id)
        setSelectedVendor((v) =>
          v ? { ...v, vendorVerified: true, status: "approved" } : v
        );
    } catch (e: any) {
      setActionError(e.message || "Approve failed");
    }
  };

  const handleVendorReject = async (id: string) => {
    setActionError(null);
    try {
      const res = await apiFetch(`/api/admin/vendors/${id}/reject`, {
        method: "PATCH",
        headers: { "X-CSRF-Token": getCsrfToken() },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Reject failed");

      // backend clears vendorProfile on reject, so the vendor no longer
      // qualifies as "applied" until they resubmit — drop from the list
      setVendors((prev) => prev.filter((v) => v.id !== id));
      if (selectedVendor?.id === id) {
        setSelectedVendor(null);
        setShowVendorDetail(false);
      }
    } catch (e: any) {
      setActionError(e.message || "Reject failed");
    }
  };

  const handleListingApprove = async (id: string) => {
    setListingActionError(null);
    try {
      const res = await apiFetch(`/api/admin/listings/${id}/approve`, {
        method: "PATCH",
        headers: { "X-CSRF-Token": getCsrfToken() },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Approve failed");

      setListings((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, status: "active", rejectionReason: null } : l
        )
      );
      if (selectedListing?.id === id)
        setSelectedListing((l) =>
          l ? { ...l, status: "active", rejectionReason: null } : l
        );
    } catch (e: any) {
      setListingActionError(e.message || "Approve failed");
    }
  };

  const handleListingReject = async (id: string) => {
    const reason = window.prompt(
      "Reason for rejecting this listing (optional, shown to the owner):"
    );
    if (reason === null) return; // user cancelled

    setListingActionError(null);
    try {
      const res = await apiFetch(`/api/admin/listings/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Reject failed");

      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status: "rejected",
                rejectionReason: reason.trim() || null,
              }
            : l
        )
      );
      if (selectedListing?.id === id)
        setSelectedListing((l) =>
          l
            ? {
                ...l,
                status: "rejected",
                rejectionReason: reason.trim() || null,
              }
            : l
        );
    } catch (e: any) {
      setListingActionError(e.message || "Reject failed");
    }
  };

  const vendorCounts = {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === "pending").length,
    approved: vendors.filter((v) => v.status === "approved").length,
  };

  const filteredVendors = vendors.filter(
    (v) => vendorFilter === "all" || v.status === vendorFilter
  );

  const listingCounts = {
    all: listings.length,
    pending_review: listings.filter((l) => l.status === "pending_review")
      .length,
    active: listings.filter((l) => l.status === "active").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  const filteredListings = listings.filter(
    (l) => listingFilter === "all" || l.status === listingFilter
  );

  const pendingTotal = vendorCounts.pending + listingCounts.pending_review;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        button, a, [role="button"], select { cursor: pointer !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Top bar ── */}
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
            style={{ background: "var(--accent)" }}
          >
            A
          </div>
          <div>
            <p
              className="text-white font-bold text-xs md:text-sm"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Tech<span style={{ color: "var(--accent)" }}>Nest</span> Admin
            </p>
            <p
              className="text-xs hidden sm:block"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {section === "vendors"
                ? "Vendor Verification"
                : "Listing Moderation"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle dark={dark} onToggle={toggle} size="w-8 h-8" />
          {pendingTotal > 0 && (
            <span
              className="text-xs font-bold px-2 md:px-3 py-1 rounded-full"
              style={{
                background: "rgba(217,119,6,0.15)",
                color: "#d97706",
                border: "1px solid rgba(217,119,6,0.3)",
              }}
            >
              <span className="hidden sm:inline">{pendingTotal} pending</span>
              <span className="sm:hidden">{pendingTotal}</span>
            </span>
          )}
          <button
            onClick={() => {
              fetchVendors();
              fetchListings();
            }}
            className="text-xs px-2 md:px-3 py-1.5 rounded-lg"
            style={{
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            ↻ <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-xs px-2 md:px-3 py-1.5 rounded-lg"
            style={{
              color: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            ← <span className="hidden sm:inline">Back to site</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </div>

      {/* ── Section switcher ── */}
      <div
        className="px-4 md:px-6 pt-4 flex gap-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {(
          [
            { key: "vendors", label: "Vendors", count: vendorCounts.pending },
            {
              key: "listings",
              label: "Listings",
              count: listingCounts.pending_review,
            },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold"
            style={{
              color: section === key ? "var(--ink)" : "var(--ink-soft)",
              borderBottom:
                section === key ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {label}
            {count > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(217,119,6,0.2)", color: "#d97706" }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {section === "vendors" && actionError && (
        <div
          className="mx-4 md:mx-6 mt-4 px-4 py-3 rounded-xl text-xs md:text-sm"
          style={{
            background: "rgba(220,38,38,0.1)",
            color: "#DC2626",
            border: "1px solid rgba(220,38,38,0.25)",
          }}
        >
          {actionError}
        </div>
      )}
      {section === "listings" && listingActionError && (
        <div
          className="mx-4 md:mx-6 mt-4 px-4 py-3 rounded-xl text-xs md:text-sm"
          style={{
            background: "rgba(220,38,38,0.1)",
            color: "#DC2626",
            border: "1px solid rgba(220,38,38,0.25)",
          }}
        >
          {listingActionError}
        </div>
      )}

      <div className="relative" style={{ height: "calc(100vh - 128px)" }}>
        {section === "vendors" && (
          <VendorSection
            loading={loading}
            error={error}
            fetchVendors={fetchVendors}
            showVendorDetail={showVendorDetail}
            setShowVendorDetail={setShowVendorDetail}
            selectedVendor={selectedVendor}
            setSelectedVendor={setSelectedVendor}
            filteredVendors={filteredVendors}
            vendorFilter={vendorFilter}
            setVendorFilter={setVendorFilter}
            vendorCounts={vendorCounts}
            handleVendorApprove={handleVendorApprove}
            handleVendorReject={handleVendorReject}
          />
        )}

        {section === "listings" && (
          <ListingSection
            loading={loadingListings}
            error={listingsError}
            fetchListings={fetchListings}
            showListingDetail={showListingDetail}
            setShowListingDetail={setShowListingDetail}
            selectedListing={selectedListing}
            setSelectedListing={setSelectedListing}
            filteredListings={filteredListings}
            listingFilter={listingFilter}
            setListingFilter={setListingFilter}
            listingCounts={listingCounts}
            handleListingApprove={handleListingApprove}
            handleListingReject={handleListingReject}
          />
        )}
      </div>
    </div>
  );
}

// ── Vendors section (unchanged behaviour, extracted for the tab layout) ──────

function VendorSection({
  loading,
  error,
  fetchVendors,
  showVendorDetail,
  setShowVendorDetail,
  selectedVendor,
  setSelectedVendor,
  filteredVendors,
  vendorFilter,
  setVendorFilter,
  vendorCounts,
  handleVendorApprove,
  handleVendorReject,
}: {
  loading: boolean;
  error: string | null;
  fetchVendors: () => void;
  showVendorDetail: boolean;
  setShowVendorDetail: (v: boolean) => void;
  selectedVendor: Vendor | null;
  setSelectedVendor: (v: Vendor | null) => void;
  filteredVendors: Vendor[];
  vendorFilter: "all" | VendorStatus;
  setVendorFilter: (f: "all" | VendorStatus) => void;
  vendorCounts: Record<"all" | VendorStatus, number>;
  handleVendorApprove: (id: string) => void;
  handleVendorReject: (id: string) => void;
}) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: "var(--ink-soft)" }}
      >
        Loading vendors…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p style={{ color: "#DC2626" }} className="text-sm">
          {error}
        </p>
        <button
          onClick={fetchVendors}
          className="text-xs px-4 py-2 rounded-lg"
          style={{
            background: "var(--border)",
            color: "var(--ink)",
            border: "1px solid var(--border)",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
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
                className="font-semibold text-sm truncate"
                style={{ color: "var(--ink)" }}
              >
                {selectedVendor.name}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--ink-soft)" }}
              >
                {selectedVendor.email}
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
                  {selectedVendor.name}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {selectedVendor.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{
                  color: "var(--ink-soft)",
                  border: "1px solid var(--border)",
                }}
              >
                <X className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Close
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
    </>
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
              style={{ background: "#16a34a", color: "#fff" }}
            >
              <Check className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Approve
            </button>
            <button
              onClick={() => handleVendorReject(vendor.id)}
              className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "rgba(220,38,38,0.15)",
                color: "#DC2626",
                border: "1px solid rgba(220,38,38,0.3)",
              }}
            >
              <X className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Reject
            </button>
          </div>
        )}
        {vendor.status === "approved" && (
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Evict ${vendor.name} as a vendor? They lose vendor access immediately and their vendor profile is cleared — this can't be undone from here, they'd have to reapply.`
                )
              ) {
                handleVendorReject(vendor.id);
              }
            }}
            className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold"
            style={{
              background: "rgba(220,38,38,0.15)",
              color: "#DC2626",
              border: "1px solid rgba(220,38,38,0.3)",
            }}
          >
            <ShieldAlert className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Evict Vendor
          </button>
        )}
      </div>
      {[
        {
          title: "Account",
          rows: [
            ["Name", vendor.name],
            ["Email", vendor.email],
          ],
        },
        {
          title: "Vendor Profile",
          rows: [
            ["Phone", vendor.phone || "—"],
            ["Business Reg. Number", vendor.businessRegNumber || "—"],
            ["Shop Address", vendor.shopAddress || "—"],
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
      ].map(({ title, rows }) => (
        <div
          key={title}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "var(--border)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--ink-soft)" }}
          >
            {title}
          </p>
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between text-xs md:text-sm gap-2"
            >
              <span style={{ color: "var(--ink-soft)" }}>{k}</span>
              <span
                className="font-medium text-right max-w-[60%]"
                style={{ color: "var(--ink)" }}
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
          background: "var(--border)",
          border: "1px solid var(--border)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--ink-soft)" }}
        >
          Submission Checklist
        </p>
        {[
          { label: "Name on file", met: !!vendor.name },
          { label: "Email on file", met: !!vendor.email },
          { label: "Phone provided", met: !!vendor.phone },
          {
            label: "Business registration number provided",
            met: !!vendor.businessRegNumber,
          },
          { label: "Shop address provided", met: !!vendor.shopAddress },
        ].map(({ label, met }) => (
          <div
            key={label}
            className="flex items-center gap-2 py-1.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span style={{ color: met ? "#16a34a" : "#DC2626", fontSize: 14 }}>
              {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            </span>
            <span
              className="text-xs"
              style={{
                color: met ? "var(--ink-soft)" : "rgba(220,38,38,0.8)",
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
          ? "1px solid var(--border)"
          : "none",
      }}
    >
      <div className="px-6 pt-5 pb-4 flex gap-3 flex-wrap">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setVendorFilter(f)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              background:
                vendorFilter === f ? "var(--border)" : "transparent",
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
                    ? "rgba(217,119,6,0.2)"
                    : f === "approved"
                    ? "rgba(22,163,74,0.2)"
                    : "var(--border)",
                color:
                  f === "pending"
                    ? "#d97706"
                    : f === "approved"
                    ? "#16a34a"
                    : "var(--ink-soft)",
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
                  background: "var(--border)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {[
                  "Name",
                  "Email",
                  "Phone",
                  "Business Reg. No.",
                  "Shop Address",
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
                        ? "var(--border)"
                        : i % 2 === 0
                        ? "transparent"
                        : "transparent",
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
                        {v.name.charAt(0)}
                      </div>
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}
                      >
                        {v.name}
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
                    {v.phone || "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.businessRegNumber || "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      whiteSpace: "nowrap",
                      maxWidth: 220,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {v.shopAddress || "—"}
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
                    {v.status === "pending" ? (
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
                          <Check className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => handleVendorReject(v.id)}
                          style={{
                            background: "rgba(220,38,38,0.1)",
                            color: "#DC2626",
                            border: "1px solid rgba(220,38,38,0.2)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <X className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Reject
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, color: "#16a34a" }}>
                          <Check className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Active
                        </span>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Evict ${v.name} as a vendor? They lose vendor access immediately and their vendor profile is cleared — this can't be undone from here, they'd have to reapply.`
                              )
                            ) {
                              handleVendorReject(v.id);
                            }
                          }}
                          style={{
                            background: "rgba(220,38,38,0.1)",
                            color: "#DC2626",
                            border: "1px solid rgba(220,38,38,0.2)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <ShieldAlert className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Evict
                        </button>
                      </div>
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
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setVendorFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{
              background:
                vendorFilter === f ? "var(--border)" : "transparent",
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
                    ? "rgba(217,119,6,0.2)"
                    : f === "approved"
                    ? "rgba(22,163,74,0.2)"
                    : "var(--border)",
                color:
                  f === "pending"
                    ? "#d97706"
                    : f === "approved"
                    ? "#16a34a"
                    : "var(--ink-soft)",
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
                selectedVendor?.id === v.id
                  ? "var(--accent-soft)"
                  : "var(--border)",
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
                  {v.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {v.name}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {v.email}
                  </p>
                </div>
              </div>
              {vendorBadge(v.status)}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Phone
                </p>
                <p className="text-xs" style={{ color: "var(--ink)" }}>
                  {v.phone || "—"}
                </p>
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Business Reg. No.
                </p>
                <p className="text-xs" style={{ color: "var(--ink)" }}>
                  {v.businessRegNumber || "—"}
                </p>
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
                  }}
                >
                  <Check className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Approve
                </button>
                <button
                  onClick={() => handleVendorReject(v.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(220,38,38,0.1)",
                    color: "#DC2626",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  <X className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Reject
                </button>
              </div>
            )}
            {v.status === "approved" && (
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Evict ${v.name} as a vendor? They lose vendor access immediately and their vendor profile is cleared — this can't be undone from here, they'd have to reapply.`
                      )
                    ) {
                      handleVendorReject(v.id);
                    }
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(220,38,38,0.1)",
                    color: "#DC2626",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  <ShieldAlert className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Evict Vendor
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Listings section (new — mirrors the vendor components above) ────────────

function ListingSection({
  loading,
  error,
  fetchListings,
  showListingDetail,
  setShowListingDetail,
  selectedListing,
  setSelectedListing,
  filteredListings,
  listingFilter,
  setListingFilter,
  listingCounts,
  handleListingApprove,
  handleListingReject,
}: {
  loading: boolean;
  error: string | null;
  fetchListings: () => void;
  showListingDetail: boolean;
  setShowListingDetail: (v: boolean) => void;
  selectedListing: Listing | null;
  setSelectedListing: (l: Listing | null) => void;
  filteredListings: Listing[];
  listingFilter: "all" | ListingStatus;
  setListingFilter: (f: "all" | ListingStatus) => void;
  listingCounts: Record<"all" | ListingStatus, number>;
  handleListingApprove: (id: string) => void;
  handleListingReject: (id: string) => void;
}) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: "var(--ink-soft)" }}
      >
        Loading listings…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p style={{ color: "#DC2626" }} className="text-sm">
          {error}
        </p>
        <button
          onClick={fetchListings}
          className="text-xs px-4 py-2 rounded-lg"
          style={{
            background: "var(--border)",
            color: "var(--ink)",
            border: "1px solid var(--border)",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {showListingDetail && selectedListing && (
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
              onClick={() => setShowListingDetail(false)}
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
                {selectedListing.deviceName}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--ink-soft)" }}
              >
                {selectedListing.ownerName}
              </p>
            </div>
          </div>
          <ListingDetailContent
            listing={selectedListing}
            handleListingApprove={handleListingApprove}
            handleListingReject={handleListingReject}
          />
        </div>
      )}

      <div className="hidden md:flex h-full">
        <ListingList
          filteredListings={filteredListings}
          listingFilter={listingFilter}
          setListingFilter={setListingFilter}
          listingCounts={listingCounts}
          selectedListing={selectedListing}
          setSelectedListing={setSelectedListing}
          handleListingApprove={handleListingApprove}
          handleListingReject={handleListingReject}
        />
        {selectedListing && (
          <div
            className="w-1/2 flex flex-col overflow-y-auto"
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
                  {selectedListing.deviceName}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {selectedListing.ownerName} · {selectedListing.ownerEmail}
                </p>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{
                  color: "var(--ink-soft)",
                  border: "1px solid var(--border)",
                }}
              >
                <X className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Close
              </button>
            </div>
            <ListingDetailContent
              listing={selectedListing}
              handleListingApprove={handleListingApprove}
              handleListingReject={handleListingReject}
            />
          </div>
        )}
      </div>

      <div
        className="md:hidden h-full flex flex-col"
        style={{ display: showListingDetail ? "none" : "flex" }}
      >
        <MobileListingList
          filteredListings={filteredListings}
          listingFilter={listingFilter}
          setListingFilter={setListingFilter}
          listingCounts={listingCounts}
          selectedListing={selectedListing}
          setSelectedListing={(l) => {
            setSelectedListing(l);
            setShowListingDetail(true);
          }}
          handleListingApprove={handleListingApprove}
          handleListingReject={handleListingReject}
        />
      </div>
    </>
  );
}

function ListingDetailContent({
  listing,
  handleListingApprove,
  handleListingReject,
}: {
  listing: Listing;
  handleListingApprove: (id: string) => void;
  handleListingReject: (id: string) => void;
}) {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {listingBadge(listing.status)}
        {listing.status === "pending_review" && (
          <div className="flex gap-2">
            <button
              onClick={() => handleListingApprove(listing.id)}
              className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: "#16a34a", color: "#fff" }}
            >
              <Check className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Approve
            </button>
            <button
              onClick={() => handleListingReject(listing.id)}
              className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "rgba(220,38,38,0.15)",
                color: "#DC2626",
                border: "1px solid rgba(220,38,38,0.3)",
              }}
            >
              <X className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Reject
            </button>
          </div>
        )}
      </div>

      {listing.status === "rejected" && listing.rejectionReason && (
        <div
          className="rounded-xl p-3 text-xs"
          style={{
            background: "rgba(220,38,38,0.08)",
            color: "rgba(220,38,38,0.9)",
            border: "1px solid rgba(220,38,38,0.2)",
          }}
        >
          Rejection reason: {listing.rejectionReason}
        </div>
      )}

      {[
        {
          title: "Owner",
          rows: [
            ["Name", listing.ownerName || "—"],
            ["Email", listing.ownerEmail || "—"],
          ],
        },
        {
          title: "Device",
          rows: [
            ["Device", listing.deviceName],
            ["Storage", listing.storage || "—"],
            ["Type", listing.listingType === "swap" ? "Swap" : "For sale"],
            ...(listing.listingType === "swap"
              ? [["Wants", listing.wantedDevice || "—"]]
              : []),
            [
              "Estimated value",
              `${formatPrice(listing.estimatedMin)} – ${formatPrice(
                listing.estimatedMax
              )}`,
            ],
            [
              "Battery health",
              listing.batteryHealth ? `${listing.batteryHealth}%` : "—",
            ],
            ["SIM type", listing.simType || "—"],
            ["Face ID", listing.faceIdStatus || "—"],
            [
              "Repairs",
              listing.repairs?.length
                ? listing.repairs.join(", ")
                : "None reported",
            ],
            [
              "Listed",
              new Date(listing.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            ],
          ],
        },
      ].map(({ title, rows }) => (
        <div
          key={title}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "var(--border)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--ink-soft)" }}
          >
            {title}
          </p>
          {rows.map(([k, v]) => (
            <div
              key={k as string}
              className="flex justify-between text-xs md:text-sm gap-2"
            >
              <span style={{ color: "var(--ink-soft)" }}>{k}</span>
              <span
                className="font-medium text-right max-w-[60%]"
                style={{ color: "var(--ink)" }}
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
          background: "var(--border)",
          border: "1px solid var(--border)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--ink-soft)" }}
        >
          Verification Checklist
        </p>
        {[
          { label: "IMEI verified", met: !!listing.imeiVerified },
          {
            label: `${listing.mediaCount || 0} photo${
              listing.mediaCount === 1 ? "" : "s"
            } uploaded`,
            met: (listing.mediaCount || 0) > 0,
          },
          { label: "Battery health disclosed", met: !!listing.batteryHealth },
        ].map(({ label, met }) => (
          <div
            key={label}
            className="flex items-center gap-2 py-1.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span style={{ color: met ? "#16a34a" : "#DC2626", fontSize: 14 }}>
              {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            </span>
            <span
              className="text-xs"
              style={{
                color: met ? "var(--ink-soft)" : "rgba(220,38,38,0.8)",
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

function ListingList({
  filteredListings,
  listingFilter,
  setListingFilter,
  listingCounts,
  selectedListing,
  setSelectedListing,
  handleListingApprove,
  handleListingReject,
}: {
  filteredListings: Listing[];
  listingFilter: "all" | ListingStatus;
  setListingFilter: (f: "all" | ListingStatus) => void;
  listingCounts: Record<"all" | ListingStatus, number>;
  selectedListing: Listing | null;
  setSelectedListing: (l: Listing | null) => void;
  handleListingApprove: (id: string) => void;
  handleListingReject: (id: string) => void;
}) {
  return (
    <div
      className={`flex flex-col ${
        selectedListing ? "w-1/2" : "w-full"
      } transition-all`}
      style={{
        borderRight: selectedListing
          ? "1px solid var(--border)"
          : "none",
      }}
    >
      <div className="px-6 pt-5 pb-4 flex gap-3 flex-wrap">
        {(["all", "pending_review", "active", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setListingFilter(f)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              background:
                listingFilter === f ? "var(--border)" : "transparent",
              color: listingFilter === f ? "var(--ink)" : "var(--ink-soft)",
              border:
                listingFilter === f
                  ? "1px solid var(--border)"
                  : "1px solid transparent",
            }}
          >
            <span className="capitalize">
              {f === "pending_review" ? "Pending" : f === "all" ? "All" : f}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background:
                  f === "pending_review"
                    ? "rgba(217,119,6,0.2)"
                    : f === "active"
                    ? "rgba(22,163,74,0.2)"
                    : f === "rejected"
                    ? "rgba(220,38,38,0.2)"
                    : "var(--border)",
                color:
                  f === "pending_review"
                    ? "#d97706"
                    : f === "active"
                    ? "#16a34a"
                    : f === "rejected"
                    ? "#DC2626"
                    : "var(--ink-soft)",
              }}
            >
              {listingCounts[f]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6">
        {filteredListings.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "var(--ink-soft)" }}
          >
            No listings in this category
          </div>
        )}
        {filteredListings.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--border)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {[
                  "Device",
                  "Owner",
                  "Type",
                  "Value",
                  "Status",
                  "Listed",
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
              {filteredListings.map((l: Listing, i: number) => (
                <tr
                  key={l.id}
                  onClick={() =>
                    setSelectedListing(selectedListing?.id === l.id ? null : l)
                  }
                  style={{
                    background:
                      selectedListing?.id === l.id
                        ? "var(--border)"
                        : i % 2 === 0
                        ? "transparent"
                        : "transparent",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span
                      style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}
                    >
                      {l.deviceName}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {l.ownerName || "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {l.listingType === "swap" ? "Swap" : "For sale"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatPrice(l.estimatedMin)} –{" "}
                    {formatPrice(l.estimatedMax)}
                  </td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    {listingBadge(l.status)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 11,
                      color: "var(--ink-soft)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(l.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td
                    style={{ padding: "12px 14px", whiteSpace: "nowrap" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {l.status === "pending_review" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleListingApprove(l.id)}
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
                          <Check className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => handleListingReject(l.id)}
                          style={{
                            background: "rgba(220,38,38,0.1)",
                            color: "#DC2626",
                            border: "1px solid rgba(220,38,38,0.2)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <X className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1"
                        style={{
                          fontSize: 11,
                          color: l.status === "active" ? "#16a34a" : "#DC2626",
                        }}
                      >
                        {l.status === "active" ? (
                          <>
                            <Check className="w-3 h-3" /> Live
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> Rejected
                          </>
                        )}
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

function MobileListingList({
  filteredListings,
  listingFilter,
  setListingFilter,
  listingCounts,
  selectedListing,
  setSelectedListing,
  handleListingApprove,
  handleListingReject,
}: {
  filteredListings: Listing[];
  listingFilter: "all" | ListingStatus;
  setListingFilter: (f: "all" | ListingStatus) => void;
  listingCounts: Record<"all" | ListingStatus, number>;
  selectedListing: Listing | null;
  setSelectedListing: (l: Listing | null) => void;
  handleListingApprove: (id: string) => void;
  handleListingReject: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex gap-2 flex-wrap">
        {(["all", "pending_review", "active", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setListingFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{
              background:
                listingFilter === f ? "var(--border)" : "transparent",
              color: listingFilter === f ? "var(--ink)" : "var(--ink-soft)",
              border:
                listingFilter === f
                  ? "1px solid var(--border)"
                  : "1px solid transparent",
            }}
          >
            <span className="capitalize">
              {f === "pending_review" ? "Pending" : f === "all" ? "All" : f}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background:
                  f === "pending_review"
                    ? "rgba(217,119,6,0.2)"
                    : f === "active"
                    ? "rgba(22,163,74,0.2)"
                    : f === "rejected"
                    ? "rgba(220,38,38,0.2)"
                    : "var(--border)",
                color:
                  f === "pending_review"
                    ? "#d97706"
                    : f === "active"
                    ? "#16a34a"
                    : f === "rejected"
                    ? "#DC2626"
                    : "var(--ink-soft)",
              }}
            >
              {listingCounts[f]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {filteredListings.length === 0 && (
          <div
            className="text-center py-20"
            style={{ color: "var(--ink-soft)" }}
          >
            No listings in this category
          </div>
        )}
        {filteredListings.map((l: Listing) => (
          <div
            key={l.id}
            onClick={() => setSelectedListing(l)}
            className="p-4 rounded-2xl"
            style={{
              background:
                selectedListing?.id === l.id
                  ? "var(--accent-soft)"
                  : "var(--border)",
              border:
                selectedListing?.id === l.id
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {l.deviceName}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {l.ownerName || "—"} ·{" "}
                  {l.listingType === "swap" ? "Swap" : "For sale"}
                </p>
              </div>
              {listingBadge(l.status)}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Value
                </p>
                <p className="text-xs" style={{ color: "var(--ink)" }}>
                  {formatPrice(l.estimatedMin)} – {formatPrice(l.estimatedMax)}
                </p>
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Battery
                </p>
                <p className="text-xs" style={{ color: "var(--ink)" }}>
                  {l.batteryHealth ? `${l.batteryHealth}%` : "—"}
                </p>
              </div>
            </div>
            {l.status === "pending_review" && (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleListingApprove(l.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(22,163,74,0.12)",
                    color: "#16a34a",
                    border: "1px solid rgba(22,163,74,0.25)",
                  }}
                >
                  <Check className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Approve
                </button>
                <button
                  onClick={() => handleListingReject(l.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(220,38,38,0.1)",
                    color: "#DC2626",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  <X className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
