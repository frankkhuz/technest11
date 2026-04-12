"use client";

import ListingCard from "../component/features/Listingcard";
import Sidebar from "../component/features/sidebar";
// import StatsCard from "../component/features/StatsCard";

const listings = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 512GB",
    price_bought: 1000000,
    price_selling: 1300000,
  },
  {
    id: 2,
    name: "Samsung S24 Ultra",
    price_bought: 900000,
    price_selling: 1200000,
  },
];

export default function Dashboard() {
  const totalProfit = listings.reduce(
    (acc, item) => acc + (item.price_selling - item.price_bought),
    0
  );

  return (
    <div className="flex bg-[#0a0a0f] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Vendor Dashboard</h1>

        {/* Stats */}
        {/* <div className="grid grid-cols-3 gap-4 mb-6">
          <StatsCard title="Listings" value={listings.length} />
          <StatsCard title="Profit" value={`₦${totalProfit}`} />
          <StatsCard title="Hot Deals" value="2" />
        </div> */}

        {/* Listings */}
        <div className="grid md:grid-cols-2 gap-4">
          {listings.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
