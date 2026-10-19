"use client";

import { BadgeCheck, CheckCircle2, Clock, Hourglass, Phone, ShieldAlert, Users } from "lucide-react";
import type { MarketListing } from "@/app/types/backend";
import { timeAgo } from "@/app/component/ui/kit";

const chip = "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full";

/** Trust + availability chips that come with every v2 listing. */
export function ListingTrustBadges({ listing: l }: { listing: MarketListing }) {
  return (
    <>
      {l.isReserved && (
        <span className={chip} style={{ background: "rgba(217,119,6,0.12)", color: "#d97706" }}>
          <Hourglass className="w-3 h-3" /> Reserved
        </span>
      )}
      {l.imeiVerified && (
        <span className={chip} style={{ background: "rgba(22,163,74,0.08)", color: "#16a34a" }}>
          <CheckCircle2 className="w-3 h-3" /> IMEI checked{l.imeiLast4 ? ` · ending ${l.imeiLast4}` : ""}
        </span>
      )}
      {l.imeiCheck?.reportedStolen && (
        <span className={chip} style={{ background: "rgba(220,38,38,0.1)", color: "#DC2626" }}>
          <ShieldAlert className="w-3 h-3" /> Reported stolen
        </span>
      )}
      {l.snapchatStatus === "banned" && (
        <span className={chip} style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626" }}>
          Snapchat banned
        </span>
      )}
      {l.lastConfirmedAt && !l.isReserved && (
        <span className={chip} style={{ background: "var(--border)", color: "var(--ink-soft)" }}>
          <Clock className="w-3 h-3" /> Confirmed {timeAgo(l.lastConfirmedAt)}
        </span>
      )}
    </>
  );
}

/** "by Name ✓" plus the seller's verification ticks. */
export function SellerLine({ listing: l }: { listing: MarketListing }) {
  const name = l.owner?.vendorProfile?.businessName || l.owner?.name || l.userName;
  return (
    <span className="inline-flex items-center gap-1 text-xs min-w-0" style={{ color: "var(--ink-soft)" }}>
      <span className="truncate">by {name}</span>
      {l.owner?.identityVerified && (
        <BadgeCheck
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: "#1d9bf0" }}
          aria-label="Verified seller"
        />
      )}
      {l.owner?.phoneVerified && (
        <Phone className="w-3 h-3 flex-shrink-0" style={{ color: "#16a34a" }} aria-label="Phone verified" />
      )}
    </span>
  );
}

/** Blind bidding: the public only sees how many offers there are. */
export function OfferCount({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--accent)" }}>
      <Users className="w-3.5 h-3.5" /> {count} offer{count === 1 ? "" : "s"} so far
    </span>
  );
}
