import { Gadget } from "../types";

/**
 * A phone-sized, auto-format (WebP/AVIF) version of a Cloudinary image.
 * Listing photos are uploaded full-size (often 1–3 MB); cards only need a
 * few hundred pixels. Non-Cloudinary URLs and already-transformed ones are
 * returned unchanged.
 */
export function cldImage(url: string | null | undefined, width = 480): string | undefined {
  if (!url) return undefined;
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/);
  if (!m) return url;
  const rest = m[2];
  // Already has a transformation segment (e.g. "w_300,c_fill/...") — leave it.
  if (/^[a-z]{1,3}_[^/]*\//.test(rest) && !/^v\d+\//.test(rest)) return url;
  return `${m[1]}f_auto,q_auto,c_limit,w_${width}/${rest}`;
}

export const formatPrice = (p: number) =>
  `₦${Math.round(p).toLocaleString("en-NG")}`;
export const getAveragePrice = (min: number, max: number) =>
  Math.round((min + max) / 2);
export const getPriceRange = (g: Gadget) =>
  `${formatPrice(g.minPrice)} – ${formatPrice(g.maxPrice)}`;

export const getRecommendation = (g: Gadget) => {
  if (g.rating >= 4.7) return "Excellent choice";
  if (g.rating >= 4.5) return "Great value";
  if (g.rating >= 4.0) return "Solid performance";
  return "Budget-friendly";
};

export const getValueScore = (g: Gadget): number => {
  const avg = (g.minPrice + g.maxPrice) / 2;
  let score = 50;
  if (avg < 300000) score += 15;
  else if (avg < 700000) score += 10;
  score += (g.rating || 0) * 8;
  if (g.bestDeal) score += 15;
  if (g.sim?.physicalSim) score += 5;
  return Math.min(100, Math.round(score));
};

export const getPriceInsight = (g: Gadget) => {
  const avg = (g.minPrice + g.maxPrice) / 2;
  if (avg < 400000) return "CHEAP";
  if (avg < 900000) return "FAIR";
  return "EXPENSIVE";
};

export const getDealLabel = (g: Gadget) => {
  const score = getValueScore(g);
  if (score >= 85) return "Hot Deal";
  if (score >= 70) return "Good Deal";
  return "Overpriced";
};

export const getPriceTrend = (g: Gadget) => {
  if (!g.priceHistory || g.priceHistory.length < 2) return null;
  const first = g.priceHistory[0].price;
  const last = g.priceHistory.at(-1)!.price;
  if (last < first) return "down";
  if (last > first) return "up";
  return "stable";
};

export const getPriceDrop = (g: Gadget) => {
  if (!g.priceHistory || g.priceHistory.length < 2) return null;
  const prev = g.priceHistory.at(-2)!.price;
  const curr = g.priceHistory.at(-1)!.price;
  return prev > curr ? prev - curr : null;
};

export const isOverpriced = (g: Gadget) => {
  if (!g.priceHistory) return false;
  const avg =
    g.priceHistory.reduce((a, b) => a + b.price, 0) / g.priceHistory.length;
  return (g.minPrice + g.maxPrice) / 2 > avg * 1.25;
};

export const getRecommendations = (all: Gadget[], current: Gadget) =>
  all
    .filter((g) => g.id !== current.id && g.category === current.category)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

type FilterOptions = {
  query?: string;
  category?: string;
  brand?: string;
  min?: number | string;
  max?: number | string;
  os?: string;
  type?: string;
  condition?: string;
  sim?: string;
  sort?: string;
};

export const advancedFilter = (gadgets: Gadget[], filters: FilterOptions) =>
  gadgets.filter(
    (g) =>
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
      return s;
    };
    return score(b) - score(a);
  });
};

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
