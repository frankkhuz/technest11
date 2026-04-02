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

export type UserRole = "seller" | "vendor";
export type VendorStatus = "pending" | "approved" | "rejected";

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

export type Valuation = {
  _id?: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  deviceName: string;
  category: string;
  subType: string;
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
  vendorId?: string;
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
