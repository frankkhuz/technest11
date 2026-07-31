/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
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

export default function AdminPanel() {
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [vendorFilter, setVendorFilter] = useState<"all" | VendorStatus>("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetail, setShowVendorDetail] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/vendors`, {
        credentials: "include",
      });
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

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleVendorApprove = async (id: string) => {
    setActionError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/vendors/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
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
      const res = await fetch(`${API_URL}/api/admin/vendors/${id}/reject`, {
        method: "PATCH",
        credentials: "include",
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

  const vendorCounts = {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === "pending").length,
    approved: vendors.filter((v) => v.status === "approved").length,
  };

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
              Vendor Verification
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {vendorCounts.pending > 0 && (
            <span
              className="text-xs font-bold px-2 md:px-3 py-1 rounded-full"
              style={{
                background: "rgba(217,119,6,0.15)",
                color: "#d97706",
                border: "1px solid rgba(217,119,6,0.3)",
              }}
            >
              <span className="hidden sm:inline">
                {vendorCounts.pending} vendors pending
              </span>
              <span className="sm:hidden">{vendorCounts.pending} pending</span>
            </span>
          )}
          <button
            onClick={fetchVendors}
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

      {actionError && (
        <div
          className="mx-4 md:mx-6 mt-4 px-4 py-3 rounded-xl text-xs md:text-sm"
          style={{
            background: "rgba(239,63,35,0.1)",
            color: "#EF3F23",
            border: "1px solid rgba(239,63,35,0.25)",
          }}
        >
          {actionError}
        </div>
      )}

      <div className="relative" style={{ height: "calc(100vh - 80px)" }}>
        {loading && (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Loading vendors…
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p style={{ color: "#EF3F23" }} className="text-sm">
              {error}
            </p>
            <button
              onClick={fetchVendors}
              className="text-xs px-4 py-2 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
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
                    }}
                  >
                    ← Back
                  </button>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {selectedVendor.name}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "rgba(255,255,255,0.4)" }}
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
                  style={{ background: "#0D0D20" }}
                >
                  <div
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {selectedVendor.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {selectedVendor.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedVendor(null)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid rgba(255,255,255,0.08)",
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
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
              ✓ Approve
            </button>
            <button
              onClick={() => handleVendorReject(vendor.id)}
              className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "rgba(239,63,35,0.15)",
                color: "#EF3F23",
                border: "1px solid rgba(239,63,35,0.3)",
              }}
            >
              ✗ Reject
            </button>
          </div>
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
              <span className="font-medium text-white text-right max-w-[60%]">
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
        {(["all", "pending", "approved"] as const).map((f) => (
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
                    : "rgba(255,255,255,0.1)",
                color:
                  f === "pending"
                    ? "#d97706"
                    : f === "approved"
                    ? "#16a34a"
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
                        {v.name.charAt(0)}
                      </div>
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}
                      >
                        {v.name}
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
                    {v.phone || "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v.businessRegNumber || "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)",
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
                    ) : (
                      <span style={{ fontSize: 11, color: "#16a34a" }}>
                        ✓ Active
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
        {(["all", "pending", "approved"] as const).map((f) => (
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
                    : "rgba(255,255,255,0.1)",
                color:
                  f === "pending"
                    ? "#d97706"
                    : f === "approved"
                    ? "#16a34a"
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
              background:
                selectedVendor?.id === v.id
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(255,255,255,0.03)",
              border:
                selectedVendor?.id === v.id
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: "#EF3F23" }}
                >
                  {v.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{v.name}</p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "rgba(255,255,255,0.4)" }}
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
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Phone
                </p>
                <p className="text-xs text-white">{v.phone || "—"}</p>
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Business Reg. No.
                </p>
                <p className="text-xs text-white">
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
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleVendorReject(v.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: "rgba(239,63,35,0.1)",
                    color: "#EF3F23",
                    border: "1px solid rgba(239,63,35,0.2)",
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
