"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Search, Flame } from "lucide-react";
import {
  advancedFilter,
  rankGadgets,
  sortGadgets,
  getRecommendations,
} from "@/app/lib/helpers";
import { phones } from "@/app/data/gadget";
import { Gadget } from "@/app/types";
import GadgetCard from "../component/features/Gadgetcard";
import { ThemeToggle } from "../component/layout/Navbar";
import { useTheme } from "@/app/hooks/useTheme";

const gadgets: Gadget[] = phones.map((p) => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  image: p.image,
  category: "Phone" as const,
  minPrice: p.priceUkUsed,
  maxPrice: p.priceBrandNew,
  condition: "UK Used" as const,
  rating: 4.5,
  storage: p.storage[0],
  bestDeal: p.badge === "Hot" || p.badge === "Best Value",
}));

export default function ResultsContent() {
  const { dark, toggle } = useTheme();
  const searchParams = useSearchParams();
  const filters = {
    query: searchParams.get("query") || "",
    sort: searchParams.get("sort") || "",
    category: searchParams.get("category") || "",
    type: searchParams.get("type") || "",
  };

  let results = advancedFilter(gadgets, filters);
  results = rankGadgets(results, filters.query);
  results = sortGadgets(results, filters.sort);
  const topMatch = results[0] || null;
  const recommendations = topMatch ? getRecommendations(gadgets, topMatch) : [];


  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <nav>
        <Link
          href="/"
          className="text-2xl font-extrabold no-underline"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          <span style={{ color: "var(--accent)" }}>Tech</span>
        </Link>
        <span
          className="inline-flex items-center gap-1 text-sm"
          style={{ color: "var(--ink-soft)" }}
        >
          <MapPin className="w-3.5 h-3.5" /> Nigerian Market
        </span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div>
          <p className="text-sm mb-1" style={{ color: "var(--ink-soft)" }}>
            Search results for
          </p>
          <h1
            className="font-extrabold text-3xl"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            &quot;{filters.query || filters.category || filters.type}&quot;
            <span
              className="font-normal text-lg ml-2"
              style={{ color: "var(--ink-soft)" }}
            >
              — {results.length} found
            </span>
          </h1>
        </div>

        {results.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <Search
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--ink-soft)" }}
            />
            <p style={{ color: "var(--ink-soft)" }}>No gadgets found</p>
            <Link
              href="/"
              className="mt-3 inline-block text-sm"
              style={{ color: "var(--accent)" }}
            >
              ← Back to search
            </Link>
          </div>
        )}

        {topMatch && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <p
                className="font-semibold text-sm"
                style={{ fontFamily: "Syne, sans-serif", color: "var(--accent)" }}
              >
                Top Match
              </p>
            </div>
            <div
              className="border rounded-2xl"
              style={{ borderColor: "var(--accent)" }}
            >
              <GadgetCard item={topMatch} />
            </div>
          </div>
        )}

        {results.length > 1 && (
          <div>
            <p className="text-sm mb-3" style={{ color: "var(--ink-soft)" }}>
              Other results
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {results.slice(1).map((g) => (
                <GadgetCard key={g.id} item={g} />
              ))}
            </div>
          </div>
        )}

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
