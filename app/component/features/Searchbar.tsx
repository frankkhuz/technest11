"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Searchbar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/results?query=${encodeURIComponent(query)}`);
  };

  return (
    <div
      className={`flex w-full bg-[#12121a] rounded-2xl overflow-hidden transition-all ${
        focused
          ? "ring-2 ring-[#6c47ff] border border-[#6c47ff]"
          : "border border-white/8"
      }`}
    >
      <span className="pl-4 flex items-center text-lg">🔍</span>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Search phones, laptops, earbuds..."
        className="flex-1 px-3 py-4 bg-transparent border-none outline-none text-white placeholder-[#7070a0] text-base"
      />
      <button
        onClick={handleSearch}
        className="bg-gradient-to-r from-[#6c47ff] to-purple-500 text-white font-bold px-6 m-1.5 rounded-xl hover:opacity-85 transition-opacity text-sm"
        style={{ fontFamily: "Syne, sans-serif" }}
      >
        Search
      </button>
    </div>
  );
}
