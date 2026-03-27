"use client";

import { useRouter } from "next/navigation";
import Searchbar from "./component/features/Searchbar";
import GadgetCard from "./component/features/Gadgetcard";
import { gadgets } from "./data/gadget";

export default function Home() {
  const router = useRouter();

  const hotDeals = gadgets.filter((g) => g.bestDeal);
  const trending = [...gadgets].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#6c47ff]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#00e5ff]/5 blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div
          className="text-2xl font-extrabold"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          <span className="text-[#6c47ff]">Tech</span>
          <span className="text-white">Nest</span>
        </div>
        <div className="text-[#7070a0] text-sm">🇳🇬 Nigerian Market</div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 text-center pt-20 pb-12">
        <div className="fade-up inline-flex items-center gap-2 bg-[#6c47ff]/12 border border-[#6c47ff]/30 rounded-full px-4 py-1.5 mb-6 text-xs text-[#00e5ff]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e090] inline-block" />
          Live Nigerian Prices
        </div>

        <h1 className="fade-up-2 font-extrabold leading-tight mb-5 max-w-2xl text-4xl sm:text-5xl lg:text-6xl">
          Find the Best Gadget
          <br />
          <span className="bg-gradient-to-r from-[#6c47ff] to-[#00e5ff] bg-clip-text text-transparent">
            at the Right Price
          </span>
        </h1>

        <p className="fade-up-3 text-[#7070a0] text-base sm:text-lg max-w-md leading-relaxed mb-10">
          Compare prices across Nigerian markets, get AI recommendations, and
          buy directly from trusted sellers.
        </p>

        <div className="fade-up-4 w-full max-w-xl">
          <Searchbar />
        </div>

        {/* Quick Nav */}
        <div className="fade-up-4 flex gap-3 mt-6 flex-wrap justify-center">
          {[
            { label: "📱 Phones", href: "/results?category=Phone" },
            { label: "💻 Laptops", href: "/results?category=Laptop" },
            { label: "🎮 Gaming", href: "/results?type=Gaming" },
          ].map(({ label, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="bg-[#12121a] border border-white/8 rounded-xl px-5 py-2.5 text-sm text-white hover:border-[#6c47ff] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="fade-up-4 flex gap-10 mt-14 flex-wrap justify-center">
          {[
            { val: "500+", label: "Gadgets Listed" },
            { val: "₦0", label: "Free to Use" },
            { val: "24/7", label: "Always Updated" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div
                className="font-extrabold text-2xl text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {val}
              </div>
              <div className="text-xs text-[#7070a0] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Deals */}
      {hotDeals.length > 0 && (
        <section className="px-6 py-8 max-w-5xl mx-auto">
          <h2
            className="font-extrabold text-xl mb-5"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            🔥 Hot Deals
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {hotDeals.map((item) => (
              <GadgetCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="px-6 py-8 max-w-5xl mx-auto pb-24">
          <h2
            className="font-extrabold text-xl mb-5"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            📈 Trending
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {trending.map((item) => (
              <GadgetCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
