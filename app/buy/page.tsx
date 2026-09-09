"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Navbar from "../component/layout/Navbar";
import { phones, brands, formatPrice } from "../data/gadget";
import type { PhoneCondition } from "../data/gadget";

// ─── SVG placeholder shown when a product image fails to load ─────────────────
const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23F0F0F8'/%3E%3Crect x='72' y='24' width='56' height='104' rx='10' fill='%23C8C8E0'/%3E%3Ccircle cx='100' cy='148' r='7' fill='%23C8C8E0'/%3E%3C/svg%3E";

type Step = "condition" | "browse";

export default function BuyPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("condition");
  const [condition, setCondition] = useState<PhoneCondition | null>(null);
  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return phones.filter((p) => {
      const brandMatch = activeBrand === "all" || p.brand === activeBrand;
      const q = searchQuery.toLowerCase();
      const nameMatch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return brandMatch && nameMatch;
    });
  }, [activeBrand, searchQuery]);

  // ── Step 1: Condition picker ──────────────────────────────────────────────────
  if (step === "condition") {
    return (
      <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
        <Navbar />

        <div className="max-w-5xl mx-auto px-6 pt-8 pb-2">
          <button
            onClick={() => router.push("/")}
            className="text-sm flex items-center gap-1.5"
            style={{ color: "#6B6B8A" }}
          >
            ← Back to Home
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 text-center">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#EF3F23" }}
          >
            Step 1 of 2
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "#020044" }}
          >
            What type of device
            <br />
            are you looking for?
          </h1>
          <p className="text-base mb-12" style={{ color: "#6B6B8A" }}>
            Choose the condition that suits your budget and preference.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 max-w-xl mx-auto">
            {/* UK Used card */}
            <button
              onClick={() => {
                setCondition("uk-used");
                setStep("browse");
              }}
              className="rounded-2xl p-7 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "#020044" }}
            >
              <div className="text-4xl mb-4">🇬🇧</div>
              <h2 className="text-white font-bold text-xl mb-2">UK Used</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Fairly used, shipped from the UK. Great condition at a lower
                price point.
              </p>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
              >
                Up to 40% off new price →
              </span>
            </button>

            {/* Brand New card */}
            <button
              onClick={() => {
                setCondition("brand-new");
                setStep("browse");
              }}
              className="rounded-2xl p-7 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "#EF3F23" }}
            >
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-white font-bold text-xl mb-2">Brand New</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Sealed box, full warranty. Latest models from official
                distributors.
              </p>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
              >
                Full warranty included →
              </span>
            </button>
          </div>

          {/* Trust strip */}
          <div
            className="mt-12 rounded-2xl px-6 py-5 flex flex-wrap gap-6 justify-center"
            style={{ background: "rgba(2,0,68,0.04)" }}
          >
            {[
              { icon: "🔒", text: "Verified Sellers" },
              { icon: "📦", text: "Fast Delivery" },
              { icon: "💬", text: "24/7 Support" },
              { icon: "↩️", text: "Easy Returns" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: "#020044" }}
              >
                <span>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Browse phones ─────────────────────────────────────────────────────
  const conditionLabel =
    condition === "uk-used" ? "🇬🇧 UK Used" : "✨ Brand New";
  const accentColor = condition === "uk-used" ? "#020044" : "#EF3F23";

  return (
    <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
      <Navbar />

      {/* Top bar */}
      <div style={{ background: accentColor }} className="px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/60 text-xs mb-0.5">
              Step 2 of 2 · Browsing
            </p>
            <h1 className="text-white font-bold text-xl">{conditionLabel}</h1>
          </div>
          <button
            onClick={() => {
              setStep("condition");
              setActiveBrand("all");
              setSearchQuery("");
            }}
            className="text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
          >
            ← Change Condition
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search phones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "#fff",
              border: "1px solid rgba(2,0,68,0.12)",
              color: "#020044",
            }}
          />
        </div>

        {/* Brand tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBrand(b.id)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
              style={
                activeBrand === b.id
                  ? { background: accentColor, color: "#fff" }
                  : {
                      background: "#fff",
                      color: "#6B6B8A",
                      border: "1px solid rgba(2,0,68,0.12)",
                    }
              }
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="text-xs mb-5" style={{ color: "#6B6B8A" }}>
          {filtered.length} device{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-semibold" style={{ color: "#020044" }}>
              No phones found
            </p>
            <p className="text-sm mt-1" style={{ color: "#6B6B8A" }}>
              Try a different brand or search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((phone) => {
              const price =
                condition === "uk-used"
                  ? phone.priceUkUsed
                  : phone.priceBrandNew;

              return (
                <div
                  key={phone.id}
                  onClick={() =>
                    router.push(`/buy/${phone.id}?condition=${condition}`)
                  }
                  className="bg-white rounded-2xl overflow-hidden border group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ border: "1px solid rgba(2,0,68,0.08)" }}
                >
                  {/* Image area */}
                  <div
                    className="relative flex items-center justify-center p-4"
                    style={{ background: "#F8F8FC", height: 160 }}
                  >
                    {phone.badge && (
                      <span
                        className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: phone.badge.includes("🔥")
                            ? "rgba(239,63,35,0.12)"
                            : "rgba(2,0,68,0.08)",
                          color: phone.badge.includes("🔥")
                            ? "#EF3F23"
                            : "#020044",
                        }}
                      >
                        {phone.badge}
                      </span>
                    )}
                    <span
                      className="absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          condition === "uk-used"
                            ? "rgba(2,0,68,0.08)"
                            : "rgba(239,63,35,0.08)",
                        color: accentColor,
                      }}
                    >
                      {condition === "uk-used" ? "UK Used" : "Brand New"}
                    </span>

                    <img
                      src={phone.image}
                      alt={phone.name}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK;
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p
                      className="font-semibold text-xs leading-snug mb-0.5 line-clamp-2"
                      style={{ color: "#020044" }}
                    >
                      {phone.name}
                    </p>
                    <p
                      className="text-[10px] mb-2"
                      style={{ color: "#6B6B8A" }}
                    >
                      {phone.storage[0]}
                      {phone.ram ? ` · ${phone.ram}` : ""}
                    </p>

                    <p
                      className="font-bold text-sm"
                      style={{ color: accentColor }}
                    >
                      {formatPrice(price)}
                    </p>

                    {/* Storage chips */}
                    <div className="flex gap-1 flex-wrap mt-2">
                      {phone.storage.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "rgba(2,0,68,0.06)",
                            color: "#6B6B8A",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {phone.storage.length > 3 && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "rgba(2,0,68,0.06)",
                            color: "#6B6B8A",
                          }}
                        >
                          +{phone.storage.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
