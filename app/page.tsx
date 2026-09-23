"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Wallet,
  Repeat,
  ShoppingCart,
  Wrench,
  BatteryFull,
  ShieldCheck,
  Tag,
  Zap,
  Lock,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "./lib/helpers";
import { apiFetch } from "./lib/api";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./component/layout/Navbar";
import SectionBackground from "./component/home/SectionBackground";
import HeroSlideshow from "./component/home/HeroSlideshow";

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

const ACCENT = "var(--hp-accent)";
const SECONDARY = "var(--hp-purple)";

const TRUST_ITEMS = [
  { Icon: ShieldCheck, title: "Verified Vendors", desc: "Trusted & screened", color: SECONDARY },
  { Icon: Tag, title: "Fair Prices", desc: "Best deals in Nigeria", color: SECONDARY },
  { Icon: Zap, title: "Instant Valuations", desc: "Know your device worth", color: ACCENT },
  { Icon: Lock, title: "Safe & Secure", desc: "Secure payments", color: SECONDARY },
];

const STEPS = [
  {
    n: "01",
    Icon: Wallet,
    title: "Sell Your Device",
    desc: "Get a fair valuation and sell to verified buyers.",
    cta: "Value & Sell",
    href: "/value",
    style: "tile" as const,
    tileColor: SECONDARY,
  },
  {
    n: "02",
    Icon: Repeat,
    title: "Swap Your Device",
    desc: "Trade in your device for something better.",
    cta: "Swap Now",
    href: "/value?type=swap",
    style: "solid" as const,
    tileColor: ACCENT,
  },
  {
    n: "03",
    Icon: ShoppingCart,
    title: "Buy a Device",
    desc: "Browse phones, tablets, laptops and more at great prices.",
    cta: "Browse All",
    href: "/buy",
    style: "tile" as const,
    tileColor: SECONDARY,
  },
  {
    n: "04",
    Icon: Wrench,
    title: "Fix My Device",
    desc: "Screen cracked? Won't charge? Get instant AI troubleshooting.",
    cta: "Get Help Now",
    href: "/fix",
    style: "solid" as const,
    tileColor: ACCENT,
  },
];

