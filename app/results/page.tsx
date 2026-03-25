"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import GadgetCard from "../component/features/Gadgetcard";
import { filterGadgetsAdvanced } from "../lib/helpers";
import { gadgets } from "../data/gadget";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";
  const brand = searchParams.get("brand") || "";
  const min = searchParams.get("min") || "";
  const max = searchParams.get("max") || "";

  const filtered = filterGadgetsAdvanced(gadgets, query, brand, min, max);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <Link
        href="/"
        className="text-2xl font-extrabold no-underline"
        style={{ fontFamily: "Syne, sans-serif" }}
      >
        <span className="text-[#6c47ff]">Tech</span>
        <span className="text-white">Nest</span>
      </Link>
      <span className="text-[#7070a0] text-sm">🇳🇬 Nigerian Market</span>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <p className="text-[#7070a0] text-sm mb-1">Search results for</p>
          <h1
            className="font-extrabold text-3xl"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            &quot;{query}&quot;
            <span className="text-[#7070a0] font-normal text-lg ml-2">
              — {filtered.length} found
            </span>
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-[#12121a] border border-white/8 rounded-2xl p-4 flex flex-wrap gap-3">
          <select
            onChange={(e) => updateFilter("brand", e.target.value)}
            defaultValue={brand}
            className="bg-[#1a1a26] border border-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6c47ff] transition-colors cursor-pointer"
          >
            <option value="">All Brands</option>
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="Tecno">Tecno</option>
          </select>

          <input
            type="number"
            placeholder="Min Price (₦)"
            defaultValue={min}
            onBlur={(e) => updateFilter("min", e.target.value)}
            className="bg-[#1a1a26] border border-white/10 text-white rounded-xl px-3 py-2 text-sm w-36 outline-none focus:border-[#6c47ff] transition-colors placeholder-[#7070a0]"
          />

          <input
            type="number"
            placeholder="Max Price (₦)"
            defaultValue={max}
            onBlur={(e) => updateFilter("max", e.target.value)}
            className="bg-[#1a1a26] border border-white/10 text-white rounded-xl px-3 py-2 text-sm w-36 outline-none focus:border-[#6c47ff] transition-colors placeholder-[#7070a0]"
          />
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-[#12121a] rounded-2xl border border-white/8">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-[#7070a0]">
              No gadgets found for &quot;{query}&quot;
            </p>
            <Link href="/" className="text-accent mt-3 inline-block text-sm">
              ← Back to search
            </Link>
          </div>
        )}

        {/* Results grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <GadgetCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
