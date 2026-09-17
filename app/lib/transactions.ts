// Shared types for the local transaction/freshness/B2B system. These are
// intentionally separate from the external backend's Listing — they're
// side-data this app owns, keyed by the backend's listing/user ids, joined
// in on the client after fetching listings from /api/listings.

export type TransactionType = "buy" | "sell" | "swap";
export type TransactionStatus = "pending" | "accepted" | "completed" | "cancelled";
export type SwapDirection = "pay_extra" | "refund" | "even";

export type SwapDetails = {
  offeredDeviceName: string;
  offeredStorage?: string;
  offeredValuation: number;
  targetPriceMin: number;
  targetPriceMax: number;
  priceDifference: number;
  direction: SwapDirection;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  listingId: string;
  listingDeviceName: string;
  listingStorage?: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  status: TransactionStatus;
  swapDetails?: SwapDetails;
  createdAt: string;
  updatedAt: string;
};

export type FreshnessBucket = "just_now" | "recent" | "stale" | "unavailable" | "unconfirmed";

export type ListingFreshness = {
  listingId: string;
  lastCheckedAt: string | null;
  markedUnavailable: boolean;
};

export function freshnessBucket(f: ListingFreshness | undefined): FreshnessBucket {
  if (!f) return "unconfirmed";
  if (f.markedUnavailable) return "unavailable";
  if (!f.lastCheckedAt) return "unconfirmed";
  const hoursAgo = (Date.now() - new Date(f.lastCheckedAt).getTime()) / 36e5;
  if (hoursAgo < 6) return "just_now";
  if (hoursAgo < 48) return "recent";
  return "stale";
}

export function freshnessLabel(f: ListingFreshness | undefined): string {
  const bucket = freshnessBucket(f);
  if (bucket === "unavailable") return "Unavailable";
  if (bucket === "unconfirmed") return "Yet to confirm";
  if (!f?.lastCheckedAt) return "Yet to confirm";
  const ms = Date.now() - new Date(f.lastCheckedAt).getTime();
  const hours = Math.floor(ms / 36e5);
  if (hours < 1) return "Checked just now";
  if (hours < 24) return `Checked ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `Checked ${days} day${days === 1 ? "" : "s"} ago`;
}

export type VendorRequest = {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorPhone?: string;
  deviceName: string;
  notes?: string;
  status: "open" | "fulfilled" | "closed";
  createdAt: string;
};
