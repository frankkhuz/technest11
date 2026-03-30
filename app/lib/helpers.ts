import { Gadget } from "../types";

// ─── PRICE ───────────────────────────────────────────────────────
export const formatPrice = (p: number) => `₦${p.toLocaleString("en-NG")}`;

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

// ─── PRICE INTELLIGENCE ──────────────────────────────────────────
export const getValueScore = (g: Gadget): number => {
  const avgPrice = (g.minPrice + g.maxPrice) / 2;
  let score = 50;
  if (avgPrice < 300000) score += 15;
  else if (avgPrice < 700000) score += 10;
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
  if (score >= 85) return "🔥 HOT DEAL";
  if (score >= 70) return "👍 GOOD DEAL";
  return "❌ OVERPRICED";
};

// ─── PRICE HISTORY ───────────────────────────────────────────────
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
  const current = (g.minPrice + g.maxPrice) / 2;
  return current > avg * 1.25;
};

// ─── RECOMMENDATIONS ─────────────────────────────────────────────
export const getRecommendations = (all: Gadget[], current: Gadget) =>
  all
    .filter((g) => g.id !== current.id && g.category === current.category)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

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
  sim?: string;
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
