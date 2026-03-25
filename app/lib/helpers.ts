import { Gadget } from "../types";

export const formatPrice = (price: number) => {
  return `₦${price.toLocaleString()}`;
};

export const getAveragePrice = (min: number, max: number) => {
  return Math.floor((min + max) / 2);
};

export const getPriceRange = (gadget: Gadget) => {
  return `${formatPrice(gadget.minPrice)} - ${formatPrice(gadget.maxPrice)}`;
};

export const getRecommendation = (gadget: Gadget) => {
  if (gadget.rating >= 4.6) return "🔥 Top Tier Choice";
  if (gadget.rating >= 4.3) return "👍 Solid Pick";
  return "💡 Budget Friendly";
};

export const filterGadgetsAdvanced = (
  gadgets: Gadget[],
  query: string,
  brand: string,
  minPrice: string,
  maxPrice: string
) => {
  return gadgets.filter((g) => {
    const matchesQuery = g.name.toLowerCase().includes(query.toLowerCase());

    const matchesBrand = brand ? g.brand === brand : true;

    const matchesPrice =
      (!minPrice || g.minPrice >= Number(minPrice)) &&
      (!maxPrice || g.maxPrice <= Number(maxPrice));

    return matchesQuery && matchesBrand && matchesPrice;
  });
};
