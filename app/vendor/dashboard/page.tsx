"use client";

import { formatPrice } from "@/app/lib/helpers";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  role: string;
  vendorStatus: string;
};
import { useEffect, useState } from "react";

type Lead = {
  _id: string;
  sellerName: string;
  sellerPhone: string;
  deviceName: string;
  storage?: string;
  batteryHealth: string;
  simType: string;
  repairs: string[];
  estimatedMin: number;
  estimatedMax: number;
  mediaCount: number;
  imeiVerified: boolean;
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
  createdAt: string;
};

type Tab = "leads" | "inventory" | "analytics";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New inventory form
  const [showAddInventory, setShowAddInventory] = useState(false);
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
      const role = (session?.user as User)?.role;
      const vendorStatus = (session?.user as User)?.vendorStatus;
      if (role !== "vendor") {
        router.push("/dashboard");
        return;
      }
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, invRes] = await Promise.all([
        fetch("/api/vendor/leads"),
        fetch("/api/vendor/inventory"),
      ]);
      const leadsData = await leadsRes.json();
      const invData = await invRes.json();
      setLeads(leadsData.leads || []);
      setInventory(invData.inventory || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addInventory = async () => {
    if (!invForm.deviceName || !invForm.buyPrice || !invForm.sellPrice) return;
    try {
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
      setShowAddInventory(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const markSold = async (id: string) => {
    await fetch("/api/vendor/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "sold" }),
    });
    fetchData();
  };

  const vendorStatus = (session?.user as User)?.vendorStatus;
  const totalBought = inventory.reduce((a, i) => a + i.buyPrice, 0);
  const totalSold = inventory
    .filter((i) => i.status === "sold")
    .reduce((a, i) => a + i.sellPrice, 0);
  const totalProfit = inventory
    .filter((i) => i.status === "sold")
    .reduce((a, i) => a + (i.sellPrice - i.buyPrice), 0);
  const inStock = inventory.filter((i) => i.status === "in_stock").length;

  const inputClass =
    "w-full bg-[#0a0a0f] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#6c47ff] transition-colors placeholder-[#7070a0]";
  const tabClass = (t: Tab) =>
    `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      tab === t ? "bg-[#6c47ff] text-white" : "text-[#7070a0] hover:text-white"
    }`;

  if (status === "loading")
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-[#7070a0]">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <span className="text-xs text-[#7070a0]">
        🏪 {(session?.user as User)?.name}
      </span>
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-extrabold"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          <span className="text-[#6c47ff]">Tech</span>
          <span className="text-white">Nest</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#7070a0]">
            🏪 {(session?.user as User)?.name}
          </span>
          {vendorStatus === "pending" && (
            <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 px-2.5 py-1 rounded-full">
              ⏳ Pending Approval
            </span>
          )}
          {vendorStatus === "approved" && (
            <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/25 px-2.5 py-1 rounded-full">
              ✅ Verified Vendor
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-[#7070a0] hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Pending warning */}
        {vendorStatus === "pending" && (
          <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-2xl p-4">
            <p className="text-sm text-yellow-400 font-semibold">
              ⏳ Your vendor account is under review
            </p>
            <p className="text-xs text-[#7070a0] mt-1">
              You can browse leads but cannot make offers until approved.
              We&apos;ll notify you within 24 hours.
            </p>
          </div>
        )}

        {/* Header */}
        <div>
          <h1
            className="font-extrabold text-3xl"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Vendor Dashboard
          </h1>
          <p className="text-[#7070a0] text-sm mt-1">
            Buy leads, manage inventory, track profits
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Open Leads",
              val: leads.filter((l) => l.status === "open").length,
              color: "text-[#00e5ff]",
              icon: "📥",
            },
            {
              label: "In Stock",
              val: inStock,
              color: "text-[#6c47ff]",
              icon: "📦",
            },
            {
              label: "Total Profit",
              val: formatPrice(totalProfit),
              color: "text-[#00e090]",
              icon: "💰",
            },
            {
              label: "Sold Devices",
              val: inventory.filter((i) => i.status === "sold").length,
              color: "text-yellow-400",
              icon: "✅",
            },
          ].map(({ label, val, color, icon }) => (
            <div
              key={label}
              className="bg-[#12121a] border border-white/8 rounded-2xl p-4"
            >
              <p className="text-lg mb-1">{icon}</p>
              <p
                className={`font-extrabold text-xl ${color}`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {val}
              </p>
              <p className="text-xs text-[#7070a0] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#12121a] border border-white/8 rounded-2xl p-1.5 w-fit">
          <button className={tabClass("leads")} onClick={() => setTab("leads")}>
            📥 Buy Leads
          </button>
          <button
            className={tabClass("inventory")}
            onClick={() => setTab("inventory")}
          >
            📦 Inventory
          </button>
          <button
            className={tabClass("analytics")}
            onClick={() => setTab("analytics")}
          >
            📊 Analytics
          </button>
        </div>

        {/* BUY LEADS TAB */}
        {tab === "leads" && (
          <div className="space-y-4">
            <p className="text-[#7070a0] text-sm">
              {leads.filter((l) => l.status === "open").length} open leads
              waiting for offers
            </p>
            {leads.length === 0 && !loading && (
              <div className="text-center py-16 bg-[#12121a] rounded-2xl border border-white/8">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-[#7070a0]">No leads yet — check back soon</p>
              </div>
            )}
            {leads.map((lead) => (
              <div
                key={lead._id}
                className="bg-[#12121a] border border-white/8 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h3
                      className="font-bold text-base"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {lead.deviceName}
                    </h3>
                    <p className="text-[#7070a0] text-xs mt-0.5">
                      Posted {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      lead.status === "open"
                        ? "bg-green-500/10 text-green-400 border-green-500/25"
                        : "bg-[#7070a0]/10 text-[#7070a0] border-white/10"
                    }`}
                  >
                    {lead.status === "open" ? "🟢 Open" : "⚫ Closed"}
                  </span>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <span className="text-xs bg-white/5 text-[#7070a0] px-2.5 py-1 rounded-full">
                    🔋 {lead.batteryHealth}% battery
                  </span>
                  {lead.storage && (
                    <span className="text-xs bg-white/5 text-[#7070a0] px-2.5 py-1 rounded-full">
                      💾 {lead.storage}
                    </span>
                  )}
                  <span className="text-xs bg-white/5 text-[#7070a0] px-2.5 py-1 rounded-full">
                    📶 {lead.simType}
                  </span>
                  {lead.imeiVerified && (
                    <span className="text-xs bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full">
                      ✅ IMEI verified
                    </span>
                  )}
                  {lead.mediaCount > 0 && (
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full">
                      📸 {lead.mediaCount} photos
                    </span>
                  )}
                </div>

                {lead.repairs.length > 0 && (
                  <p className="text-xs text-[#7070a0]">
                    Repairs: {lead.repairs.join(", ")}
                  </p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-xs text-[#7070a0]">
                      Seller&apos;s estimated value
                    </p>
                    <p className="font-bold text-[#00e5ff]">
                      {formatPrice(lead.estimatedMin)} –{" "}
                      {formatPrice(lead.estimatedMax)}
                    </p>
                  </div>
                  {lead.status === "open" && vendorStatus === "approved" && (
                    <a
                      href={`https://wa.me/${lead.sellerPhone}?text=Hi ${lead.sellerName}, I'm interested in buying your ${lead.deviceName}. I can offer you a fair price. Are you still selling?`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white px-4 py-2 rounded-xl text-sm font-semibold no-underline hover:opacity-85 transition-opacity"
                    >
                      💬 Make Offer
                    </a>
                  )}
                  {vendorStatus === "pending" && (
                    <span className="text-xs text-yellow-400">
                      Await approval to make offers
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INVENTORY TAB */}
        {tab === "inventory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[#7070a0] text-sm">
                {inStock} devices in stock
              </p>
              <button
                onClick={() => setShowAddInventory(!showAddInventory)}
                className="bg-[#6c47ff] text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-85 transition-opacity"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                + Add Device
              </button>
            </div>

            {showAddInventory && (
              <div className="bg-[#12121a] border border-[#6c47ff]/30 rounded-2xl p-5 space-y-3">
                <p
                  className="font-bold text-sm"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Add to Inventory
                </p>
                <input
                  className={inputClass}
                  placeholder="Device name (e.g. iPhone 13 128GB)"
                  value={invForm.deviceName}
                  onChange={(e) =>
                    setInvForm({ ...invForm, deviceName: e.target.value })
                  }
                />
                <div className="flex gap-3">
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="Buy price (₦)"
                    value={invForm.buyPrice}
                    onChange={(e) =>
                      setInvForm({ ...invForm, buyPrice: e.target.value })
                    }
                  />
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="Sell price (₦)"
                    value={invForm.sellPrice}
                    onChange={(e) =>
                      setInvForm({ ...invForm, sellPrice: e.target.value })
                    }
                  />
                </div>
                <select
                  className={inputClass}
                  value={invForm.condition}
                  onChange={(e) =>
                    setInvForm({ ...invForm, condition: e.target.value })
                  }
                >
                  <option>UK Used</option>
                  <option>New</option>
                  <option>Refurbished</option>
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddInventory(false)}
                    className="flex-1 border border-white/10 text-[#7070a0] py-2.5 rounded-xl text-sm hover:border-[#6c47ff] hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addInventory}
                    className="flex-1 bg-[#6c47ff] text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-85 transition-opacity"
                  >
                    Save Device
                  </button>
                </div>
              </div>
            )}

            {inventory.length === 0 && !loading && (
              <div className="text-center py-16 bg-[#12121a] rounded-2xl border border-white/8">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-[#7070a0]">
                  No inventory yet — add your first device
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {inventory.map((item) => {
                const profit = item.sellPrice - item.buyPrice;
                const margin = Math.round((profit / item.buyPrice) * 100);
                return (
                  <div
                    key={item._id}
                    className={`bg-[#12121a] border rounded-2xl p-5 space-y-3 ${
                      item.status === "sold"
                        ? "border-white/5 opacity-60"
                        : "border-white/8"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className="font-bold text-sm"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        {item.deviceName}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full ${
                          item.status === "sold"
                            ? "bg-[#7070a0]/10 text-[#7070a0]"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {item.status === "sold" ? "Sold" : "In Stock"}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs flex-wrap">
                      <span className="text-[#7070a0]">
                        Bought:{" "}
                        <span className="text-white">
                          {formatPrice(item.buyPrice)}
                        </span>
                      </span>
                      <span className="text-[#7070a0]">
                        Selling:{" "}
                        <span className="text-[#00e5ff]">
                          {formatPrice(item.sellPrice)}
                        </span>
                      </span>
                      <span
                        className={`font-bold ${
                          profit > 0 ? "text-[#00e090]" : "text-red-400"
                        }`}
                      >
                        {profit > 0 ? "+" : ""}
                        {formatPrice(profit)} ({margin}%)
                      </span>
                    </div>
                    {item.status === "in_stock" && (
                      <button
                        onClick={() => markSold(item._id)}
                        className="w-full border border-white/10 text-[#7070a0] text-xs py-2 rounded-xl hover:border-[#00e090] hover:text-[#00e090] transition-all"
                      >
                        Mark as Sold ✓
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  label: "Total Invested",
                  val: formatPrice(totalBought),
                  color: "text-[#00e5ff]",
                  desc: "Total buy price across all devices",
                },
                {
                  label: "Total Revenue",
                  val: formatPrice(totalSold),
                  color: "text-[#6c47ff]",
                  desc: "From sold devices only",
                },
                {
                  label: "Net Profit",
                  val: formatPrice(totalProfit),
                  color: totalProfit >= 0 ? "text-[#00e090]" : "text-red-400",
                  desc: "Revenue minus buy costs",
                },
              ].map(({ label, val, color, desc }) => (
                <div
                  key={label}
                  className="bg-[#12121a] border border-white/8 rounded-2xl p-5"
                >
                  <p className="text-xs text-[#7070a0] mb-1">{label}</p>
                  <p
                    className={`font-extrabold text-2xl ${color}`}
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {val}
                  </p>
                  <p className="text-xs text-[#7070a0] mt-1">{desc}</p>
                </div>
              ))}
            </div>

            {/* Best performing devices */}
            <div className="bg-[#12121a] border border-white/8 rounded-2xl p-5">
              <h3
                className="font-bold mb-4"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Best Performing Devices
              </h3>
              {inventory.filter((i) => i.status === "sold").length === 0 ? (
                <p className="text-[#7070a0] text-sm">No sold devices yet</p>
              ) : (
                <div className="space-y-3">
                  {inventory
                    .filter((i) => i.status === "sold")
                    .sort(
                      (a, b) =>
                        b.sellPrice - b.buyPrice - (a.sellPrice - a.buyPrice)
                    )
                    .slice(0, 5)
                    .map((item) => {
                      const profit = item.sellPrice - item.buyPrice;
                      const margin = Math.round((profit / item.buyPrice) * 100);
                      return (
                        <div
                          key={item._id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-white">
                            {item.deviceName}
                          </span>
                          <span className="text-sm text-[#00e090] font-bold">
                            +{formatPrice(profit)} ({margin}%)
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
