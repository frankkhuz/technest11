import Searchbar from "./component/features/Searchbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#6c47ff]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#00e5ff]/5 blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="logo text-2xl font-extrabold">
          <span className="text-[#6c47ff]">Tech</span>
          <span className="text-white">Nest</span>
        </div>
        <div className="text-[#7070a0] text-sm">🇳🇬 Nigerian Market</div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 text-center pt-24 pb-16">
        <div className="fade-up inline-flex items-center gap-2 bg-[#6c47ff]/12 border border-[#6c47ff]/30 rounded-full px-4 py-1.5 mb-6 text-xs text-[#00e5ff]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e090] inline-block" />
          Live Nigerian Prices
        </div>

        <h1 className="fade-up-2 font-extrabold leading-tight mb-5 max-w-2xl text-4xl sm:text-5xl lg:text-6xl">
          Find the Best Gadget
          <br />
          <span className="bg-gradient-to-r from-[#6c47ff] to-[#00e5ff] bg-clip-text text-transparent">
            at the Right Price
          </span>
        </h1>

        <p className="fade-up-3 text-[#7070a0] text-base sm:text-lg max-w-md leading-relaxed mb-10">
          Compare prices across Nigerian markets, get AI recommendations, and
          buy directly from trusted sellers.
        </p>

        <div className="fade-up-4 w-full max-w-xl">
          <Searchbar />
        </div>

        {/* Stats */}
        <div className="fade-up-4 flex gap-10 mt-14 flex-wrap justify-center">
          {[
            { val: "500+", label: "Gadgets Listed" },
            { val: "₦0", label: "Free to Use" },
            { val: "24/7", label: "Always Updated" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div
                className="font-extrabold text-2xl text-white"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {val}
              </div>
              <div className="text-xs text-[#7070a0] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 pb-24 max-w-4xl mx-auto">
        <p className="text-[#7070a0] text-xs text-center mb-4 uppercase tracking-widest">
          Popular Categories
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          {[
            "📱 Phones",
            "💻 Laptops",
            "🎧 Earbuds",
            "⌚ Smartwatches",
            "🎮 Gaming",
            "📷 Cameras",
          ].map((cat) => (
            <div
              key={cat}
              className="bg-[#12121a] border border-white/8 rounded-xl px-5 py-2.5 text-sm text-white cursor-pointer hover:border-[#6c47ff] transition-colors"
            >
              {cat}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
