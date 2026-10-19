"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Handshake, Inbox, Boxes, Percent, Star, ShieldAlert, type LucideIcon } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { userIdOf } from "@/app/lib/auth";
import Navbar from "@/app/component/layout/Navbar";
import VendorRequestsInbox from "@/app/component/vendor/VendorRequestsInbox";
import VendorStock from "@/app/component/vendor/VendorStock";
import VendorCommissions from "@/app/component/vendor/VendorCommissions";
import RatingsPanel from "@/app/component/shared/RatingsPanel";
import { PageSkeleton } from "@/app/component/ui/Skeleton";

const ACCENT = "#C2542D";

type Tab = "requests" | "stock" | "commission" | "ratings";
const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: "requests", label: "Customer Requests", Icon: Inbox },
  { id: "stock", label: "My Stock", Icon: Boxes },
  { id: "commission", label: "Commission", Icon: Percent },
  { id: "ratings", label: "My Ratings", Icon: Star },
];

function B2BHub() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const focusRequest = params.get("request");
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "requests");

  const isVendor = user?.userType === "vendor";
  const isVerifiedVendor = isVendor && !!user?.vendorVerified;

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login?redirect=/b2b");
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <PageSkeleton />
      </div>
    );
  }

  if (!isVerifiedVendor) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          {isVendor ? (
            <ShieldAlert className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
          ) : (
            <Handshake className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
          )}
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
            The B2B Hub is for verified vendors
          </p>
          <p className="text-xs mb-5" style={{ color: "var(--ink-soft)" }}>
            {isVendor
              ? "Complete your vendor profile to get verified and start receiving customer requests."
              : "Become a vendor to receive customer requests, list your stock and win deals through TechNest."}
          </p>
          <button
            onClick={() => router.push("/become-vendor")}
            className="text-sm font-semibold px-5 py-2.5 rounded-xl"
            style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
          >
            {isVendor ? "Complete My Profile" : "Become a Vendor"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-1">
          <Handshake className="w-5 h-5" style={{ color: ACCENT }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
            B2B Hub
          </h1>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Win customer requests, keep your stock up to date and track what you owe TechNest.
        </p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap flex-shrink-0"
              style={{
                background: tab === id ? ACCENT : "var(--surface)",
                color: tab === id ? "#fff" : "var(--ink)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {tab === "requests" && <VendorRequestsInbox focusId={focusRequest} />}
        {tab === "stock" && <VendorStock />}
        {tab === "commission" && <VendorCommissions />}
        {tab === "ratings" && <RatingsPanel userId={userIdOf(user)} canReply />}
      </div>
    </div>
  );
}

export default function B2BHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <B2BHub />
    </Suspense>
  );
}
