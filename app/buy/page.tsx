"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Package,
  MessageCircle,
  Undo2,
  Search,
  Inbox,
  Smartphone,
  Camera,
  Watch,
  PenTool,
  Keyboard,
  Headphones,
  Tablet,
  Puzzle,
  Cctv,
  Plane,
  Sun,
  Router,
  Wifi,
  Laptop,
  Gamepad2,
  ShoppingCart,
  Check,
  Loader2,
  X,
  Store,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import Navbar from "../component/layout/Navbar";
import SectionBackground from "@/app/component/home/SectionBackground";
import { useTheme } from "@/app/hooks/useTheme";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/app/context/CartContext";
import { apiFetch } from "@/app/lib/api";
import { brands, gadgetCategories, formatPrice } from "../data/gadget";
import type { PhoneCondition, GadgetCategoryKey } from "../data/gadget";
import {
  fetchAllProducts,
  searchProducts,
  type Product,
  type ProductSearchResult,
} from "@/app/lib/products";

type MarketplaceListing = {
  _id: string;
  owner?: { _id: string; name: string };
  userName: string;
  deviceName: string;
  storage?: string;
  estimatedMin: number;
  estimatedMax: number;
  listingType: string;
  images?: string[];
  status: string;
};

type CatalogTab = "phone" | GadgetCategoryKey;

const CATEGORY_ICONS: Record<CatalogTab, LucideIcon> = {
  phone: Smartphone,
  camera: Camera,
  watch: Watch,
  stylus: PenTool,
  keyboard: Keyboard,
  audio: Headphones,
  tablet: Tablet,
  accessory: Puzzle,
  security: Cctv,
  drone: Plane,
  power: Sun,
  router: Router,
  mifi: Wifi,
  laptop: Laptop,
  console: Gamepad2,
};

const CATALOG_TABS: { id: CatalogTab; label: string }[] = [
  { id: "phone", label: "Phones" },
  ...gadgetCategories.map((c) => ({ id: c.id as CatalogTab, label: c.label })),
];

// ─── SVG placeholder shown when a product image fails to load ─────────────────
const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23F0F0F8'/%3E%3Crect x='72' y='24' width='56' height='104' rx='10' fill='%23C8C8E0'/%3E%3Ccircle cx='100' cy='148' r='7' fill='%23C8C8E0'/%3E%3C/svg%3E";

