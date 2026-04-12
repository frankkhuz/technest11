"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#12121a] border-r border-white/10 p-5">
      <h1 className="text-xl font-bold mb-8">
        <span className="text-[#6c47ff]">Tech</span>Nest
      </h1>

      <nav className="space-y-4 text-sm">
        <Link href="/dashboard" className="block text-white">
          Dashboard
        </Link>

        <Link href="/results" className="block text-[#7070a0] hover:text-white">
          Marketplace
        </Link>

        <Link
          href="/dashboard/add"
          className="block text-[#7070a0] hover:text-white"
        >
          Add Gadget
        </Link>
      </nav>
    </div>
  );
}
