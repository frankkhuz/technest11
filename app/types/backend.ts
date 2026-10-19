// Shapes returned by the TechNest backend (v2). Only the fields the UI reads
// are typed; everything is optional where the API docs don't promise it.

export type VendorType = "phone_dealer" | "gadgets" | "accessories" | "repairs";

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  phone_dealer: "Phone dealer",
  gadgets: "Gadgets",
  accessories: "Accessories",
  repairs: "Repairs",
};

export type Rating = { average: number; count: number } | null;

// ── Marketplace listings ───────────────────────────────────────────────────

export type ListingStatus =
  | "pending_review"
  | "active"
  | "rejected"
  | "removed"
  | "sold"
  | "swapped"
  | "expired";

export type ListingOwner = {
  _id: string;
  name: string;
  email?: string;
  identityVerified?: boolean;
  phoneVerified?: boolean;
  vendorProfile?: { businessName?: string; city?: string; states?: string[] };
};

export type ImeiCheck = {
  valid?: boolean;
  modelMatch?: "match" | "mismatch" | "unknown";
  device?: { brand?: string; model?: string } | null;
  reportedStolen?: boolean;
} | null;

export type ListingBid = {
  _id: string;
  vendor?: string;
  vendorName: string;
  amount: number;
  message?: string;
  createdAt?: string;
};

export type MarketListing = {
  _id: string;
  id?: string;
  owner?: ListingOwner;
  userName: string;
  deviceName: string;
  deviceCategory?: string;
  subType?: string;
  storage?: string;
  batteryHealth: string;
  simType?: string | null;
  faceIdStatus?: string | null;
  snapchatStatus?: "works" | "banned" | "unknown";
  repairs: string[];
  description?: string | null;
  images?: string[];
  mediaCount: number;
  imeiVerified: boolean;
  imeiLast4?: string | null;
  imeiCheck?: ImeiCheck;
  estimatedMin: number;
  estimatedMax: number;
  listingType: "sell" | "swap";
  wantedDevice?: string | null;
  bids?: ListingBid[];
  bidCount?: number;
  status: ListingStatus;
  rejectionReason?: string | null;
  isReserved?: boolean;
  isAvailable?: boolean;
  lastConfirmedAt?: string | null;
  expiredAt?: string | null;
  createdAt: string;
};

// ── WhatsApp orders (order requests) ───────────────────────────────────────

export type OrderRequestStatus = "new" | "in_progress" | "completed" | "cancelled";
export type DeliveryStatus =
  | "not_started"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "collected";

export type OrderRequestItem = {
  itemId?: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  condition?: string;
};

export type OrderRequest = {
  _id?: string;
  id?: string;
  reference?: string;
  status: OrderRequestStatus;
  kind?: "cart" | "listing";
  items?: OrderRequestItem[];
  listing?: { _id?: string; deviceName?: string; status?: string } | string | null;
  listingName?: string;
  total?: number;
  amount?: number;
  totalWithDelivery?: number;
  deliveryMethod?: "delivery" | "pickup";
  delivery?: {
    method?: "delivery" | "pickup";
    fee?: number;
    status?: DeliveryStatus;
    riderName?: string;
    riderPhone?: string;
    address?: string;
    city?: string;
  };
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  buyer?: { name?: string; email?: string } | null;
  state?: string;
  city?: string;
  deliveryAddress?: string;
  note?: string;
  adminNotes?: string;
  finalPrice?: number;
  commission?: number;
  whatsappUrl?: string;
  createdAt: string;
};

// ── Customer requests & vendor offers ──────────────────────────────────────

export type RequestType = "buy" | "sell" | "swap" | "repair" | "accessory";
export type RequestStatus = "open" | "accepted" | "completed" | "expired" | "cancelled";

export type RequestOffer = {
  _id: string;
  id?: string;
  vendor?: string;
  vendorId?: string;
  vendorName?: string;
  price: number;
  message?: string;
  eta?: string;
  warrantyDays?: number;
  status?: "active" | "accepted" | "declined" | "withdrawn";
  recommended?: boolean;
  vendorRating?: Rating | number | null;
  vendorCompletedDeals?: number;
  vendorIdentityVerified?: boolean;
  createdAt?: string;
};

