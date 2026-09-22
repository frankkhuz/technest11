"use client";

import { Wrench } from "lucide-react";
import Navbar from "../component/layout/Navbar";
import VendorDirectory from "../component/fix/VendorDirectory";
import RepairChatPanel from "../component/fix/RepairChatPanel";

const ACCENT = "#C2542D";

export default function FixMyDevicePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-5 h-5" style={{ color: ACCENT }} />
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
          >
            Fix My Device
          </h1>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Browse real repair technicians, or describe the problem to our AI and get troubleshooting
          in seconds.
        </p>

        {/* Mobile: AI chat first (compact, always visible), directory below.
            Desktop: directory as the main column, AI pinned to the side. */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:hidden">
            <RepairChatPanel />
          </div>

          <div className="lg:col-span-3 lg:order-1">
            <VendorDirectory />
          </div>

          <div className="hidden lg:block lg:col-span-2 lg:order-2">
            <div className="sticky top-20">
              <RepairChatPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
