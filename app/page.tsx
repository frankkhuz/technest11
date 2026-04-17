"use client";
import { useRouter } from "next/navigation";
// import Navbar from "./component/features/Navbar";
import { useEffect, useState } from "react";
import { formatPrice } from "./lib/helpers";

type Listing = {
  _id: string;
  userName: string;
  deviceName: string;
  storage?: string;
  estimatedMin: number;
  estimatedMax: number;
  listingType: "sell" | "swap";
  wantedDevice?: string;
  batteryHealth: string;
  status: string;
  createdAt: string;
};

export default function Home() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings?limit=6")
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cashListings = listings.filter((l) => l.listingType === "sell");
  const swapListings = listings.filter((l) => l.listingType === "swap");

  return (
    <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
      {/* <Navbar /> */}

      {/* Hero */}
      <div style={{ background: "#020044" }} className="px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium"
            style={{
              background: "rgba(239,63,35,0.15)",
              color: "#EF3F23",
              border: "1px solid rgba(239,63,35,0.3)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full pulse-dot"
              style={{ background: "#EF3F23" }}
            />
            Live Nigerian Prices
          </div>

          <h1 className="fade-up-2 text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5">
            Buy, Sell &<br />
            <span style={{ color: "#EF3F23" }}>Swap Gadgets</span>
          </h1>

          <p className="fade-up-3 text-white/60 text-lg max-w-md mx-auto leading-relaxed mb-10">
            Nigeria&apos;s smartest gadget marketplace. Fair prices, verified
            vendors, instant valuations.
          </p>

          <div className="fade-up-4 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => router.push("/marketplace")}
              style={{ background: "#EF3F23" }}
              className="text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Browse Marketplace
            </button>
            <button
              onClick={() => router.push("/value")}
              style={{
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
              }}
              className="font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              Value My Device
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "#774499" }} className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-8 justify-center">
          {[
            { val: "500+", label: "Gadgets Listed" },
            { val: "₦0", label: "Free to Use" },
            { val: "24/7", label: "Always Updated" },
            { val: "100%", label: "Nigerian Market" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="text-white font-bold text-xl">{val}</div>
              <div className="text-white/60 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Action cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: "💰",
              title: "Sell Your Device",
              desc: "Get a fair valuation and sell to verified vendors or other users",
              cta: "Value & Sell",
              href: "/value",
              bg: "#020044",
            },
            {
              icon: "🔄",
              title: "Swap Your Device",
              desc: "Trade in your device for a newer model. Pay only the difference",
              cta: "Swap Now",
              href: "/value?type=swap",
              bg: "#774499",
            },
            {
              icon: "🛒",
              title: "Buy a Device",
              desc: "Browse phones and laptops at real Nigerian market prices",
              cta: "Browse All",
              href: "/marketplace",
              bg: "#EF3F23",
            },
          ].map(({ icon, title, desc, cta, href, bg }) => (
            <div
              key={title}
              style={{ background: bg }}
              className="rounded-2xl p-6 text-white"
            >
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-white/60 text-sm mb-5 leading-relaxed">
                {desc}
              </p>
              <button
                onClick={() => router.push(href)}
                className="text-sm font-semibold bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-lg"
              >
                {cta} →
              </button>
            </div>
          ))}
        </div>

        {/* Live cash listings */}
        {cashListings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: "#020044" }}>
                Live Listings — For Sale
              </h2>
              <button
                onClick={() => router.push("/marketplace?type=sell")}
                className="text-sm font-medium"
                style={{ color: "#EF3F23" }}
              >
                View all →
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cashListings.slice(0, 6).map((l) => (
                <div
                  key={l._id}
                  className="bg-white rounded-2xl p-5 border"
                  style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "#020044" }}
                      >
                        {l.deviceName}
                      </p>
                      {l.storage && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#6B6B8A" }}
                        >
                          {l.storage}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: "rgba(239,63,35,0.1)",
                        color: "#EF3F23",
                      }}
                    >
                      For Sale
                    </span>
                  </div>
                  <p
                    className="font-bold text-lg mb-1"
                    style={{ color: "#020044" }}
                  >
                    {formatPrice(l.estimatedMin)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#6B6B8A" }}>
                      🔋 {l.batteryHealth}% battery
                    </span>
                    <span className="text-xs" style={{ color: "#6B6B8A" }}>
                      by {l.userName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live swap listings */}
        {swapListings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: "#020044" }}>
                Swap Requests
              </h2>
              <button
                onClick={() => router.push("/marketplace?type=swap")}
                className="text-sm font-medium"
                style={{ color: "#774499" }}
              >
                View all →
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {swapListings.slice(0, 4).map((l) => (
                <div
                  key={l._id}
                  className="bg-white rounded-2xl p-5 border"
                  style={{ border: "1px solid rgba(119,68,153,0.2)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: "#6B6B8A" }}
                      >
                        Offering
                      </p>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "#020044" }}
                      >
                        {l.deviceName} {l.storage}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#6B6B8A" }}
                      >
                        🔋 {l.batteryHealth}% battery
                      </p>
                    </div>
                    <div style={{ color: "#774499" }} className="text-2xl">
                      ⇄
                    </div>
                    <div className="flex-1 text-right">
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: "#6B6B8A" }}
                      >
                        Wants
                      </p>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "#774499" }}
                      >
                        {l.wantedDevice}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid rgba(2,0,68,0.08)" }}
                  >
                    <span className="text-xs" style={{ color: "#6B6B8A" }}>
                      by {l.userName}
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: "#774499" }}
                    >
                      Swap deal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vendor CTA */}
        <div
          className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ background: "#020044" }}
        >
          <div>
            <h3 className="font-bold text-xl text-white mb-2">
              Are you a gadget vendor?
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              Get buy leads, see swap requests, manage inventory, track profits.
              Join Nigeria&apos;s smartest gadget network.
            </p>
          </div>
          <button
            onClick={() => router.push("/auth/register?role=vendor")}
            style={{ background: "#EF3F23" }}
            className="text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm whitespace-nowrap flex-shrink-0"
          >
            Register as Vendor →
          </button>
        </div>
      </div>
    </div>
  );
}
