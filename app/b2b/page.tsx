"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Handshake,
  Send,
  Loader2,
  Package,
  Clock,
  Boxes,
  Trash2,
  ShieldAlert,
  Plus,
} from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import { useAuth } from "@/app/hooks/useAuth";
import Navbar from "@/app/component/layout/Navbar";
import type {
  VendorRequest,
  VendorInventoryItem,
  InventoryCondition,
} from "@/app/lib/transactions";

const ACCENT = "#C2542D";

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const CONDITIONS: { value: InventoryCondition; label: string }[] = [
  { value: "brand-new", label: "Brand New" },
  { value: "uk-used", label: "UK Used" },
  { value: "fairly-used", label: "Fairly Used" },
];

export default function B2BHubPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<"requests" | "inventory">("requests");

  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [inventory, setInventory] = useState<VendorInventoryItem[]>([]);
  const [myInventory, setMyInventory] = useState<VendorInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [deviceName, setDeviceName] = useState("");
  const [notes, setNotes] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [invName, setInvName] = useState("");
  const [invCondition, setInvCondition] = useState<InventoryCondition>("uk-used");
  const [invPrice, setInvPrice] = useState("");
  const [invQty, setInvQty] = useState("1");
  const [invNotes, setInvNotes] = useState("");
  const [invPosting, setInvPosting] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);

  const isVendor = user?.userType === "vendor";
  const isVerifiedVendor = isVendor && !!user?.vendorVerified;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login?redirect=/b2b");
      return;
    }
    if (!isVerifiedVendor) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch("/api/vendor-requests").then((r) => r.json()),
      fetch("/api/vendor-inventory").then((r) => r.json()),
      fetch("/api/vendor-inventory?mine=1").then((r) => r.json()),
    ])
      .then(([reqData, invData, mineData]) => {
        setRequests(reqData.requests ?? []);
        setInventory(invData.items ?? []);
        setMyInventory(mineData.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isVerifiedVendor]);

  const matchesFor = useMemo(() => {
    const map: Record<string, VendorInventoryItem[]> = {};
    for (const req of requests) {
      const key = normalize(req.deviceName);
      map[req.id] = inventory.filter((item) => {
        const name = normalize(item.deviceName);
        return name.includes(key) || key.includes(name);
      });
    }
    return map;
  }, [requests, inventory]);

  const submitRequest = async () => {
    if (!deviceName.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/vendor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName: deviceName.trim(), notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setRequests((r) => [data.request, ...r]);
        setDeviceName("");
        setNotes("");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPosting(false);
    }
  };

  const submitInventory = async () => {
    const price = Number(invPrice);
    if (!invName.trim() || !Number.isFinite(price) || price <= 0) {
      setInvError("Enter a device name and a valid price.");
      return;
    }
    setInvPosting(true);
    setInvError(null);
    try {
      const res = await fetch("/api/vendor-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName: invName.trim(),
          condition: invCondition,
          price,
          quantity: Number(invQty) || 1,
          notes: invNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInvError(data.error || "Something went wrong.");
      } else {
        setInventory((i) => [data.item, ...i]);
        setMyInventory((i) => [data.item, ...i]);
        setInvName("");
        setInvPrice("");
        setInvQty("1");
        setInvNotes("");
      }
    } catch {
      setInvError("Network error — please try again.");
    } finally {
      setInvPosting(false);
    }
  };

  const removeInventory = async (id: string) => {
    setMyInventory((i) => i.filter((x) => x.id !== id));
    setInventory((i) => i.filter((x) => x.id !== id));
    try {
      await fetch(`/api/vendor-inventory/${id}`, { method: "DELETE" });
    } catch {
      // best-effort — item already removed from view
    }
  };

  if (!authLoading && user && isVendor && !isVerifiedVendor) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <ShieldAlert className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
            The B2B Hub is for verified vendors
          </p>
          <p className="text-xs mb-5" style={{ color: "var(--ink-soft)" }}>
            Complete your vendor profile to get verified and unlock device requests and
            inventory trading with other vendors.
          </p>
          <button
            onClick={() => router.push("/become-vendor")}
            className="text-sm font-semibold px-5 py-2.5 rounded-xl"
            style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
          >
            Complete My Profile
          </button>
        </div>
      </div>
    );
  }

  if (!authLoading && user && !isVendor) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <Handshake className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
            The B2B Hub is for verified vendors
          </p>
          <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
            Register as a vendor to request devices and trade inventory with other vendors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-1">
          <Handshake className="w-5 h-5" style={{ color: ACCENT }} />
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
          >
            B2B Hub
          </h1>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Request a device — if another vendor has it in stock, you&apos;ll see it here with
          their price.
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("requests")}
            className="text-sm font-medium px-4 py-2 rounded-lg"
            style={{
              background: tab === "requests" ? ACCENT : "var(--surface)",
              color: tab === "requests" ? "#fff" : "var(--ink)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            Requests
          </button>
          <button
            onClick={() => setTab("inventory")}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg"
            style={{
              background: tab === "inventory" ? ACCENT : "var(--surface)",
              color: tab === "inventory" ? "#fff" : "var(--ink)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            <Boxes className="w-3.5 h-3.5" /> My Inventory
            {myInventory.length > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: tab === "inventory" ? "rgba(255,255,255,0.25)" : "var(--accent-soft)",
                  color: tab === "inventory" ? "#fff" : ACCENT,
                }}
              >
                {myInventory.length}
              </span>
            )}
          </button>
        </div>

        {tab === "requests" ? (
          <>
            <div
              className="rounded-2xl p-5 mb-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                Device you need
              </label>
              <input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. iPhone 14 Pro 256GB"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3"
                style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
              />
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                Notes (optional)
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Quantity, condition preference, budget..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3"
                style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
              />
              {error && (
                <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
                  {error}
                </p>
              )}
              <button
                onClick={submitRequest}
                disabled={posting || !deviceName.trim()}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40"
                style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post Request
              </button>
            </div>

            <h2 className="text-sm font-bold mb-3" style={{ color: "var(--ink)" }}>
              Open Requests
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-7 h-7 mx-auto animate-spin" style={{ color: "var(--ink-soft)" }} />
              </div>
            ) : requests.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                No open requests right now.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => {
                  const matches = matchesFor[req.id] ?? [];
                  return (
                    <div
                      key={req.id}
                      className="rounded-2xl p-4"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                            {req.deviceName}
                          </p>
                          {req.notes && (
                            <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                              {req.notes}
                            </p>
                          )}
                          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                            Requested by {req.vendorName}
                          </p>
                        </div>
                        {matches.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}
                          >
                            <Package className="w-3.5 h-3.5" /> {matches.length} match
                            {matches.length === 1 ? "" : "es"}
                          </span>
                        )}
                      </div>

                      {matches.length > 0 && (
                        <div className="mt-3 pt-3 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
                          {matches.slice(0, 3).map((m) => (
                            <a
                              key={m.id}
                              href={`https://wa.me/${m.vendorPhone?.replace(/\D/g, "") ?? ""}?text=Hi ${
                                m.vendorName
                              }, I saw your ${m.deviceName} in TechNest B2B inventory — a fellow vendor is looking for one. Is it still available?`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between text-xs no-underline rounded-lg px-3 py-2"
                              style={{ background: "var(--bg)", color: "var(--ink)" }}
                            >
                              <span>
                                {m.deviceName} ({CONDITIONS.find((c) => c.value === m.condition)?.label}) —{" "}
                                {m.vendorName} · Qty {m.quantity}
                              </span>
                              <span className="font-semibold" style={{ color: ACCENT }}>
                                {formatPrice(m.price)}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}

                      <p className="text-xs mt-2 inline-flex items-center gap-1" style={{ color: "var(--ink-soft)" }}>
                        <Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div
              className="rounded-2xl p-5 mb-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: "var(--ink-soft)" }}>
                Add stock other vendors can request from you.
              </p>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
                Device name
              </label>
              <input
                value={invName}
                onChange={(e) => setInvName(e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max 256GB"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3"
                style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
              />
              <div className="grid grid-cols-3 gap-2 mb-3">
                <select
                  value={invCondition}
                  onChange={(e) => setInvCondition(e.target.value as InventoryCondition)}
                  className="text-sm px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  value={invPrice}
                  onChange={(e) => setInvPrice(e.target.value)}
                  type="number"
                  placeholder="Price (₦)"
                  className="text-sm px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
                />
                <input
                  value={invQty}
                  onChange={(e) => setInvQty(e.target.value)}
                  type="number"
                  min={1}
                  placeholder="Qty"
                  className="text-sm px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
                />
              </div>
              <input
                value={invNotes}
                onChange={(e) => setInvNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none mb-3"
                style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}
              />
              {invError && (
                <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
                  {invError}
                </p>
              )}
              <button
                onClick={submitInventory}
                disabled={invPosting || !invName.trim() || !invPrice}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40"
                style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
              >
                {invPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add to Inventory
              </button>
            </div>

            <h2 className="text-sm font-bold mb-3" style={{ color: "var(--ink)" }}>
              My Inventory
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-7 h-7 mx-auto animate-spin" style={{ color: "var(--ink-soft)" }} />
              </div>
            ) : myInventory.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                No inventory items yet — add your stock above so other vendors can find it.
              </p>
            ) : (
              <div className="space-y-2">
                {myInventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl p-3.5"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                        {item.deviceName}
                      </p>
                      <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                        {CONDITIONS.find((c) => c.value === item.condition)?.label} · Qty{" "}
                        {item.quantity} · {formatPrice(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeInventory(item.id)}
                      aria-label="Remove from inventory"
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", cursor: "pointer" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