export type DeviceRequest = {
  _id: string;
  id?: string;
  reference?: string;
  type: RequestType;
  category: string;
  deviceName: string;
  storage?: string;
  condition?: string;
  wantedDevice?: string;
  issue?: string;
  repairServiceId?: string;
  description?: string;
  images?: string[];
  budgetMin?: number;
  budgetMax?: number;
  state: string;
  city?: string;
  status: RequestStatus;
  autoSelect?: boolean;
  expiresAt?: string;
  offers?: RequestOffer[];
  offerCount?: number;
  matchedVendorCount?: number;
  matchedVendors?: number;
  myOffer?: RequestOffer | null;
  youWon?: boolean;
  customerName?: string;
  customer?: { name?: string; email?: string } | null;
  acceptedOffer?: RequestOffer | null;
  acceptedVendor?: { name?: string; email?: string } | null;
  adminNotes?: string;
  finalPrice?: number;
  commission?: number;
  whatsappUrl?: string;
  createdAt: string;
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  buy: "Buy a device",
  sell: "Sell my device",
  swap: "Swap my device",
  repair: "Repair",
  accessory: "Accessory",
};

/** What an offer's price means, per request type. */
export const OFFER_PRICE_LABELS: Record<RequestType, string> = {
  buy: "You pay",
  accessory: "You pay",
  repair: "Repair cost",
  sell: "Vendor pays you",
  swap: "Top-up you pay",
};

export const REQUEST_CATEGORIES = [
  "phone",
  "laptop",
  "tablet",
  "wearable",
  "gaming",
  "audio",
  "camera",
  "accessory",
  "other",
] as const;

// ── Reviews ────────────────────────────────────────────────────────────────

export type ReviewSourceType = "device_request" | "transaction" | "order_request";

export type PendingReviewDeal = {
  type: ReviewSourceType;
  id: string;
  subject: { id: string; name: string };
  label: string;
  completedAt: string;
};

export type Review = {
  _id: string;
  rating: number;
  comment?: string;
  reply?: string;
  repliedAt?: string;
  authorName?: string;
  author?: { name?: string; email?: string } | string;
  subject?: { name?: string; email?: string } | string;
  subjectName?: string;
  status?: "visible" | "hidden";
  label?: string;
  createdAt: string;
};

export type RatingSummary = {
  average: number;
  count: number;
  stars?: Record<string, number>;
  reviews: Review[];
  page?: number;
  pages?: number;
};

// ── Disputes ───────────────────────────────────────────────────────────────

export type DisputeReason =
  | "not_as_described"
  | "faulty"
  | "not_delivered"
  | "wrong_item"
  | "stolen_or_locked"
  | "other";

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  not_as_described: "Not as described",
  faulty: "Faulty",
  not_delivered: "Not delivered",
  wrong_item: "Wrong item",
  stolen_or_locked: "Stolen or locked",
  other: "Other",
};

export type DisputeStatus = "open" | "investigating" | "resolved" | "rejected";
export type DisputeResolution =
  | "refund"
  | "partial_refund"
  | "replacement"
  | "repair"
  | "return_and_refund"
  | "no_action";

export const DISPUTE_RESOLUTION_LABELS: Record<DisputeResolution, string> = {
  refund: "Refund",
  partial_refund: "Partial refund",
  replacement: "Replacement",
  repair: "Repair",
  return_and_refund: "Return and refund",
  no_action: "No action",
};

export type DisputeMessage = {
  _id?: string;
  authorName?: string;
  author?: string;
  role?: "raiser" | "against" | "staff" | string;
  isStaff?: boolean;
  text: string;
  evidence?: string[];
  createdAt: string;
};

