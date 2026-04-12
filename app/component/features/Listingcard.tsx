interface Item {
  name: string;
  price_bought: number;
  price_selling: number;
}

export default function ListingCard({ item }: { item: Item }) {
  const profit = item.price_selling - item.price_bought;

  return (
    <div className="bg-[#12121a] p-4 rounded-xl border border-white/10 hover:border-[#6c47ff]/40 transition">
      <h3 className="text-white font-semibold">{item.name}</h3>

      <p className="text-sm text-[#7070a0]">Bought: ₦{item.price_bought}</p>

      <p className="text-sm text-[#00e5ff]">Sell: ₦{item.price_selling}</p>

      <p className="text-green-400 font-bold mt-2">Profit: ₦{profit}</p>

      {profit > 200000 && (
        <span className="text-xs text-[#00e090]">🔥 Hot Deal</span>
      )}
    </div>
  );
}
