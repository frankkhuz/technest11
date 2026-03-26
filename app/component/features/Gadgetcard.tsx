"use client";

import Image from "next/image";

import { Gadget } from "@/app/types";
import {
  formatPrice,
  getAveragePrice,
  getPriceRange,
  getRecommendation,
} from "@/app/lib/helpers";

export default function GadgetCard({ item }: { item: Gadget }) {
  return (
    <div className="bg-[#12121a] border border-white/8 rounded-2xl p-5 flex gap-4 hover:border-[#6c47ff]/40 hover:shadow-[0_0_20px_rgba(108,71,255,0.2)] transition-all">
      {/* Image */}
      <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-[#1a1a26]">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1">
        {/* Title */}
        <h3 className="text-white font-bold">{item.name}</h3>

        {/* Price */}
        <p className="text-[#00e5ff] font-bold text-lg">
          {getPriceRange(item)}
        </p>

        {/* Badges 🔥 */}
        <div className="flex flex-wrap gap-2 mt-1">
          {item.bestDeal && (
            <span className="bg-[#00e090]/10 text-[#00e090] px-2 py-1 text-xs rounded">
              🔥 Hot Deal
            </span>
          )}

          {item.sim?.physicalSim && (
            <span className="bg-green-500/10 text-green-400 px-2 py-1 text-xs rounded">
              Physical SIM
            </span>
          )}

          {item.sim?.esimOnly && (
            <span className="bg-red-500/10 text-red-400 px-2 py-1 text-xs rounded">
              eSIM Only
            </span>
          )}

          {item.type === "Gaming" && (
            <span className="bg-purple-500/10 text-purple-400 px-2 py-1 text-xs rounded">
              Gaming
            </span>
          )}

          {item.os && (
            <span className="bg-blue-500/10 text-blue-400 px-2 py-1 text-xs rounded">
              {item.os}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="text-xs text-[#7070a0] mt-2 flex gap-3 flex-wrap">
          <span>
            Avg: {formatPrice(getAveragePrice(item.minPrice, item.maxPrice))}
          </span>
          <span>Condition: {item.condition}</span>
          {item.rating && <span>⭐ {item.rating}</span>}
        </div>

        {/* Recommendation */}
        <p className="text-[#7070a0] text-sm mt-2">{getRecommendation(item)}</p>

        {/* CTA */}
        <a
          href={`https://wa.me/2349133172761?text=Hi, I'm interested in ${item.name}`}
          target="_blank"
          className="inline-block mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold"
        >
          💬 Chat to Buy
        </a>
      </div>
    </div>
  );
}
