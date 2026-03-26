"use client";

import { useSearchParams } from "next/navigation";
import { advancedFilter, rankGadgets, sortGadgets } from "../lib/helpers";
import GadgetCard from "../component/features/Gadgetcard";
import { gadgets } from "../data/gadget";

export default function ResultsPage() {
  const searchParams = useSearchParams();

  const filters = {
    query: searchParams.get("query") || "",
    sort: searchParams.get("sort") || "",
  };

  let results = advancedFilter(gadgets, filters);
  results = rankGadgets(results, filters.query);
  results = sortGadgets(results, filters.sort);

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold">Results ({results.length})</h1>

      {results.length > 0 && (
        <div className="border p-4 rounded">
          <p>Top Match 🔥</p>
          <GadgetCard item={results[0]} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {results.slice(1).map((g) => (
          <GadgetCard key={g.id} item={g} />
        ))}
      </div>
    </div>
  );
}
