export type UserRole = "user" | "vendor";
export type VendorStatus = "pending" | "approved" | "rejected";
export type ListingType = "sell" | "swap";
export type ListingStatus =
  | "open"
  | "offer_received"
  | "negotiating"
  | "completed"
  | "cancelled";
export type NotificationType =
  | "new_cash_listing"
  | "new_swap_request"
  | "offer_received"
  | "bid_placed"
  | "offer_accepted";

export type User = {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  createdAt: Date;
};

export type Vendor = {
  _id?: string;
  userId: string;
  businessName: string;
  nin: string;
  address: string;
  phone: string;
  status: VendorStatus;
  createdAt: Date;
};

export type Listing = {
  _id?: string;
  userId: string;
  userName: string;
  userPhone: string;
  deviceName: string;
  deviceCategory: string;
  subType: string;
  storage?: string;
  batteryHealth: string;
  simType?: string;
  faceIdStatus?: string;
  repairs: string[];
  mediaCount: number;
  imeiVerified: boolean;
  estimatedMin: number;
  estimatedMax: number;
  listingType: ListingType;
  // swap only
  wantedDevice?: string;
  wantedCategory?: string;
  topUpAmount?: number;
  // bids
  bids?: Bid[];
  status: ListingStatus;
  createdAt: Date;
};

export type Bid = {
  vendorId: string;
  vendorName: string;
  amount: number;
  message?: string;
  createdAt: Date;
};

export type Notification = {
  _id?: string;
  recipientType: "all_users" | "all_vendors" | "specific";
  recipientId?: string;
  type: NotificationType;
  title: string;
  message: string;
  listingId?: string;
  read: boolean;
  createdAt: Date;
};

export type InventoryItem = {
  _id?: string;
  vendorId: string;
  deviceName: string;
  buyPrice: number;
  sellPrice: number;
  condition: string;
  status: "in_stock" | "sold";
  soldAt?: Date;
  createdAt: Date;
};

export type GadgetCategory = "Phone" | "Laptop";

export type Gadget = {
  id: string;
  name: string;
  brand: string;
  category: GadgetCategory;
  image: string;
  minPrice: number;
  maxPrice: number;
  condition: "New" | "UK Used" | "Refurbished";
  rating: number;
  storage?: string;
  sim?: {
    physicalSim: boolean;
    esim: boolean;
    esimOnly: boolean;
    unlocked: boolean;
  };
  os?: "Windows" | "macOS" | "Linux";
  type?: "Gaming" | "Ultrabook" | "Business";
  bestDeal?: boolean;
  priceHistory?: { date: string; price: number }[];
};
