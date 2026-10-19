import { apiFetch } from "./api";
import type { ProductSale } from "@/app/types/backend";

// Same shape as the old BuyPhone / BuyGadget from app/data/gadget.ts, now
// served by the backend catalog instead of a static array. `type`
// discriminates phone vs. gadget rows and `inStock` gates purchase. Ids
// match the old static ids, so anything already saved in a buyer's cart
// keeps resolving correctly.
export type Product = {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  type: "phone" | "gadget";
  image?: string;
  storage?: string[];
  priceUkUsed: number;
  priceBrandNew: number;
  ram?: string;
  category?: "flagship" | "mid-range" | "budget";
  gadgetCategory?: string;
  spec?: string;
  badge?: string;
  color?: string[];
  tags?: string[];
  inStock: boolean;
  attributes?: Record<string, string | number | boolean | string[]>;
  sale?: ProductSale | null;
  stockQuantity?: number | null;
  lowStock?: boolean;
};

/** Today's price for a condition — the flash-sale price while a sale is live. */
export function priceFor(p: Product, condition: "uk-used" | "brand-new") {
  const regular = condition === "brand-new" ? p.priceBrandNew : p.priceUkUsed;
  if (!p.sale?.active) return { price: regular, was: null as number | null };
  const sale = condition === "brand-new" ? p.sale.priceBrandNew : p.sale.priceUkUsed;
  return sale && sale < regular ? { price: sale, was: regular } : { price: regular, was: null };
}

/** "Only 3 left" when stock is counted and running low. */
export function stockNote(p: Product): string | null {
  if (!p.inStock) return null;
  const q = p.stockQuantity;
  if (typeof q === "number" && q > 0 && (p.lowStock || q <= 5)) return `Only ${q} left`;
  return p.lowStock ? "Low stock" : null;
}

export type ProductFilters = {
  type?: "phone" | "gadget";
  category?: string;
  brand?: string;
  q?: string;
  sort?: "price-asc" | "price-desc";
  condition?: "uk-used" | "brand-new";
};

function buildQuery(filters: ProductFilters, extra?: Record<string, string | number>) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.q) params.set("q", filters.q);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.condition) params.set("condition", filters.condition);
  if (extra) for (const [k, v] of Object.entries(extra)) params.set(k, String(v));
  return params.toString();
}

/** Fetches every product matching the filters, following pagination until
 * every page has been collected — the catalog is small (under 100 items),
 * so this is cheap and keeps every caller working off the full result set. */
export async function fetchAllProducts(
  filters: ProductFilters = {},
  extra: Record<string, string> = {}
): Promise<Product[]> {
  const all: Product[] = [];
  let page = 1;
  for (;;) {
    const res = await apiFetch(`/api/products?${buildQuery(filters, { ...extra, page, limit: 100 })}`);
    if (!res.ok) break;
    const json = await res.json();
    const products: Product[] = json?.data?.products ?? [];
    all.push(...products);
    const pages: number = json?.data?.pages ?? 1;
    if (page >= pages || products.length === 0) break;
    page += 1;
  }
  return all;
}

export async function fetchProduct(idOrSlug: string): Promise<Product | null> {
  const res = await apiFetch(`/api/products/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data?.product ?? null;
}

export type ProductSearchResult = {
  products: Product[];
  filters: Record<string, unknown>;
  summary?: string;
  relaxed: boolean;
  source: "ai" | "rules";
};

export async function searchProducts(q: string): Promise<ProductSearchResult | null> {
  const res = await apiFetch(`/api/products/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return null;
  const json = await res.json();
  return {
    products: json?.data?.products ?? [],
    filters: json?.data?.filters ?? {},
    summary: json?.data?.summary,
    relaxed: !!json?.data?.relaxed,
    source: json?.data?.source ?? "rules",
  };
}
