"use client";

import Image from "next/image";
import {
  getPriceRange,
  getAveragePrice,
  formatPrice,
  getRecommendation,
  getValueScore,
  getPriceInsight,
  getDealLabel,
} from "../../lib/helpers";
import { Gadget } from "@/app/types";

export default function GadgetCard({ item }: { item: Gadget }) {
  const insight = getPriceInsight(item);

  return (
    <div className="bg-[#12121a] border border-white/8 rounded-2xl p-5 flex gap-4 hover:border-[#6c47ff]/40 hover:-translate-y-0.5 transition-all">
      {/* Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1a26] relative">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Name + Hot Deal badge */}
        <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
          <h3
            className="font-bold text-base text-white"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {item.name}
          </h3>
          {item.bestDeal && (
            <span className="bg-[#00e090]/10 text-[#00e090] border border-[#00e090]/25 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              🔥 Hot Deal
            </span>
          )}
        </div>

        {/* Price range */}
        <p className="text-[#00e5ff] font-bold text-lg mb-1">
          {getPriceRange(item)}
        </p>

        {/* Meta info */}
        <div className="flex gap-3 flex-wrap mb-2">
          <span className="text-[#7070a0] text-xs">
            Avg: {formatPrice(getAveragePrice(item.minPrice, item.maxPrice))}
          </span>
          <span className="text-[#7070a0] text-xs">
            Condition: {item.condition}
          </span>
          <span className="text-yellow-400 text-xs">⭐ {item.rating}</span>
          {item.storage && (
            <span className="text-[#7070a0] text-xs">💾 {item.storage}</span>
          )}
        </div>

        {/* SIM badges */}
        {item.sim && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {item.sim.physicalSim && (
              <span className="bg-white/5 text-[#7070a0] text-xs px-2 py-0.5 rounded-full">
                📶 Physical SIM
              </span>
            )}
            {item.sim.esim && (
              <span className="bg-white/5 text-[#7070a0] text-xs px-2 py-0.5 rounded-full">
                📡 eSIM
              </span>
            )}
            {item.sim.unlocked && (
              <span className="bg-white/5 text-[#7070a0] text-xs px-2 py-0.5 rounded-full">
                🔓 Unlocked
              </span>
            )}
          </div>
        )}

        {/* Recommendation */}
        <p className="text-[#7070a0] text-xs mb-2">{getRecommendation(item)}</p>

        {/* PRICE INTELLIGENCE */}
        <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap">
          <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-400">
            {getDealLabel(item)}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              insight === "CHEAP"
                ? "bg-green-500/10 text-green-400"
                : insight === "FAIR"
                ? "bg-blue-500/10 text-blue-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {insight}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-400">
            Score: {getValueScore(item)}/100
          </span>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/2349133172761?text=Hi, I want to buy ${item.name}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white px-4 py-2 rounded-xl text-sm font-semibold no-underline hover:opacity-85 transition-opacity"
        >
          💬 Chat to Buy
        </a>
      </div>
    </div>
  );
}
