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

  // PHONE
  storage?: string;
  sim?: {
    physicalSim: boolean;
    esim: boolean;
    esimOnly: boolean;
    unlocked: boolean;
  };

  // LAPTOP
  os?: "Windows" | "macOS" | "Linux";
  type?: "Gaming" | "Ultrabook" | "Business";

  bestDeal?: boolean;
};
