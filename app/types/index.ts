export type Gadget = {
  id: string;
  name: string;
  brand: "Apple" | "Samsung" | "Tecno";
  model: string;

  image: string;

  minPrice: number;
  maxPrice: number;

  condition: "New" | "UK Used" | "Refurbished";

  rating: number;
  bestDeal?: boolean;
};
