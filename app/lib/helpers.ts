import { Gadget } from "../types";

// ─── PRICE ───────────────────────────────────────────────────────
export const formatPrice = (price: number) =>
  `₦${price.toLocaleString("en-NG")}`;

export const getAveragePrice = (min: number, max: number) =>
  Math.round((min + max) / 2);

export const getPriceRange = (g: Gadget) =>
  `${formatPrice(g.minPrice)} – ${formatPrice(g.maxPrice)}`;

export const getRecommendation = (g: Gadget) => {
  if (g.rating >= 4.7) return "Excellent choice 🔥";
  if (g.rating >= 4.5) return "Great value 💰";
  if (g.rating >= 4.0) return "Solid performance";
  return "Budget-friendly";
};

// ─── FILTER ──────────────────────────────────────────────────────
type FilterOptions = {
  query?: string;
  category?: string;
  brand?: string;
  min?: number | string;
  max?: number | string;
  os?: string;
  type?: string;
  condition?: string;
  sim?: "physical" | "esim" | "esim-only" | string;
  sort?: string;
};

export const advancedFilter = (gadgets: Gadget[], filters: FilterOptions) => {
  return gadgets.filter((g) => {
    return (
      (!filters.query ||
        g.name.toLowerCase().includes(filters.query.toLowerCase())) &&
      (!filters.category || g.category === filters.category) &&
      (!filters.brand || g.brand === filters.brand) &&
      (!filters.min || g.minPrice >= Number(filters.min)) &&
      (!filters.max || g.maxPrice <= Number(filters.max)) &&
      (!filters.os || g.os === filters.os) &&
      (!filters.type || g.type === filters.type) &&
      (!filters.condition || g.condition === filters.condition) &&
      (!filters.sim ||
        (filters.sim === "physical" && g.sim?.physicalSim) ||
        (filters.sim === "esim" && g.sim?.esim) ||
        (filters.sim === "esim-only" && g.sim?.esimOnly))
    );
  });
};

// ─── SMART RANKING ───────────────────────────────────────────────
export const rankGadgets = (gadgets: Gadget[], query: string) => {
  if (!query) return gadgets;

  return [...gadgets].sort((a, b) => {
    const q = query.toLowerCase();

    const score = (g: Gadget) => {
      let s = 0;
      if (g.name.toLowerCase().includes(q)) s += 50;
      if (g.brand.toLowerCase().includes(q)) s += 30;
      if (g.bestDeal) s += 20;
      s += g.rating * 5;
      if (g.sim?.physicalSim) s += 10;
      return s;
    };

    return score(b) - score(a);
  });
};

// ─── SORT ─────────────────────────────────────────────────────────
export const sortGadgets = (gadgets: Gadget[], sort: string) => {
  if (!sort) return gadgets;
  if (sort === "price-low")
    return [...gadgets].sort((a, b) => a.minPrice - b.minPrice);
  if (sort === "price-high")
    return [...gadgets].sort((a, b) => b.maxPrice - a.maxPrice);
  if (sort === "rating")
    return [...gadgets].sort((a, b) => b.rating - a.rating);
  if (sort === "best")
    return [...gadgets].sort((a, b) => Number(b.bestDeal) - Number(a.bestDeal));
  return gadgets;
};
