"use client";

import Image from "next/image";
import { getPriceRange } from "../../lib/helpers";
import { Gadget } from "@/app/types";

export default function GadgetCard({ item }: { item: Gadget }) {
  return (
    <div className="bg-[#12121a] p-5 rounded-xl flex gap-4">
      <Image src={item.image} alt={item.name} width={100} height={100} />

      <div>
        <h3 className="text-white font-bold">{item.name}</h3>

        <p className="text-blue-400">{getPriceRange(item)}</p>

        {item.bestDeal && <span>🔥 Hot Deal</span>}

        {item.sim?.physicalSim && <span>📶 Physical SIM</span>}

        <a
          href={`https://wa.me/2349133172761?text=I want ${item.name}`}
          className="block mt-2 bg-green-600 text-white px-3 py-2 rounded"
        >
          Chat to Buy
        </a>
      </div>
    </div>
  );
}
