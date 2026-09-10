"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "./lib/helpers";
import { apiFetch } from "./lib/api";
import Navbar from "./component/layout/Navbar";
import SectionBackground from "./component/home/SectionBackground";

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

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const THEME_KEY = "technest-home-theme";

export default function Home() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial = saved ? saved === "dark" : prefersDark;
    // Syncing from browser storage/media query on mount — matches React's
    // "subscribe to an external system" effect pattern, not derivable state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initial) setDark(true);
  }, []);

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    apiFetch("/api/listings?limit=6")
      .then((r) => r.json())
      .then((d) => setListings(d.data?.listings ?? d.listings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cashListings = listings.filter((l) => l.listingType === "sell");
  const swapListings = listings.filter((l) => l.listingType === "swap");

  const mantra =
    "Fair Nigerian prices · Verified vendors · Instant valuations · Buy · Sell · Swap · ";

  const eyebrow = (label: string, color = "var(--hp-accent)") => (
    <p
      className="font-mono-tech text-xs tracking-widest uppercase mb-3"
      style={{ color, opacity: 0.75, textShadow: "0 1px 12px var(--hp-bg)" }}
    >
      {label}
    </p>
  );

  return (
    <div
      className={`home-theme ${
        dark ? "home-theme--dark" : ""
      } min-h-screen transition-colors duration-500`}
      style={{ background: "var(--hp-bg)", color: "var(--hp-ink)" }}
    >
      <Navbar theme={dark ? "dark" : "light"} onToggleTheme={toggleTheme} />

      {/* Hero */}
      <div
        className="relative px-6 pt-16 pb-20 text-center overflow-hidden transition-colors duration-500"
        style={{ background: "var(--hp-bg)" }}
      >
        {/* Interactive gadget backdrop — light and dark */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: dark
              ? "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)"
              : "radial-gradient(rgba(2,0,68,0.07) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <SectionBackground dark={dark} />

        {/* Soft vignette so the animated backdrop never fights with the copy */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 640px 420px at 50% 45%, var(--hp-bg) 0%, transparent 72%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            animate="show"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium"
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
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            custom={1}
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5"
            style={{
              color: "var(--hp-ink)",
              textShadow: `0 2px 24px var(--hp-bg), 0 0 8px var(--hp-bg)`,
            }}
          >
            Buy, Sell &<br />
            <span style={{ color: "#EF3F23" }}>Swap Gadgets</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            custom={2}
            variants={fadeUp}
            className="text-lg max-w-md mx-auto leading-relaxed mb-10"
            style={{
              color: "var(--hp-muted)",
              textShadow: `0 2px 20px var(--hp-bg)`,
            }}
          >
            Nigeria&apos;s smartest gadget marketplace. Fair prices, verified
            vendors, instant valuations.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            custom={3}
            variants={fadeUp}
            className="flex flex-wrap gap-3 justify-center"
          >
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 28px -6px rgba(239,63,35,0.55)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/marketplace")}
              style={{ background: "#EF3F23" }}
              className="text-white font-semibold px-8 py-3 rounded-lg text-sm cursor-pointer"
            >
              Browse Marketplace
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: dark
                  ? "0 8px 28px -8px rgba(255,255,255,0.25)"
                  : "0 8px 28px -8px rgba(2,0,68,0.25)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/value")}
              style={{
                border: `1px solid ${
                  dark ? "rgba(255,255,255,0.3)" : "rgba(2,0,68,0.25)"
                }`,
                color: "var(--hp-ink)",
              }}
              className="font-semibold px-8 py-3 rounded-lg text-sm cursor-pointer"
            >
              Value My Device
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Mantra marquee */}
      <div
        className="overflow-hidden py-2.5 transition-colors duration-500"
        style={{
          background: "var(--hp-surface)",
          borderBottom: "1px solid var(--hp-border)",
        }}
      >
        <div className="flex whitespace-nowrap w-max marquee-track">
          {[0, 1].map((rep) => (
            <span
              key={rep}
              className="font-mono-tech text-xs tracking-widest uppercase px-4"
              style={{ color: "var(--hp-muted)" }}
            >
              {mantra.repeat(4)}
            </span>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{ background: "var(--hp-purple-bg)" }}
        className="px-6 py-4 transition-colors duration-500"
      >
        <div className="max-w-4xl mx-auto flex flex-wrap gap-8 justify-center">
          {[
            { val: "500+", label: "Gadgets Listed" },
            { val: "₦0", label: "Free to Use" },
            { val: "24/7", label: "Always Updated" },
            { val: "100%", label: "Nigerian Market" },
          ].map(({ val, label }, i) => (
            <motion.div
              key={label}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.6 }}
              custom={i}
              variants={fadeUp}
              className="text-center"
            >
              <div className="text-white font-bold text-xl">{val}</div>
              <div className="text-white/60 text-xs mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: dark
              ? "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)"
              : "radial-gradient(rgba(2,0,68,0.06) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <SectionBackground dark={dark} minCount={30} maxCount={110} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 space-y-16">
          {/* Action cards */}
          <div>
            {eyebrow("01 — 03 · Get Started")}
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
                  href: "/buy",
                  bg: "#EF3F23",
                },
              ].map(({ icon, title, desc, cta, href, bg }, i) => (
                <motion.div
                  key={title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  custom={i}
                  variants={fadeUp}
                  whileHover={{
                    y: -5,
                    boxShadow: `0 16px 40px -12px ${bg}`,
                  }}
                  style={{ background: bg }}
                  className="group relative rounded-2xl p-6 text-white overflow-hidden"
                >
                  {/* HUD corner brackets — appear on hover */}
                  {[
                    "top-2.5 left-2.5 border-t border-l",
                    "top-2.5 right-2.5 border-t border-r",
                    "bottom-2.5 left-2.5 border-b border-l",
                    "bottom-2.5 right-2.5 border-b border-r",
                  ].map((pos) => (
                    <span
                      key={pos}
                      className={`absolute w-3 h-3 ${pos} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      style={{ borderColor: "rgba(255,255,255,0.55)" }}
                    />
                  ))}

                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p className="text-white/60 text-sm mb-5 leading-relaxed">
                    {desc}
                  </p>
                  <button
                    onClick={() => router.push(href)}
                    className="text-sm font-semibold bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-lg cursor-pointer"
                  >
                    {cta} →
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live listings skeleton */}
          {loading && (
            <div>
              {eyebrow("04 — Live Market")}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-5 h-32 animate-pulse"
                    style={{
                      background: "var(--hp-surface)",
                      border: "1px solid var(--hp-border)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Live cash listings */}
          {!loading && cashListings.length > 0 && (
            <div>
              {eyebrow("04 — Live Market")}
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-xl font-bold"
                  style={{
                    color: "var(--hp-ink)",
                    textShadow: "0 1px 12px var(--hp-bg)",
                  }}
                >
                  Live Listings — For Sale
                </h2>
                <button
                  onClick={() => router.push("/marketplace?type=sell")}
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: "var(--hp-accent)" }}
                >
                  View all →
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cashListings.slice(0, 6).map((l, i) => (
                  <motion.div
                    key={l._id}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    custom={i}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl p-5 transition-colors duration-500"
                    style={{
                      background: "var(--hp-surface)",
                      border: "1px solid var(--hp-border)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "var(--hp-ink)" }}
                        >
                          {l.deviceName}
                        </p>
                        {l.storage && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--hp-muted)" }}
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
                      style={{ color: "var(--hp-ink)" }}
                    >
                      {formatPrice(l.estimatedMin)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs"
                        style={{ color: "var(--hp-muted)" }}
                      >
                        🔋 {l.batteryHealth}% battery
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--hp-muted)" }}
                      >
                        by {l.userName}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Live swap listings */}
          {!loading && swapListings.length > 0 && (
            <div>
              {eyebrow("05 — Swap Desk", "var(--hp-purple)")}
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-xl font-bold"
                  style={{
                    color: "var(--hp-ink)",
                    textShadow: "0 1px 12px var(--hp-bg)",
                  }}
                >
                  Swap Requests
                </h2>
                <button
                  onClick={() => router.push("/marketplace?type=swap")}
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: "var(--hp-purple)" }}
                >
                  View all →
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {swapListings.slice(0, 4).map((l, i) => (
                  <motion.div
                    key={l._id}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    custom={i}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl p-5 transition-colors duration-500"
                    style={{
                      background: "var(--hp-surface)",
                      border: "1px solid var(--hp-border)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--hp-muted)" }}
                        >
                          Offering
                        </p>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "var(--hp-ink)" }}
                        >
                          {l.deviceName} {l.storage}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--hp-muted)" }}
                        >
                          🔋 {l.batteryHealth}% battery
                        </p>
                      </div>
                      <div
                        style={{ color: "var(--hp-purple)" }}
                        className="text-2xl"
                      >
                        ⇄
                      </div>
                      <div className="flex-1 text-right">
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--hp-muted)" }}
                        >
                          Wants
                        </p>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "var(--hp-purple)" }}
                        >
                          {l.wantedDevice}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid var(--hp-border)" }}
                    >
                      <span
                        className="text-xs"
                        style={{ color: "var(--hp-muted)" }}
                      >
                        by {l.userName}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--hp-purple)" }}
                      >
                        Swap deal
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Vendor CTA */}
          <div>
            {eyebrow("06 — Vendors")}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
              className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
              style={{ background: "#020044" }}
            >
              <div>
                <h3 className="font-bold text-xl text-white mb-2">
                  Are you a gadget vendor?
                </h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-md">
                  Get buy leads, see swap requests, manage inventory, track
                  profits. Join Nigeria&apos;s smartest gadget network.
                </p>
              </div>
              <motion.button
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 28px -6px rgba(239,63,35,0.55)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/auth/register?role=vendor")}
                style={{ background: "#EF3F23" }}
                className="text-white font-semibold px-6 py-3 rounded-lg text-sm whitespace-nowrap flex-shrink-0 cursor-pointer"
              >
                Register as Vendor →
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
