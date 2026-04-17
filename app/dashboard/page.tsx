"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/app/lib/helpers";
import Sidebar from "../component/features/sidebar";
import StatsCard from "../component/features/Statcard";
import ListingCard from "../component/features/Listingcard";

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

type Tab = "overview" | "leads" | "inventory" | "analytics";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newNotif, setNewNotif] = useState(false);
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
      if ((session?.user as any)?.role !== "vendor") {
        router.push("/dashboard");
        return;
      }
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [l, i] = await Promise.all([
        fetch("/api/vendor/leads"),
        fetch("/api/vendor/inventory"),
      ]);
      const ld = await l.json();
      const id = await i.json();
      const fetchedLeads = ld.leads || [];
      setLeads(fetchedLeads);
      setInventory(id.inventory || []);
      // Show notification if there are new open leads
      if (fetchedLeads.filter((l: Lead) => l.status === "open").length > 0) {
        setNewNotif(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
    fetchData();
  };

  const markSold = async (id: string) => {
    await fetch("/api/vendor/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "sold" }),
    });
    fetchData();
  };

  const vendorStatus = (session?.user as any)?.vendorStatus;
  const openLeads = leads.filter((l) => l.status === "open");
  const inStock = inventory.filter((i) => i.status === "in_stock");
  const soldItems = inventory.filter((i) => i.status === "sold");
  const totalProfit = soldItems.reduce(
    (a, i) => a + (i.sellPrice - i.buyPrice),
    0
  );
  const totalBought = inventory.reduce((a, i) => a + i.buyPrice, 0);
  const totalRevenue = soldItems.reduce((a, i) => a + i.sellPrice, 0);

  const inputClass =
    "w-full bg-[#0a0a0f] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#6c47ff] transition-colors placeholder-[#7070a0]";
  const tabClass = (t: Tab) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
      tab === t ? "bg-[#6c47ff] text-white" : "text-[#7070a0] hover:text-white"
    }`;

  if (status === "loading")
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-[#7070a0]">Loading...</p>
      </div>
    );

  return (
    <div className="flex bg-[#0a0a0f] min-h-screen text-white">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-[#12121a] border-r border-white/10 p-5 sticky top-0 flex flex-col">
        <h1
          className="text-xl font-bold mb-8"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          <span className="text-[#6c47ff]">Tech</span>Nest
        </h1>
        <nav className="space-y-1 text-sm flex-1">
          {[
            { label: "Overview", tab: "overview" as Tab, icon: "🏠" },
            {
              label: "Buy Leads",
              tab: "leads" as Tab,
              icon: "📥",
              badge: openLeads.length,
            },
            { label: "Inventory", tab: "inventory" as Tab, icon: "📦" },
            { label: "Analytics", tab: "analytics" as Tab, icon: "📊" },
          ].map(({ label, tab: t, icon, badge }) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t === "leads") setNewNotif(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                tab === t
                  ? "bg-[#6c47ff]/15 text-white border border-[#6c47ff]/30"
                  : "text-[#7070a0] hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2">
                {icon} {label}
              </span>
              {badge !== undefined && badge > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    t === "leads" && newNotif
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-[#6c47ff] text-white"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4 space-y-2">
          <div>
            <p className="text-xs text-[#7070a0]">
              {(session?.user as any)?.name}
            </p>
            {vendorStatus === "approved" && (
              <span className="text-xs text-green-400">✅ Verified Vendor</span>
            )}
            {vendorStatus === "pending" && (
              <span className="text-xs text-yellow-400">
                ⏳ Pending Approval
              </span>
            )}
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full text-left text-xs text-[#7070a0] hover:text-white transition-colors"
          >
            🏪 View Marketplace
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left text-xs text-[#7070a0] hover:text-red-400 transition-colors"
          >
            ← Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Pending warning */}
        {vendorStatus === "pending" && (
          <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-2xl p-4 mb-6">
            <p className="text-sm text-yellow-400 font-semibold">
              ⏳ Account under review
            </p>
            <p className="text-xs text-[#7070a0] mt-1">
              You can browse leads but cannot make offers until approved within
              24 hours.
            </p>
          </div>
        )}

        {/* Lead notification banner */}
        {newNotif && openLeads.length > 0 && (
          <div className="bg-[#6c47ff]/10 border border-[#6c47ff]/30 rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6c47ff]/20 flex items-center justify-center text-xl">
                🔔
              </div>
              <div>
                <p
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {openLeads.length} new{" "}
                  {openLeads.length === 1 ? "lead" : "leads"} waiting!
                </p>
                <p className="text-xs text-[#7070a0]">
                  {openLeads[0]?.sellerName} wants to sell their{" "}
                  {openLeads[0]?.deviceName} for{" "}
                  {formatPrice(openLeads[0]?.estimatedMin)} — buy at{" "}
                  {formatPrice(openLeads[0]?.estimatedMin)}, sell for ~
                  {formatPrice(Math.round(openLeads[0]?.estimatedMax * 1.2))}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setTab("leads");
                setNewNotif(false);
              }}
              className="bg-[#6c47ff] text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-85 transition-opacity"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              View Leads →
            </button>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Vendor Dashboard
              </h1>
              <p className="text-[#7070a0] text-sm">
                Welcome back, {(session?.user as any)?.name}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard title="Open Leads" value={openLeads.length} />
              <StatsCard title="In Stock" value={inStock.length} />
              <StatsCard
                title="Net Profit"
                value={`₦${(totalProfit / 1000).toFixed(0)}k`}
              />
              <StatsCard title="Sold" value={soldItems.length} />
            </div>

            {/* Lead alerts */}
            {openLeads.length > 0 && (
              <div>
                <h2
                  className="font-bold text-lg mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  🔔 Latest Leads
                </h2>
                <div className="space-y-3">
                  {openLeads.slice(0, 2).map((lead) => (
                    <div
                      key={lead._id}
                      className="bg-[#12121a] border border-[#6c47ff]/25 rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-sm text-white">
                            {lead.sellerName} wants to sell
                          </p>
                          <p className="text-[#6c47ff] font-bold">
                            {lead.deviceName}{" "}
                            {lead.storage && `(${lead.storage})`}
                          </p>
                        </div>
                        <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/25 px-2.5 py-1 rounded-full">
                          🟢 Open
                        </span>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-xl p-3 mb-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-[#7070a0]">Buy at</p>
                            <p className="text-sm font-bold text-white">
                              {formatPrice(lead.estimatedMin)}
                            </p>
                          </div>
                          <div className="border-x border-white/10">
                            <p className="text-xs text-[#7070a0]">Sell for</p>
                            <p className="text-sm font-bold text-[#00e5ff]">
                              {formatPrice(Math.round(lead.estimatedMax * 1.2))}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#7070a0]">
                              Est. profit
                            </p>
                            <p className="text-sm font-bold text-[#00e090]">
                              {formatPrice(
                                Math.round(lead.estimatedMax * 1.2) -
                                  lead.estimatedMin
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="text-xs bg-white/5 text-[#7070a0] px-2 py-0.5 rounded-full">
                          🔋 {lead.batteryHealth}%
                        </span>
                        {lead.simType && (
                          <span className="text-xs bg-white/5 text-[#7070a0] px-2 py-0.5 rounded-full">
                            📶 {lead.simType}
                          </span>
                        )}
                        {lead.imeiVerified && (
                          <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                            ✅ IMEI
                          </span>
                        )}
                        {lead.mediaCount > 0 && (
                          <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                            📸 {lead.mediaCount} photos
                          </span>
                        )}
                      </div>
                      {vendorStatus === "approved" && (
                        <a
                          href={`https://wa.me/${lead.sellerPhone}?text=Hi ${
                            lead.sellerName
                          }, I'm interested in buying your ${
                            lead.deviceName
                          }. I can offer ${formatPrice(
                            lead.estimatedMin
                          )}. Are you still selling?`}
                          target="_blank"
                          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white font-bold py-2.5 rounded-xl text-sm no-underline hover:opacity-85 transition-opacity"
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          💬 Make Offer on WhatsApp
                        </a>
                      )}
                    </div>
                  ))}
                  {openLeads.length > 2 && (
                    <button
                      onClick={() => setTab("leads")}
                      className="w-full text-xs text-[#6c47ff] hover:underline"
                    >
                      View all {openLeads.length} leads →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Recent inventory */}
            {inventory.length > 0 && (
              <div>
                <h2
                  className="font-bold text-lg mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  📦 Recent Inventory
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {inventory.slice(0, 4).map((item) => (
                    <ListingCard
                      key={item._id}
                      item={{
                        id: item._id,
                        name: item.deviceName,
                        price_bought: item.buyPrice,
                        price_selling: item.sellPrice,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {tab === "leads" && (
          <div className="space-y-4">
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Buy Leads
              </h1>
              <p className="text-[#7070a0] text-sm">
                {openLeads.length} sellers waiting for offers
              </p>
            </div>

            {leads.length === 0 && !loading && (
              <div className="text-center py-16 bg-[#12121a] rounded-2xl border border-white/8">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-[#7070a0]">No leads yet — check back soon</p>
              </div>
            )}

            {leads.map((lead) => (
              <div
                key={lead._id}
                className="bg-[#12121a] border border-white/8 rounded-2xl p-5 space-y-3 hover:border-[#6c47ff]/30 transition-colors"
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-[#7070a0] mb-0.5">
                      {lead.sellerName} •{" "}
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                    <h3
                      className="font-bold text-base"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {lead.deviceName}
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      lead.status === "open"
                        ? "bg-green-500/10 text-green-400 border-green-500/25"
                        : "bg-white/5 text-[#7070a0] border-white/10"
                    }`}
                  >
                    {lead.status === "open" ? "🟢 Open" : "⚫ Closed"}
                  </span>
                </div>

                {/* Buy/Sell breakdown */}
                <div className="bg-[#0a0a0f] rounded-xl p-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-[#7070a0]">Buy at</p>
                      <p className="font-bold text-white">
                        {formatPrice(lead.estimatedMin)}
                      </p>
                    </div>
                    <div className="border-x border-white/10">
                      <p className="text-xs text-[#7070a0]">Sell for ~</p>
                      <p className="font-bold text-[#00e5ff]">
                        {formatPrice(Math.round(lead.estimatedMax * 1.2))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#7070a0]">Est. profit</p>
                      <p className="font-bold text-[#00e090]">
                        {formatPrice(
                          Math.round(lead.estimatedMax * 1.2) -
                            lead.estimatedMin
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-white/5 text-[#7070a0] px-2.5 py-1 rounded-full">
                    🔋 {lead.batteryHealth}%
                  </span>
                  {lead.storage && (
                    <span className="text-xs bg-white/5 text-[#7070a0] px-2.5 py-1 rounded-full">
                      💾 {lead.storage}
                    </span>
                  )}
                  {lead.simType && (
                    <span className="text-xs bg-white/5 text-[#7070a0] px-2.5 py-1 rounded-full">
                      📶 {lead.simType}
                    </span>
                  )}
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

                {lead.status === "open" && vendorStatus === "approved" && (
                  <a
                    href={`https://wa.me/${lead.sellerPhone}?text=Hi ${
                      lead.sellerName
                    }, I saw your ${
                      lead.deviceName
                    } listing on TechNest. I'd like to buy it for ${formatPrice(
                      lead.estimatedMin
                    )}. Are you still selling?`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white font-bold py-2.5 rounded-xl text-sm no-underline hover:opacity-85 transition-opacity"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    💬 Make Offer on WhatsApp
                  </a>
                )}
                {vendorStatus === "pending" && (
                  <p className="text-xs text-yellow-400 text-center">
                    Await approval to make offers
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* INVENTORY TAB */}
        {tab === "inventory" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Inventory
                </h1>
                <p className="text-[#7070a0] text-sm">
                  {inStock.length} devices in stock
                </p>
              </div>
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="bg-[#6c47ff] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-85 transition-opacity"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                + Add Device
              </button>
            </div>

            {showAdd && (
              <div className="bg-[#12121a] border border-[#6c47ff]/30 rounded-2xl p-5 space-y-3">
                <p
                  className="font-bold text-sm"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Add to Inventory
                </p>
                <input
                  className={inputClass}
                  placeholder="Device name (e.g. iPhone 13 128GB UK Used)"
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
                    onClick={() => setShowAdd(false)}
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
                        : "border-white/8 hover:border-[#6c47ff]/30 transition-colors"
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
                            ? "bg-white/5 text-[#7070a0]"
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
          <div className="space-y-6">
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Analytics
              </h1>
              <p className="text-[#7070a0] text-sm">
                Your business performance
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  label: "Total Invested",
                  val: formatPrice(totalBought),
                  color: "text-[#00e5ff]",
                  desc: "Across all devices",
                },
                {
                  label: "Total Revenue",
                  val: formatPrice(totalRevenue),
                  color: "text-[#6c47ff]",
                  desc: "From sold devices",
                },
                {
                  label: "Net Profit",
                  val: formatPrice(totalProfit),
                  color: totalProfit >= 0 ? "text-[#00e090]" : "text-red-400",
                  desc: "Revenue minus costs",
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

            <div className="grid md:grid-cols-2 gap-4">
              {/* Best performers */}
              <div className="bg-[#12121a] border border-white/8 rounded-2xl p-5">
                <h3
                  className="font-bold mb-4"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  🏆 Best Performers
                </h3>
                {soldItems.length === 0 ? (
                  <p className="text-[#7070a0] text-sm">No sold devices yet</p>
                ) : (
                  <div className="space-y-3">
                    {soldItems
                      .sort(
                        (a, b) =>
                          b.sellPrice - b.buyPrice - (a.sellPrice - a.buyPrice)
                      )
                      .slice(0, 5)
                      .map((item) => {
                        const profit = item.sellPrice - item.buyPrice;
                        const margin = Math.round(
                          (profit / item.buyPrice) * 100
                        );
                        return (
                          <div
                            key={item._id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-white truncate mr-2">
                              {item.deviceName}
                            </span>
                            <span className="text-sm text-[#00e090] font-bold whitespace-nowrap">
                              +{formatPrice(profit)} ({margin}%)
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-[#12121a] border border-white/8 rounded-2xl p-5">
                <h3
                  className="font-bold mb-4"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  📊 Summary
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Total devices", val: inventory.length },
                    { label: "In stock", val: inStock.length },
                    { label: "Sold", val: soldItems.length },
                    { label: "Open leads", val: openLeads.length },
                    {
                      label: "Avg profit per sale",
                      val:
                        soldItems.length > 0
                          ? formatPrice(
                              Math.round(totalProfit / soldItems.length)
                            )
                          : "—",
                    },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-sm text-[#7070a0]">{label}</span>
                      <span className="text-sm text-white font-semibold">
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
  );
}