export default function Home() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { dark } = useTheme();
  const { user } = useAuth();
  const isVendor = user?.userType === "vendor";

  useEffect(() => {
    apiFetch("/api/listings?limit=6")
      .then((r) => r.json())
      .then((d) => setListings(d.data?.listings ?? d.listings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cashListings = listings.filter((l) => l.listingType === "sell");
  const swapListings = listings.filter((l) => l.listingType === "swap");

  const eyebrow = (label: string, color = ACCENT) => (
    <p
      className="text-xs font-semibold tracking-widest uppercase mb-3"
      style={{ color }}
    >
      {label}
    </p>
  );

  return (
    <div
      className={`home-theme ${dark ? "home-theme--dark" : ""} min-h-screen transition-colors duration-500`}
      style={{ background: "var(--hp-bg)", color: "var(--hp-ink)" }}
    >
      <Navbar />

      {/* Hero */}
      <div className="relative px-4 sm:px-6 pt-12 pb-16 overflow-hidden">
        {/* Decorative gadget-outline backdrop, carried over from the original design */}
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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 640px 420px at 50% 45%, var(--hp-bg) 0%, transparent 72%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              initial="hidden"
              animate="show"
              custom={0}
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-5"
              style={{ color: "var(--hp-ink)", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Buy, Sell &amp;
              <br />
              <span style={{ color: ACCENT }}>Swap Gadgets.</span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              custom={2}
              variants={fadeUp}
              className="text-lg max-w-md leading-relaxed mb-8"
              style={{ color: "var(--hp-muted)" }}
            >
              Nigeria&apos;s smartest gadget marketplace. Fair prices, verified
              vendors, instant valuations.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="show"
              custom={3}
              variants={fadeUp}
              className="flex flex-wrap gap-3 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 28px -8px rgba(194,84,45,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/marketplace")}
                style={{ background: ACCENT }}
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                Browse Marketplace
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/value")}
                style={{ border: `1.5px solid ${ACCENT}`, color: ACCENT }}
                className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer"
              >
                <Tag className="w-4 h-4" />
                Value My Device
              </motion.button>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-sm lg:max-w-md aspect-square"
          >
            <HeroSlideshow />
          </motion.div>
        </div>

        {/* Trust bar */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="relative z-10 max-w-6xl mx-auto mt-14 rounded-2xl p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-5"
          style={{ background: "var(--hp-surface)", border: "1px solid var(--hp-border)" }}
        >
          {TRUST_ITEMS.map(({ Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: color === ACCENT ? "var(--hp-accent-soft)" : "var(--hp-purple-bg)", color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: "var(--hp-ink)" }}>
                  {title}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--hp-muted)" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-16">
          {/* Real people */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            {eyebrow("Real People, Real Trades")}
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: "var(--hp-ink)", fontFamily: "Space Grotesk, sans-serif" }}
            >
              A marketplace built around people, not just phones.
            </h2>
            <p className="text-sm sm:text-base max-w-xl mb-6" style={{ color: "var(--hp-muted)" }}>
              Every day, Nigerians buy, sell, and swap gadgets on TechNest — fair prices,
              real conversations, no scams.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { src: "/images/people/couple-street.jpg", alt: "Two friends sharing a great find on their phone" },
                { src: "/images/people/man-portrait.jpg", alt: "A happy seller showing off his device" },
                { src: "/images/people/friends-group.jpg", alt: "Friends checking out a new gadget together" },
                { src: "/images/people/woman-sofa.jpg", alt: "A buyer enjoying her new phone at home" },
              ].map((photo) => (
                <div
                  key={photo.src}
                  className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-sm"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 45vw, 23vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Numbered steps */}
          <div id="how-it-works" className="scroll-mt-20">
            {eyebrow("01 – 04 · Get Started")}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STEPS.map(({ n, Icon, title, desc, cta, href, style, tileColor }, i) => (
                <motion.div
                  key={title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  custom={i}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="relative rounded-2xl p-6 overflow-hidden"
                  style={
                    style === "solid"
                      ? { background: ACCENT, color: "#fff" }
                      : {
                          background: "var(--hp-surface)",
                          border: "1px solid var(--hp-border)",
                          color: "var(--hp-ink)",
                        }
                  }
                >
                  <p
                    className="text-xs font-bold tracking-widest mb-3"
                    style={{ color: style === "solid" ? "rgba(255,255,255,0.75)" : ACCENT }}
                  >
                    {n}
                  </p>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={
                      style === "solid"
                        ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                        : { background: "var(--hp-purple-bg)", color: tileColor }
                    }
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p
                    className="text-sm mb-5 leading-relaxed"
                    style={{ color: style === "solid" ? "rgba(255,255,255,0.85)" : "var(--hp-muted)" }}
                  >
                    {desc}
                  </p>
                  <button
                    onClick={() => router.push(href)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    style={{ color: style === "solid" ? "#fff" : ACCENT }}
                  >
                    {cta} <ArrowRight className="w-3.5 h-3.5" />
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
                    style={{ background: "var(--hp-surface)", border: "1px solid var(--hp-border)" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Live cash listings */}
          {!loading && cashListings.length > 0 && (
            <div>
              {eyebrow("04 — Live Market")}
              <div
                className="rounded-2xl p-5 sm:p-6"
                style={{ background: "var(--hp-surface)", border: "1px solid var(--hp-border)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold" style={{ color: "var(--hp-ink)" }}>
                    Live Listings — For Sale
                  </h2>
                  <button
                    onClick={() => router.push("/marketplace?type=sell")}
                    className="text-xs font-semibold cursor-pointer"
                    style={{ color: ACCENT }}
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
                      className="rounded-2xl p-5"
                      style={{ background: "var(--hp-bg)", border: "1px solid var(--hp-border)" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--hp-ink)" }}>
                            {l.deviceName}
                          </p>
                          {l.storage && (
                            <p className="text-xs mt-0.5" style={{ color: "var(--hp-muted)" }}>
                              {l.storage}
                            </p>
                          )}
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "var(--hp-accent-soft)", color: ACCENT }}
                        >
                          For Sale
                        </span>
                      </div>
                      <p className="font-semibold text-lg mb-1" style={{ color: "var(--hp-ink)" }}>
                        {formatPrice(l.estimatedMin)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="inline-flex items-center gap-1 text-xs"
                          style={{ color: "var(--hp-muted)" }}
                        >
                          <BatteryFull className="w-3.5 h-3.5" /> {l.batteryHealth}% battery
                        </span>
                        <span className="text-xs" style={{ color: "var(--hp-muted)" }}>
                          by {l.userName}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Live swap listings — vendors only */}
          {!loading && isVendor && swapListings.length > 0 && (
            <div>
              {eyebrow("05 — Swap Desk", SECONDARY)}
              <div
                className="rounded-2xl p-5 sm:p-6"
                style={{ background: "var(--hp-surface)", border: "1px solid var(--hp-border)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold" style={{ color: "var(--hp-ink)" }}>
                    Swap Requests
                  </h2>
                  <button
                    onClick={() => router.push("/marketplace?type=swap")}
                    className="text-xs font-semibold cursor-pointer"
                    style={{ color: SECONDARY }}
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
                      className="rounded-2xl p-5"
                      style={{ background: "var(--hp-bg)", border: "1px solid var(--hp-border)" }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1">
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--hp-muted)" }}>
                            Offering
                          </p>
                          <p className="font-semibold text-sm" style={{ color: "var(--hp-ink)" }}>
                            {l.deviceName} {l.storage}
                          </p>
                          <p
                            className="inline-flex items-center gap-1 text-xs mt-0.5"
                            style={{ color: "var(--hp-muted)" }}
                          >
                            <BatteryFull className="w-3.5 h-3.5" /> {l.batteryHealth}% battery
                          </p>
                        </div>
                        <div style={{ color: SECONDARY }}>
                          <Repeat className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-xs font-medium mb-1" style={{ color: "var(--hp-muted)" }}>
                            Wants
                          </p>
                          <p className="font-semibold text-sm" style={{ color: SECONDARY }}>
                            {l.wantedDevice}
                          </p>
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-between pt-3"
                        style={{ borderTop: "1px solid var(--hp-border)" }}
                      >
                        <span className="text-xs" style={{ color: "var(--hp-muted)" }}>
                          by {l.userName}
                        </span>
                        <span className="text-xs font-medium" style={{ color: SECONDARY }}>
                          Swap deal
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
              style={{ background: "linear-gradient(135deg, #1A1520, #241C22)" }}
            >
              <div>
                <h3 className="font-bold text-xl text-white mb-2">Are you a gadget vendor?</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-md">
                  Get buy leads, see swap requests, manage inventory, track
                  profits. Join Nigeria&apos;s smartest gadget network.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 28px -8px rgba(194,84,45,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/auth/register?role=vendor")}
                style={{ background: ACCENT }}
                className="text-white font-semibold px-6 py-3 rounded-xl text-sm whitespace-nowrap flex-shrink-0 cursor-pointer"
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