export type Dispute = {
  _id: string;
  reference?: string;
  source?: { type: ReviewSourceType; id: string };
  sourceLabel?: string;
  label?: string;
  reason: DisputeReason;
  description: string;
  evidence?: string[];
  status: DisputeStatus;
  resolution?: DisputeResolution;
  resolutionNote?: string;
  refundAmount?: number;
  raisedBy?: { _id?: string; name?: string; email?: string } | string;
  against?: { _id?: string; name?: string; email?: string } | string;
  messages?: DisputeMessage[];
  createdAt: string;
};

// ── Identity, phone, IMEI ──────────────────────────────────────────────────

export type IdentityStatus = "none" | "pending" | "verified" | "rejected";

export type IdentityInfo = {
  status: IdentityStatus;
  identityVerified?: boolean;
  fullName?: string;
  idType?: string;
  bankName?: string;
  accountLast4?: string;
  submittedAt?: string;
  rejectionReason?: string;
};

export const ID_TYPE_LABELS: Record<string, string> = {
  nin_slip: "NIN slip",
  drivers_licence: "Driver's licence",
  international_passport: "International passport",
  voters_card: "Voter's card",
};

export type PhoneInfo = {
  phone?: string | null;
  phoneVerified?: boolean;
  verifiedVia?: "whatsapp" | "admin";
  pending?: { phone: string; method: string; expiresAt?: string } | null;
  automatic?: boolean;
};

export type ImeiCheckResult = {
  valid: boolean;
  imeiLast4?: string;
  device?: { brand?: string; model?: string } | null;
  modelMatch?: "match" | "mismatch" | "unknown";
  reportedStolen?: boolean;
  stolenReport?: { status: string; policeStation?: string; reportedAt?: string } | null;
};

export type StolenReport = {
  _id: string;
  imeiLast4?: string;
  imei?: string;
  brand: string;
  model: string;
  policeStation: string;
  policeReportUrl?: string;
  incidentDate?: string;
  description?: string;
  status: "pending" | "confirmed" | "rejected" | "recovered";
  reviewNotes?: string;
  reporter?: { name?: string; email?: string };
  hits?: { at?: string; createdAt?: string; kind?: string; type?: string; listingId?: string }[];
  createdAt: string;
};

// ── Catalog ────────────────────────────────────────────────────────────────

export type CategoryAttribute = {
  key: string;
  label: string;
  type: "select" | "multiselect" | "number" | "boolean" | "text";
  options?: string[];
  unit?: string;
  filterable?: boolean;
};

export type Category = {
  slug: string;
  name: string;
  parent?: string | null;
  description?: string;
  order?: number;
  isActive?: boolean;
  attributes?: CategoryAttribute[];
  children?: Category[];
};

export type FilterAttribute = {
  key: string;
  label: string;
  type: CategoryAttribute["type"];
  param?: string;
  params?: [string, string];
  unit?: string;
  options?: { value: string; count?: number }[] | string[];
  min?: number;
  max?: number;
};

export type CategoryFilters = {
  total?: number;
  brands?: { value?: string; name?: string; brand?: string; count?: number }[] | string[];
  price?: { min?: number; max?: number };
  attributes?: FilterAttribute[];
};

export type ProductSale = {
  active: boolean;
  priceUkUsed?: number;
  priceBrandNew?: number;
  startsAt?: string;
  endsAt?: string;
  label?: string;
};

// ── Valuation ──────────────────────────────────────────────────────────────

export type ConditionOptions = {
  faults: { id: string; label: string; appliesTo: string[] }[];
  cosmeticGrades: { id: "like_new" | "good" | "fair" | "poor"; label: string }[];
};

export type RepairService = {
  id: string;
  issue: string;
  appliesTo: string[];
  priceMin: number;
  priceMax: number;
  note?: string;
};

export const NIGERIAN_STATES = [
  "Abia", "Abuja", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe",
  "Zamfara",
];

/** `_id` or `id`, whichever the endpoint sent. */
export const idOf = (x: { _id?: string; id?: string } | null | undefined) => x?._id ?? x?.id ?? "";

/** Name from a populated ref or a plain string. */
export const nameOf = (x: { name?: string } | string | null | undefined, fallback = "—") =>
  typeof x === "string" ? x : x?.name ?? fallback;
