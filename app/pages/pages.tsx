"use client";

import { useRouter } from "next/navigation";
import { Rocket, Smartphone, Laptop, Gamepad2, Flame, TrendingUp } from "lucide-react";
import GadgetCard from "../component/features/Gadgetcard";
import { phones } from "../data/gadget";
import { Gadget } from "@/app/types";

function toGadget(p: (typeof phones)[number]): Gadget {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    image: p.image,
    category: "Phone",
    minPrice: p.priceUkUsed,
    maxPrice: p.priceBrandNew,
    condition: "UK Used",
    rating: 4.5,
    storage: p.storage[0],
    bestDeal: p.badge === "Hot" || p.badge === "Best Value",
  };
}

export default function Home() {
  const router = useRouter();

  const hotDeals = phones.filter((g) => g.badge).map(toGadget);
  const trending = phones.slice(0, 4).map(toGadget);

  return (
    <main className="bg-[#0a0a0f] text-white min-h-screen">
      {/* HERO */}
      <div className="text-center py-16">
        <h1 className="inline-flex items-center gap-2 text-4xl font-extrabold">
          Tech Nest <Rocket className="w-8 h-8" />
        </h1>
        <p className="text-[#7070a0] mt-2">
          Smart gadgets. Real prices. No scams.
        </p>
        <input
          placeholder="Search iPhone, Samsung, MacBook..."
          className="mt-6 p-3 rounded-xl bg-[#1a1a26] border border-white/10 w-80"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              router.push(`/results?query=${e.currentTarget.value}`);
            }
          }}
        />
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="inline-flex items-center gap-1.5"
            onClick={() => router.push("/results?category=Phone")}
          >
            <Smartphone className="w-4 h-4" /> Phones
          </button>
          <button
            className="inline-flex items-center gap-1.5"
            onClick={() => router.push("/results?category=Laptop")}
          >
            <Laptop className="w-4 h-4" /> Laptops
          </button>
          <button
            className="inline-flex items-center gap-1.5"
            onClick={() => router.push("/results?type=Gaming")}
          >
            <Gamepad2 className="w-4 h-4" /> Gaming
          </button>
        </div>
      </div>

      {/* HOT DEALS */}
      <section className="px-6 py-6">
        <h2 className="inline-flex items-center gap-2 text-xl font-bold mb-4 text-amber-300">
          <Flame className="w-5 h-5" /> Hot Deals
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {hotDeals.map((item) => (
            <GadgetCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="px-6 py-6">
        <h2 className="inline-flex items-center gap-2 text-xl font-bold mb-4">
          <TrendingUp className="w-5 h-5" /> Trending
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {trending.map((item) => (
            <GadgetCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
