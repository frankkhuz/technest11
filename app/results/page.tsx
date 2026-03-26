"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import GadgetCard from "../component/features/Gadgetcard";
import { gadgets } from "../data/gadget";
import { advancedFilter, rankGadgets, sortGadgets } from "../lib/helpers";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = {
    query: searchParams.get("query") || "",
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    min: searchParams.get("min") || "",
    max: searchParams.get("max") || "",
    os: searchParams.get("os") || "",
    type: searchParams.get("type") || "",
    condition: searchParams.get("condition") || "",
    sim: searchParams.get("sim") || "",
    sort: searchParams.get("sort") || "",
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) params.delete(key);
    else params.set(key, value);

    router.push(`/results?${params.toString()}`);
  };

  let results = advancedFilter(gadgets, filters);
  results = rankGadgets(results, filters.query);
  results = sortGadgets(results, filters.sort);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <p className="text-[#7070a0] text-sm">Showing results for:</p>
        <h1 className="text-3xl font-bold">
          {filters.query || "All Gadgets"} ({results.length})
        </h1>
      </div>

      {/* QUICK FILTERS 🔥 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter("sim", "physical")}
          className="bg-green-600/20 px-3 py-1 rounded"
        >
          Physical SIM 🔥
        </button>

        <button
          onClick={() => updateFilter("type", "Gaming")}
          className="bg-purple-600/20 px-3 py-1 rounded"
        >
          Gaming 🎮
        </button>

        <button
          onClick={() => updateFilter("category", "Phone")}
          className="bg-blue-600/20 px-3 py-1 rounded"
        >
          Phones 📱
        </button>

        <button
          onClick={() => updateFilter("category", "Laptop")}
          className="bg-yellow-600/20 px-3 py-1 rounded"
        >
          Laptops 💻
        </button>
      </div>

      {/* NO RESULTS */}
      {results.length === 0 && (
        <div className="text-center">
          <p>No gadgets found 😢</p>
          <Link href="/" className="text-blue-400">
            Go Home
          </Link>
        </div>
      )}

      {/* FEATURED RESULT 🔥 */}
      {results.length > 0 && (
        <div className="bg-gradient-to-r from-[#6c47ff]/20 to-[#00e5ff]/10 p-6 rounded-2xl">
          <p className="text-sm text-[#7070a0] mb-2">Top Match</p>
          <GadgetCard item={results[0]} />
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-4">
        {results.slice(1).map((item) => (
          <GadgetCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
