"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "./lib/helpers";
import {
  Wallet,
  Repeat,
  ShoppingCart,
  BatteryFull,
  ArrowRight,
  FileText,
} from "lucide-react";
import Cube from "./component/features/Cube";
import Ticker from "./component/layout/Ticker";

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

  useEffect(() => {
    fetch("/api/listings?limit=6")
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .catch(() => {});
  }, []);

  const cashListings = listings.filter((l) => l.listingType === "sell");
  const swapListings = listings.filter((l) => l.listingType === "swap");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero */}
      <div className="relative px-6 sm:px-10 pt-16 pb-10 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
          <div className="max-w-xl">
            <p className="mono-label mb-5" style={{ color: "var(--accent)" }}>
              TECHNEST · GADGET MARKETPLACE
            </p>
            <h1
              className="text-5xl sm:text-6xl font-bold leading-[1.05] mb-6"
              style={{ color: "var(--ink)" }}
            >
              Buy, Sell &<br />
              Swap Gadgets.
            </h1>
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "var(--ink-soft)" }}
            >
              Nigeria&apos;s smartest gadget marketplace. Fair prices, verified
              vendors, instant valuations.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/marketplace")}
                className="mono-label px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                BROWSE MARKETPLACE
              </button>
              <button
                onClick={() => router.push("/value")}
                className="mono-label px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                VALUE MY DEVICE <FileText size={14} />
              </button>
            </div>
          </div>
          <Cube />
        </div>

        {/* Stat row */}
        <div
          className="flex flex-wrap justify-between gap-3 mt-14 pt-4 mono-label"
          style={{
            borderTop: "1px solid var(--border)",
            color: "var(--ink-soft)",
          }}
        >
          <span>MARKET: LAGOS · UPDATED LIVE</span>
          <span>500+ GADGETS LISTED [VERIFIED VENDORS]</span>
        </div>
      </div>

      <Ticker
        items={[
          "VERIFIED VENDORS ONLY",
          "FAIR NIGERIAN PRICES",
          "COMPUTER VILLAGE NETWORK",
          "NO SCAMS, NO GHOSTING",
        ]}
      />

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-14">
        {/* Action cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              Icon: Wallet,
              title: "Sell Your Device",
              desc: "Get a fair valuation and sell to verified vendors or other users",
              cta: "VALUE & SELL",
              href: "/value",
            },
            {
              Icon: Repeat,
              title: "Swap Your Device",
              desc: "Trade in your device for a newer model. Pay only the difference",
              cta: "SWAP NOW",
              href: "/value?type=swap",
            },
            {
              Icon: ShoppingCart,
              title: "Buy a Device",
              desc: "Browse phones and laptops at real Nigerian market prices",
              cta: "BROWSE ALL",
              href: "/buy",
            },
          ].map(({ Icon, title, desc, cta, href }) => (
            <div
              key={title}
              className="rounded-2xl p-6"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
              }}
            >
              <Icon
                size={26}
                className="mb-4"
                style={{ color: "var(--accent)" }}
                strokeWidth={2}
              />
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: "var(--ink)" }}
              >
                {title}
              </h3>
              <p
                className="text-sm mb-5 leading-relaxed"
                style={{ color: "var(--ink-soft)" }}
              >
                {desc}
              </p>
              <button
                onClick={() => router.push(href)}
                className="mono-label inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
                style={{ color: "var(--accent)", cursor: "pointer" }}
              >
                {cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {cashListings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
                Live Listings — For Sale
              </h2>
              <button
                onClick={() => router.push("/marketplace?type=sell")}
                className="mono-label inline-flex items-center gap-1"
                style={{ color: "var(--accent)", cursor: "pointer" }}
              >
                VIEW ALL <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cashListings.slice(0, 6).map((l) => (
                <div
                  key={l._id}
                  className="rounded-2xl p-5"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "var(--ink)" }}
                      >
                        {l.deviceName}
                      </p>
                      {l.storage && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          {l.storage}
                        </p>
                      )}
                    </div>
                    <span
                      className="mono-label px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                      }}
                    >
                      FOR SALE
                    </span>
                  </div>
                  <p
                    className="font-bold text-lg mb-1"
                    style={{ color: "var(--ink)" }}
                  >
                    {formatPrice(l.estimatedMin)}
                  </p>
                  <div
                    className="flex items-center justify-between text-xs"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    <span className="inline-flex items-center gap-1">
                      <BatteryFull size={14} /> {l.batteryHealth}%
                    </span>
                    <span>by {l.userName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {swapListings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: "var(--ink)" }}>
                Swap Requests
              </h2>
              <button
                onClick={() => router.push("/marketplace?type=swap")}
                className="mono-label inline-flex items-center gap-1"
                style={{ color: "var(--accent)", cursor: "pointer" }}
              >
                VIEW ALL <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {swapListings.slice(0, 4).map((l) => (
                <div
                  key={l._id}
                  className="rounded-2xl p-5"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <p
                        className="mono-label mb-1"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        OFFERING
                      </p>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "var(--ink)" }}
                      >
                        {l.deviceName} {l.storage}
                      </p>
                    </div>
                    <Repeat size={20} style={{ color: "var(--accent)" }} />
                    <div className="flex-1 text-right">
                      <p
                        className="mono-label mb-1"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        WANTS
                      </p>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "var(--accent)" }}
                      >
                        {l.wantedDevice}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between pt-3 text-xs"
                    style={{
                      borderTop: "1px solid var(--border)",
                      color: "var(--ink-soft)",
                    }}
                  >
                    <span>by {l.userName}</span>
                    <span
                      className="mono-label"
                      style={{ color: "var(--accent)" }}
                    >
                      SWAP DEAL
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ background: "var(--ink)" }}
        >
          <div>
            <h3
              className="font-bold text-xl mb-2"
              style={{ color: "var(--bg)" }}
            >
              Are you a gadget vendor?
            </h3>
            <p
              className="text-sm leading-relaxed max-w-md"
              style={{ color: "var(--ink-soft)" }}
            >
              Get buy leads, see swap requests, manage inventory, track profits.
            </p>
          </div>
          <button
            onClick={() => router.push("/auth/register?role=vendor")}
            className="mono-label px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity whitespace-nowrap inline-flex items-center gap-1.5"
            style={{
              background: "var(--accent)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            REGISTER AS VENDOR <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
