import { Gadget } from "@/types";

// ─── PRICE HELPERS ─────────────────────────

export const formatPrice = (price: number) =>
  `₦${price.toLocaleString("en-NG")}`;

export const getAveragePrice = (min: number, max: number) =>
  Math.round((min + max) / 2);

export const getPriceRange = (g: Gadget) =>
  `${formatPrice(g.minPrice)} – ${formatPrice(g.maxPrice)}`;

export const getRecommendation = (g: Gadget) => {
  if (!g.rating) return "Good option for the Nigerian market.";
  if (g.rating >= 4.7) return "Excellent choice — top rated.";
  if (g.rating >= 4.5) return "Great value for money.";
  if (g.rating >= 4.0) return "Solid performance.";
  return "Budget-friendly option.";
};

// ─── FILTER ───────────────────────────────

export const advancedFilter = (gadgets: Gadget[], filters: any) => {
  return gadgets.filter((g) => {
    const matchesQuery = filters.query
      ? g.name.toLowerCase().includes(filters.query.toLowerCase())
      : true;

    const matchesCategory = filters.category
      ? g.category === filters.category
      : true;

    const matchesBrand = filters.brand ? g.brand === filters.brand : true;

    const matchesPrice =
      (!filters.min || g.minPrice >= Number(filters.min)) &&
      (!filters.max || g.maxPrice <= Number(filters.max));

    const matchesOS = filters.os ? g.os === filters.os : true;

    const matchesType = filters.type ? g.type === filters.type : true;

    const matchesCondition = filters.condition
      ? g.condition === filters.condition
      : true;

    const matchesSim =
      filters.sim === "physical"
        ? g.sim?.physicalSim === true
        : filters.sim === "esim"
        ? g.sim?.esim === true
        : filters.sim === "esim-only"
        ? g.sim?.esimOnly === true
        : true;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesBrand &&
      matchesPrice &&
      matchesOS &&
      matchesType &&
      matchesCondition &&
      matchesSim
    );
  });
};

// ─── SMART RANKING 🔥 ─────────────────────

export const rankGadgets = (gadgets: Gadget[], query: string) => {
  if (!query) return gadgets;

  return [...gadgets].sort((a, b) => {
    const q = query.toLowerCase();

    const score = (g: Gadget) => {
      let s = 0;

      if (g.name.toLowerCase().includes(q)) s += 50;
      if (g.brand.toLowerCase().includes(q)) s += 30;
      if (g.bestDeal) s += 20;
      s += (g.rating || 0) * 5;

      if (g.sim?.physicalSim) s += 10; // Nigeria boost

      return s;
    };

    return score(b) - score(a);
  });
};

// ─── SORT ────────────────────────────────

export const sortGadgets = (gadgets: Gadget[], sort: string) => {
  if (!sort) return gadgets;

  if (sort === "price-low")
    return [...gadgets].sort((a, b) => a.minPrice - b.minPrice);

  if (sort === "price-high")
    return [...gadgets].sort((a, b) => b.maxPrice - a.maxPrice);

  if (sort === "rating")
    return [...gadgets].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (sort === "best")
    return [...gadgets].sort(
      (a, b) => (b.bestDeal ? 1 : 0) - (a.bestDeal ? 1 : 0)
    );

  return gadgets;
};
