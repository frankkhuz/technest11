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
  priceHistory?: {
    date: string;
    price: number;
  }[];
};
