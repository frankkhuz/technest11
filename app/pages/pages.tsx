"use client";

import { useRouter } from "next/navigation";
import { gadgets } from "../data/gadget";
import GadgetCard from "../component/features/Gadgetcard";

export default function Home() {
  const router = useRouter();

  const hotDeals = gadgets.filter((g) => g.bestDeal);
  const trending = [...gadgets].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <main className="bg-[#0a0a0f] text-white min-h-screen">
      {/* HERO */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-extrabold">Tech Nest 🚀</h1>

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

        {/* QUICK NAV */}
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => router.push("/results?category=Phone")}>
            📱 Phones
          </button>

          <button onClick={() => router.push("/results?category=Laptop")}>
            💻 Laptops
          </button>

          <button onClick={() => router.push("/results?type=Gaming")}>
            🎮 Gaming
          </button>
        </div>
      </div>

      {/* HOT DEALS */}
      <section className="px-6 py-6">
        <h2 className="text-xl font-bold mb-4">🔥 Hot Deals</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {hotDeals.map((item) => (
            <GadgetCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="px-6 py-6">
        <h2 className="text-xl font-bold mb-4">📈 Trending</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {trending.map((item) => (
            <GadgetCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
