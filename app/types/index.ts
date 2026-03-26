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

  // PHONE SPECIFIC
  storage?: string; // e.g. 128GB, 256GB

  sim?: {
    physicalSim: boolean;
    esim: boolean;
    esimOnly: boolean;
    unlocked: boolean;
  };

  // LAPTOP SPECIFIC
  os?: "Windows" | "macOS" | "Linux";
  type?: "Gaming" | "Ultrabook" | "Business";

  bestDeal?: boolean;
};
