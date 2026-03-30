"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  advancedFilter,
  rankGadgets,
  sortGadgets,
  getRecommendations,
} from "../lib/helpers";
import GadgetCard from "../component/features/Gadgetcard";
import { gadgets } from "../data/gadget";
import { Gadget } from "../types";

export default function ResultsContent() {
  const searchParams = useSearchParams();

  const filters = {
    query: searchParams.get("query") || "",
    sort: searchParams.get("sort") || "",
  };

  let results = advancedFilter(gadgets, filters);
  results = rankGadgets(results, filters.query);
  results = sortGadgets(results, filters.sort);

  const topMatch = results[0] || null;
  const recommendations = topMatch ? getRecommendations(gadgets, topMatch) : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
        <Link
          href="/"
          className="text-2xl font-extrabold no-underline"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          <span className="text-[#6c47ff]">Tech</span>
          <span className="text-white">Nest</span>
        </Link>
        <span className="text-[#7070a0] text-sm">🇳🇬 Nigerian Market</span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <p className="text-[#7070a0] text-sm mb-1">Search results for</p>
          <h1
            className="font-extrabold text-3xl"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            &quot;{filters.query}&quot;
            <span className="text-[#7070a0] font-normal text-lg ml-2">
              — {results.length} found
            </span>
          </h1>
        </div>

        {/* No results */}
        {results.length === 0 && (
          <div className="text-center py-16 bg-[#12121a] rounded-2xl border border-white/8">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-[#7070a0]">
              No gadgets found for &quot;{filters.query}&quot;
            </p>
            <Link href="/" className="text-accent mt-3 inline-block text-sm">
              ← Back to search
            </Link>
          </div>
        )}

        {/* Top Match */}
        {topMatch && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔥</span>
              <p
                className="text-[#6c47ff] font-semibold text-sm"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Top Match
              </p>
            </div>
            <div className="border border-[#6c47ff]/30 rounded-2xl">
              <GadgetCard item={topMatch} />
            </div>
          </div>
        )}

        {/* Rest of results */}
        {results.length > 1 && (
          <div>
            <p className="text-[#7070a0] text-sm mb-3">Other results</p>
            <div className="grid md:grid-cols-2 gap-4">
              {results.slice(1).map((g: Gadget) => (
                <GadgetCard key={g.id} item={g} />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2
              className="font-extrabold text-xl mb-4"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              You may also like
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map((g) => (
                <GadgetCard key={g.id} item={g} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
