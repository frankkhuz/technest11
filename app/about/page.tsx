"use client";

import { ShieldCheck, Tag, Zap, Lock, MapPin, Mail } from "lucide-react";
import Navbar from "../component/layout/Navbar";

const ACCENT = "#C2542D";
const SECONDARY = "#7C3AED";

const VALUES = [
  {
    Icon: ShieldCheck,
    title: "Verified Vendors",
    desc: "Every vendor is screened before they can list on TechNest, so buyers know who they're dealing with.",
    color: SECONDARY,
  },
  {
    Icon: Tag,
    title: "Fair Prices",
    desc: "Valuations are based on real Nigerian market data, not guesswork — no lowballing, no inflated asks.",
    color: ACCENT,
  },
  {
    Icon: Zap,
    title: "Instant Valuations",
    desc: "Answer a few questions about your device and get a fair price estimate in under a minute.",
    color: SECONDARY,
  },
  {
    Icon: Lock,
    title: "Safe & Secure",
    desc: "IMEI checks, verified accounts, and clear listing details keep both sides of every deal protected.",
    color: SECONDARY,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: ACCENT }}
        >
          About Us
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Nigeria&apos;s smartest gadget marketplace
        </h1>
        <p className="text-base leading-relaxed mb-10" style={{ color: "var(--ink-soft)" }}>
          TechNest is a marketplace built for how Nigerians actually buy, sell, and swap phones
          and gadgets — fair valuations based on real market prices, verified vendors, and a
          straightforward path from listing to sale. Whether you&apos;re upgrading your phone,
          clearing out old devices, or sourcing your next camera or laptop, TechNest is built to
          make the deal fast and trustworthy.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {VALUES.map(({ Icon, title, desc, color }) => (
            <div
              key={title}
              className="rounded-2xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}1F`, color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
                {title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            <MapPin className="w-4 h-4" style={{ color: ACCENT }} />
            Lagos, Nigeria
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            <Mail className="w-4 h-4" style={{ color: ACCENT }} />
            hello@technest.ng
          </div>
        </div>
      </div>
    </div>
  );
}
