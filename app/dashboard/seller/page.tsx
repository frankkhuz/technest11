"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/app/lib/helpers";

type Valuation = {
  _id: string;
  deviceName: string;
  category: string;
  storage?: string;
  batteryHealth: string;
  simType: string;
  repairs: string[];
  estimatedMin: number;
  estimatedMax: number;
  mediaCount: number;
  imeiVerified: boolean;
  status: "open" | "offer_received" | "sold";
  vendorOffer?: number;
  createdAt: string;
};

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      if ((session?.user as { role: string })?.role === "vendor") {
        router.push("/vendor/dashboard");
        return;
      }
      fetchValuations();
    }
  }, [status]);

  const fetchValuations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/valuations");
      const data = await res.json();
      setValuations(data.valuations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const open = valuations.filter((v) => v.status === "open").length;
  const offers = valuations.filter((v) => v.status === "offer_received").length;
  const sold = valuations.filter((v) => v.status === "sold").length;

  const statusBadge = (s: string) => {
    if (s === "open")
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/25">
          🟢 Open
        </span>
      );
    if (s === "offer_received")
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/25">
          💬 Offer received
        </span>
      );
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-[#7070a0] border border-white/10">
        ✅ Sold
      </span>
    );
  };

  if (status === "loading")
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-[#7070a0]">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-extrabold"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          <span className="text-[#6c47ff]">Tech</span>
          <span className="text-white">Nest</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#7070a0] hidden sm:block">
            👤 {(session?.user as { name: string })?.name}
          </span>
          <button
            onClick={() => router.push("/value")}
            className="text-xs bg-[#6c47ff] text-white px-3 py-1.5 rounded-xl hover:opacity-85 transition-opacity"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            + Value Device
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-[#7070a0] hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1
            className="font-extrabold text-3xl"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            My Valuations
          </h1>
          <p className="text-[#7070a0] text-sm mt-1">
            Track your submitted devices and offers from vendors
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Submitted",
              val: open,
              color: "text-[#6c47ff]",
              icon: "📤",
            },
            {
              label: "Offer Received",
              val: offers,
              color: "text-yellow-400",
              icon: "💬",
            },
            { label: "Sold", val: sold, color: "text-[#00e090]", icon: "✅" },
          ].map(({ label, val, color, icon }) => (
            <div
              key={label}
              className="bg-[#12121a] border border-white/8 rounded-2xl p-4"
            >
              <p className="text-lg mb-1">{icon}</p>
              <p
                className={`font-extrabold text-xl ${color}`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {val}
              </p>
              <p className="text-xs text-[#7070a0] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA if no valuations */}
        {!loading && valuations.length === 0 && (
          <div className="text-center py-16 bg-[#12121a] rounded-2xl border border-white/8">
            <div className="text-5xl mb-3">📱</div>
            <p
              className="font-bold text-lg mb-1"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              No devices submitted yet
            </p>
            <p className="text-[#7070a0] text-sm mb-6">
              Value your device to get offers from verified vendors
            </p>
            <button
              onClick={() => router.push("/value")}
              className="bg-gradient-to-r from-[#6c47ff] to-purple-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-85 transition-opacity text-sm"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Value My Device →
            </button>
          </div>
        )}

        {/* Valuations list */}
        <div className="space-y-4">
          {valuations.map((v) => (
            <div
              key={v._id}
              className={`bg-[#12121a] rounded-2xl p-5 space-y-3 ${
                v.status === "offer_received"
                  ? "border border-yellow-500/30"
                  : v.status === "sold"
                  ? "border border-white/5 opacity-70"
                  : "border border-white/8"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3
                    className="font-bold text-base"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {v.deviceName}
                  </h3>
                  <p className="text-[#7070a0] text-xs mt-0.5">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {statusBadge(v.status)}
              </div>

              {/* Details */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-white/5 text-[#7070a0] px-2.5 py-1 rounded-full">
                  🔋 {v.batteryHealth}% battery
                </span>
                {v.storage && (
                  <span className="text-xs bg-white/5 text-[#7070a0] px-2.5 py-1 rounded-full">
                    💾 {v.storage}
                  </span>
                )}
                {v.simType && (
                  <span className="text-xs bg-white/5 text-[#7070a0] px-2.5 py-1 rounded-full">
                    📶 {v.simType}
                  </span>
                )}
                {v.imeiVerified && (
                  <span className="text-xs bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full">
                    ✅ IMEI verified
                  </span>
                )}
                {v.mediaCount > 0 && (
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full">
                    📸 {v.mediaCount} photos
                  </span>
                )}
              </div>

              {v.repairs.length > 0 && (
                <p className="text-xs text-[#7070a0]">
                  Repairs: {v.repairs.join(", ")}
                </p>
              )}

              {/* Price */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-[#7070a0]">Your estimated value</p>
                  <p className="font-bold text-[#00e5ff]">
                    {formatPrice(v.estimatedMin)} –{" "}
                    {formatPrice(v.estimatedMax)}
                  </p>
                </div>

                {/* Offer received */}
                {v.status === "offer_received" && v.vendorOffer && (
                  <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-4 py-2 text-right">
                    <p className="text-xs text-yellow-400 mb-0.5">
                      Vendor offer
                    </p>
                    <p className="font-bold text-white text-lg">
                      {formatPrice(v.vendorOffer)}
                    </p>
                  </div>
                )}
              </div>

              {/* Reply CTA if offer received */}
              {v.status === "offer_received" && (
                <a
                  href="https://wa.me/2349133172761"
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white font-bold py-2.5 rounded-xl hover:opacity-85 transition-opacity no-underline text-sm"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  💬 Reply to vendor
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Submit another */}
        {valuations.length > 0 && (
          <button
            onClick={() => router.push("/value")}
            className="w-full border border-white/10 text-[#7070a0] font-bold py-3 rounded-xl hover:border-[#6c47ff] hover:text-white transition-all text-sm"
          >
            + Value Another Device
          </button>
        )}
      </div>
    </div>
  );
}