type Step = "condition" | "browse";
type SortOption = "default" | "price-asc" | "price-desc";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function BuyPage() {
  const router = useRouter();
  const { dark } = useTheme();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("condition");
  const [mode, setMode] = useState<"catalog" | "marketplace" | null>(null);
  const [condition, setCondition] = useState<PhoneCondition | null>(null);
  const [activeCatalog, setActiveCatalog] = useState<CatalogTab>("phone");
  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [storageFilter, setStorageFilter] = useState<string>("all");
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ProductSearchResult | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchAllProducts()
      .then(setAllProducts)
      .catch(() => {})
      .finally(() => setProductsLoading(false));
  }, []);

  const phones = useMemo(() => allProducts.filter((p) => p.type === "phone"), [allProducts]);
  const gadgets = useMemo(() => allProducts.filter((p) => p.type === "gadget"), [allProducts]);

  // ── Marketplace mode — the same real, seller-listed devices shown on
  // /marketplace, not the curated catalog above ──────────────────────────
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingSearch, setListingSearch] = useState("");
  const [buyingListingId, setBuyingListingId] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "marketplace") return;
    setListingsLoading(true);
    apiFetch("/api/listings?limit=50")
      .then((r) => r.json())
      .then((d) => setListings(d.data?.listings ?? d.listings ?? []))
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false));
  }, [mode]);

  const forSaleListings = useMemo(
    () =>
      listings.filter((l) => {
        // Same rule /marketplace uses for its "For Sale" grid — listingType
        // only, no status filter — so both pages show the exact same set.
        if (l.listingType !== "sell") return false;
        const q = listingSearch.toLowerCase();
        return q === "" || l.deviceName.toLowerCase().includes(q);
      }),
    [listings, listingSearch]
  );

  const handleListingBuy = (listing: MarketplaceListing) => {
    if (!user) {
      router.push("/auth/login?from=/buy");
      return;
    }
    setBuyingListingId(listing._id);
    apiFetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({ type: "buy", listingId: listing._id }),
    })
      .catch(() => {})
      .finally(() => {
        setBuyingListingId(null);
        router.push(`/checkout?listingId=${listing._id}`);
      });
  };

  const runSmartSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const result = await searchProducts(q);
      if (result) setSearchResults(result);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const handleQuickAdd = (
    e: React.MouseEvent,
    id: string,
    itemType: "phone" | "gadget"
  ) => {
    e.stopPropagation();
    addToCart({ itemId: id, itemType, condition: condition ?? "uk-used", quantity: 1 });
    setJustAdded(id);
    setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 1200);
  };

  const priceOf = (p: { priceUkUsed: number; priceBrandNew: number }) =>
    condition === "brand-new" ? p.priceBrandNew : p.priceUkUsed;

  const applySort = <T extends { priceUkUsed: number; priceBrandNew: number }>(
    list: T[]
  ) => {
    if (sortBy === "default") return list;
    const sorted = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    return sortBy === "price-desc" ? sorted.reverse() : sorted;
  };

  const storageOptions = useMemo(() => {
    const set = new Set<string>();
    phones
      .filter((p) => activeBrand === "all" || p.brand === activeBrand)
      .forEach((p) => p.storage?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [phones, activeBrand]);

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    phones
      .filter((p) => activeBrand === "all" || p.brand === activeBrand)
      .forEach((p) => p.color?.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [phones, activeBrand]);

  const filteredPhones = useMemo(() => {
    if (searchResults) return applySort(searchResults.products.filter((p) => p.type === "phone"));
    const list = phones.filter((p) => {
      const brandMatch = activeBrand === "all" || p.brand === activeBrand;
      const storageMatch =
        storageFilter === "all" || (p.storage ?? []).includes(storageFilter);
      const colorMatch =
        colorFilter === "all" || (p.color ?? []).includes(colorFilter);
      const q = searchQuery.toLowerCase();
      const nameMatch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return brandMatch && storageMatch && colorMatch && nameMatch;
    });
    return applySort(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phones, activeBrand, storageFilter, colorFilter, searchQuery, sortBy, condition, searchResults]);

  const filteredGadgets = useMemo(() => {
    if (activeCatalog === "phone") return [];
    if (searchResults)
      return applySort(
        searchResults.products.filter((p) => p.type === "gadget" && p.gadgetCategory === activeCatalog)
      );
    const list = gadgets.filter((g) => {
      if (g.gadgetCategory !== activeCatalog) return false;
      const q = searchQuery.toLowerCase();
      return (
        q === "" ||
        g.name.toLowerCase().includes(q) ||
        g.brand.toLowerCase().includes(q)
      );
    });
    return applySort(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gadgets, activeCatalog, searchQuery, sortBy, condition, searchResults]);

  const filtered = activeCatalog === "phone" ? filteredPhones : [];

  // ── Step 1: Condition picker ──────────────────────────────────────────────────
  if (step === "condition") {
    return (
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ background: "var(--bg)", color: "var(--ink)" }}
      >
        <Navbar />

        <div className="max-w-5xl mx-auto px-6 pt-8 pb-2">
          <button
            onClick={() => router.push("/")}
            className="text-sm flex items-center gap-1.5"
            style={{ color: "var(--ink-soft)" }}
          >
            ← Back to Home
          </button>
        </div>

        <div className="relative overflow-hidden">
          <SectionBackground dark={dark} minCount={8} maxCount={20} />
          <div className="relative max-w-3xl mx-auto px-6 py-10 text-center">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--accent)" }}
          >
            Step 1 of 2
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "var(--ink)" }}
          >
            What type of device
            <br />
            are you looking for?
          </h1>
          <p className="text-base mb-12" style={{ color: "var(--ink-soft)" }}>
            Choose the condition that suits your budget and preference.
          </p>

          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* UK Used card */}
            <button
              onClick={() => {
                setMode("catalog");
                setCondition("uk-used");
                setStep("browse");
              }}
              className="rounded-2xl p-7 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "#020044" }}
            >
              <MapPin className="w-9 h-9 mb-4 text-white" />
              <h2 className="text-white font-bold text-xl mb-2">UK Used</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Fairly used, shipped from the UK. Great condition at a lower
                price point.
              </p>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
              >
                Up to 40% off new price →
              </span>
            </button>

            {/* Brand New card */}
            <button
              onClick={() => {
                setMode("catalog");
                setCondition("brand-new");
                setStep("browse");
              }}
              className="rounded-2xl p-7 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "var(--accent)" }}
            >
              <Sparkles className="w-9 h-9 mb-4 text-white" />
              <h2 className="text-white font-bold text-xl mb-2">Brand New</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Sealed box, full warranty. Latest models from official
                distributors.
              </p>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
              >
                Full warranty included →
              </span>
            </button>

            {/* Marketplace card */}
            <button
              onClick={() => {
                setMode("marketplace");
                setCondition(null);
                setStep("browse");
              }}
              className="rounded-2xl p-7 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: "#7C3AED" }}
            >
              <Store className="w-9 h-9 mb-4 text-white" />
              <h2 className="text-white font-bold text-xl mb-2">Marketplace</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Real devices listed by real sellers on TechNest — negotiate-free,
                pay straight through checkout.
              </p>
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
              >
                Buy from real sellers →
              </span>
            </button>
          </div>

          {/* Trust strip */}
          <div
            className="mt-12 rounded-2xl px-6 py-5 flex flex-wrap gap-6 justify-center"
            style={{ background: "var(--border)" }}
          >
            {[
              { Icon: ShieldCheck, text: "Verified Sellers" },
              { Icon: Package, text: "Fast Delivery" },
              { Icon: MessageCircle, text: "24/7 Support" },
              { Icon: Undo2, text: "Easy Returns" },
            ].map(({ Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: "var(--ink)" }}
              >
                <Icon className="w-4 h-4" />
                {text}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2 (Marketplace mode): real seller listings, same data as /marketplace ──
  if (mode === "marketplace") {
    return (
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ background: "var(--bg)", color: "var(--ink)" }}
      >
        <Navbar />

        {/* Top bar */}
        <div style={{ background: "#7C3AED" }} className="px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/60 text-xs mb-0.5">Step 2 of 2 · Browsing</p>
              <h1 className="inline-flex items-center gap-2 text-white font-bold text-xl">
                <Store className="w-5 h-5" /> Marketplace
              </h1>
            </div>
            <button
              onClick={() => {
                setStep("condition");
                setMode(null);
              }}
              className="text-sm font-medium px-4 py-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
            >
              ← Change Condition
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Search */}
          <div className="relative mb-6">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--ink-soft)" }}
            />
            <input
              type="text"
              placeholder="Search marketplace devices..."
              value={listingSearch}
              onChange={(e) => setListingSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            />
          </div>

          <p className="text-xs mb-5" style={{ color: "var(--ink-soft)" }}>
            {forSaleListings.length} device{forSaleListings.length !== 1 ? "s" : ""} found —
            listed by real sellers on TechNest
          </p>

          {listingsLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: "var(--ink-soft)" }} />
            </div>
          ) : forSaleListings.length === 0 ? (
            <div className="text-center py-20">
              <Inbox className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--ink-soft)" }} />
              <p className="font-semibold" style={{ color: "var(--ink)" }}>
                No marketplace listings found
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
                Try a different search, or check back soon
              </p>
            </div>
          ) : (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {forSaleListings.map((l) => (
                <motion.div
                  key={l._id}
                  variants={cardVariants}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl overflow-hidden border transition-shadow duration-200 hover:shadow-lg"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="relative flex items-center justify-center"
                    style={{ background: "var(--accent-soft)", height: 160 }}
                  >
                    {l.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.images[0]} alt={l.deviceName} className="h-full w-full object-cover" />
                    ) : (
                      <Smartphone className="w-14 h-14" style={{ color: "#7C3AED" }} strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="p-3">
                    <p
                      className="font-semibold text-xs leading-snug mb-0.5 line-clamp-2"
                      style={{ color: "var(--ink)" }}
                    >
                      {l.deviceName}
                    </p>
                    <p className="text-[10px] mb-2" style={{ color: "var(--ink-soft)" }}>
                      {l.storage ? `${l.storage} · ` : ""}by {l.userName}
                    </p>
                    <p className="font-bold text-sm mb-2" style={{ color: "#7C3AED" }}>
                      {formatPrice(l.estimatedMin)}
                      {l.estimatedMax !== l.estimatedMin && (
                        <span className="font-normal text-[10px]" style={{ color: "var(--ink-soft)" }}>
                          {" "}
                          – {formatPrice(l.estimatedMax)}
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => handleListingBuy(l)}
                      disabled={buyingListingId === l._id}
                      className="w-full text-xs font-semibold py-2 rounded-lg inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                      style={{ background: "#7C3AED", color: "#fff", cursor: "pointer" }}
                    >
                      {buyingListingId === l._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      )}
                      Buy
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ── Step 2: Browse phones ─────────────────────────────────────────────────────
  const ConditionIcon = condition === "uk-used" ? MapPin : Sparkles;
  const conditionLabel = condition === "uk-used" ? "UK Used" : "Brand New";
  // accentColor: solid brand fill, always paired with white text — safe as a
  // static literal in both themes (navy/purple both read fine under white text).
  const accentColor = condition === "uk-used" ? "#020044" : "var(--accent)";
  // accentTextColor: used where the color sits as TEXT on a theme-reactive
  // surface (var(--surface)/var(--border)) — navy text would vanish on a dark
  // surface, so it swaps to var(--ink) for uk-used instead of staying literal.
  const accentTextColor = condition === "uk-used" ? "var(--ink)" : "var(--accent)";

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      <Navbar />

      {/* Top bar */}
      <div style={{ background: accentColor }} className="px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/60 text-xs mb-0.5">
              Step 2 of 2 · Browsing
            </p>
            <h1 className="inline-flex items-center gap-2 text-white font-bold text-xl">
              <ConditionIcon className="w-5 h-5" /> {conditionLabel}
            </h1>
          </div>
          <button
            onClick={() => {
              setStep("condition");
              setMode(null);
              setActiveBrand("all");
              setSearchQuery("");
            }}
            className="text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
          >
            ← Change Condition
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {CATALOG_TABS.map((tab) => {
            const TabIcon = CATEGORY_ICONS[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCatalog(tab.id);
                  setActiveBrand("all");
                }}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
                style={
                  activeCatalog === tab.id
                    ? { background: "var(--surface)", color: accentTextColor }
                    : {
                        background: "var(--border)",
                        color: "var(--ink-soft)",
                      }
                }
              >
                <TabIcon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--ink-soft)" }}
          />
          <input
            type="text"
            placeholder={`Search — e.g. "${
              activeCatalog === "phone" ? "iphone under 600k 256gb" : "wireless mouse"
            }"`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (searchResults && !e.target.value.trim()) setSearchResults(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && runSmartSearch()}
            className="w-full pl-9 pr-16 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--ink)",
            }}
          />
          {searching ? (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin"
              style={{ color: "var(--ink-soft)" }}
            />
          ) : searchResults ? (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: "var(--ink-soft)", cursor: "pointer" }}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={runSmartSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
              style={{ background: accentColor, color: "#fff", cursor: "pointer" }}
            >
              Search
            </button>
          )}
        </div>

        {searchResults && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {searchResults.relaxed && (
              <span className="text-xs" style={{ color: "var(--ink-soft)" }}>
                No exact match — showing the closest options.
              </span>
            )}
            {Object.entries(searchResults.filters).map(([k, v]) =>
              v === undefined || v === null || v === "" ? null : (
                <span
                  key={k}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: "var(--accent-soft)", color: accentTextColor }}
                >
                  {k}: {String(v)}
                </span>
              )
            )}
          </div>
        )}

        {/* Brand tabs — phones only */}
        {activeCatalog === "phone" && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setActiveBrand(b.id);
                  setStorageFilter("all");
                  setColorFilter("all");
                }}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
                style={
                  activeBrand === b.id
                    ? { background: accentColor, color: "#fff" }
                    : {
                        background: "var(--surface)",
                        color: "var(--ink-soft)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* Sort & filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs px-3 py-2 rounded-lg outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          {activeCatalog === "phone" && storageOptions.length > 0 && (
            <select
              value={storageFilter}
              onChange={(e) => setStorageFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
                cursor: "pointer",
              }}
            >
              <option value="all">All Storage</option>
              {storageOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {activeCatalog === "phone" && colorOptions.length > 0 && (
            <select
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
                cursor: "pointer",
              }}
            >
              <option value="all">All Colors</option>
              {colorOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Result count */}
        {!productsLoading && (
          <p className="text-xs mb-5" style={{ color: "var(--ink-soft)" }}>
            {activeCatalog === "phone" ? filtered.length : filteredGadgets.length}{" "}
            device
            {(activeCatalog === "phone" ? filtered.length : filteredGadgets.length) !==
            1
              ? "s"
              : ""}{" "}
            found
          </p>
        )}

        {productsLoading ? (
          <div className="text-center py-20">
            <Loader2
              className="w-8 h-8 mx-auto mb-4 animate-spin"
              style={{ color: "var(--ink-soft)" }}
            />
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Loading catalog...
            </p>
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-20">
            <Inbox
              className="w-10 h-10 mx-auto mb-4"
              style={{ color: "var(--ink-soft)" }}
            />
            <p className="font-semibold" style={{ color: "var(--ink)" }}>
              Catalog coming soon
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
              We&apos;re loading stock — check back shortly.
            </p>
          </div>
        ) : (
          <>
        {/* Gadget grid — non-phone categories */}
        {activeCatalog !== "phone" &&
          (filteredGadgets.length === 0 ? (
            <div className="text-center py-20">
              <Inbox
                className="w-10 h-10 mx-auto mb-4"
                style={{ color: "var(--ink-soft)" }}
              />
              <p className="font-semibold" style={{ color: "var(--ink)" }}>
                No devices found
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--ink-soft)" }}
              >
                Try a different category or search term
              </p>
            </div>
          ) : (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {filteredGadgets.map((gadget) => {
                const price =
                  condition === "uk-used"
                    ? gadget.priceUkUsed
                    : gadget.priceBrandNew;
                const GadgetIcon =
                  CATEGORY_ICONS[gadget.gadgetCategory as GadgetCategoryKey] ?? Puzzle;

                return (
                  <motion.div
                    key={gadget.id}
                    variants={cardVariants}
                    whileHover={gadget.inStock ? { y: -4 } : undefined}
                    onClick={() =>
                      gadget.inStock &&
                      router.push(`/buy/${gadget.id}?condition=${condition}`)
                    }
                    className={`rounded-2xl overflow-hidden border group transition-shadow duration-200 ${
                      gadget.inStock ? "cursor-pointer hover:shadow-lg" : "cursor-not-allowed opacity-50"
                    }`}
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    {/* Icon tile — stands in for a product photo */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{ background: "var(--accent-soft)", height: 160 }}
                    >
                      {!gadget.inStock && (
                        <span
                          className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full z-10"
                          style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                        >
                          Out of stock
                        </span>
                      )}
                      {gadget.badge && gadget.inStock && (
                        <span
                          className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: gadget.badge === "Hot"
                              ? "rgba(220,38,38,0.1)"
                              : "var(--border)",
                            color: gadget.badge === "Hot" ? "#DC2626" : "var(--ink-soft)",
                          }}
                        >
                          {gadget.badge}
                        </span>
                      )}
                      <span
                        className="absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            condition === "uk-used"
                              ? "var(--border)"
                              : "var(--accent-soft)",
                          color: accentTextColor,
                        }}
                      >
                        {condition === "uk-used" ? "UK Used" : "Brand New"}
                      </span>

                      <GadgetIcon
                        className="w-14 h-14 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: "var(--accent)" }}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p
                        className="font-semibold text-xs leading-snug mb-0.5 line-clamp-2"
                        style={{ color: "var(--ink)" }}
                      >
                        {gadget.name}
                      </p>
                      <p className="text-[10px] mb-2" style={{ color: "var(--ink-soft)" }}>
                        {gadget.brand}
                        {gadget.spec ? ` · ${gadget.spec}` : ""}
                      </p>

                      <div className="flex items-center justify-between gap-1.5">
                        <p className="font-bold text-sm" style={{ color: accentTextColor }}>
                          {formatPrice(price)}
                        </p>
                        <button
                          onClick={(e) => gadget.inStock && handleQuickAdd(e, gadget.id, "gadget")}
                          disabled={!gadget.inStock}
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                          style={{
                            background: justAdded === gadget.id ? "#16a34a" : "var(--accent-soft)",
                            color: justAdded === gadget.id ? "#fff" : "var(--accent)",
                            cursor: gadget.inStock ? "pointer" : "not-allowed",
                          }}
                          aria-label={`Add ${gadget.name} to cart`}
                        >
                          {justAdded === gadget.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}

        {/* Phone grid */}
        {activeCatalog === "phone" &&
          (filtered.length === 0 ? (
          <div className="text-center py-20">
            <Inbox
              className="w-10 h-10 mx-auto mb-4"
              style={{ color: "var(--ink-soft)" }}
            />
            <p className="font-semibold" style={{ color: "var(--ink)" }}>
              No phones found
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
              Try a different brand or search term
            </p>
          </div>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filtered.map((phone) => {
              const price =
                condition === "uk-used"
                  ? phone.priceUkUsed
                  : phone.priceBrandNew;

              return (
                <motion.div
                  key={phone.id}
                  variants={cardVariants}
                  whileHover={phone.inStock ? { y: -4 } : undefined}
                  onClick={() =>
                    phone.inStock &&
                    router.push(`/buy/${phone.id}?condition=${condition}`)
                  }
                  className={`rounded-2xl overflow-hidden border group transition-shadow duration-200 ${
                    phone.inStock ? "cursor-pointer hover:shadow-lg" : "cursor-not-allowed opacity-50"
                  }`}
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  {/* Image area */}
                  <div
                    className="relative flex items-center justify-center p-4"
                    style={{ background: "var(--border)", height: 160 }}
                  >
                    {!phone.inStock && (
                      <span
                        className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full z-10"
                        style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                      >
                        Out of stock
                      </span>
                    )}
                    {phone.badge && phone.inStock && (
                      <span
                        className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: phone.badge.includes("Hot")
                            ? "var(--accent-soft)"
                            : "var(--border)",
                          color: phone.badge.includes("Hot")
                            ? "var(--accent)"
                            : "var(--ink-soft)",
                        }}
                      >
                        {phone.badge}
                      </span>
                    )}
                    <span
                      className="absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          condition === "uk-used"
                            ? "var(--border)"
                            : "var(--accent-soft)",
                        color: accentTextColor,
                      }}
                    >
                      {condition === "uk-used" ? "UK Used" : "Brand New"}
                    </span>

                    <img
                      src={phone.image}
                      alt={phone.name}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK;
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p
                      className="font-semibold text-xs leading-snug mb-0.5 line-clamp-2"
                      style={{ color: "var(--ink)" }}
                    >
                      {phone.name}
                    </p>
                    <p
                      className="text-[10px] mb-2"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {phone.storage?.[0]}
                      {phone.ram ? ` · ${phone.ram}` : ""}
                    </p>

                    <div className="flex items-center justify-between gap-1.5">
                      <p
                        className="font-bold text-sm"
                        style={{ color: accentTextColor }}
                      >
                        {formatPrice(price)}
                      </p>
                      <button
                        onClick={(e) => phone.inStock && handleQuickAdd(e, phone.id, "phone")}
                        disabled={!phone.inStock}
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                        style={{
                          background: justAdded === phone.id ? "#16a34a" : "var(--accent-soft)",
                          color: justAdded === phone.id ? "#fff" : "var(--accent)",
                          cursor: phone.inStock ? "pointer" : "not-allowed",
                        }}
                        aria-label={`Add ${phone.name} to cart`}
                      >
                        {justAdded === phone.id ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <ShoppingCart className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Storage chips */}
                    <div className="flex gap-1 flex-wrap mt-2">
                      {(phone.storage ?? []).slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "var(--border)",
                            color: "var(--ink-soft)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {(phone.storage?.length ?? 0) > 3 && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "var(--border)",
                            color: "var(--ink-soft)",
                          }}
                        >
                          +{(phone.storage?.length ?? 0) - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ))}
        </>
        )}
      </div>
    </div>
  );
}
