"use client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
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
  type LucideIcon,
} from "lucide-react";
import Navbar from "../component/layout/Navbar";
import SectionBackground from "@/app/component/home/SectionBackground";
import { useTheme } from "@/app/hooks/useTheme";
import { useCart } from "@/app/context/CartContext";
import {
  phones,
  brands,
  gadgets,
  gadgetCategories,
  formatPrice,
} from "../data/gadget";
import type { PhoneCondition, GadgetCategoryKey } from "../data/gadget";

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

export default function BuyPage() {
  const router = useRouter();
  const { dark } = useTheme();

  const [step, setStep] = useState<Step>("condition");
  const [condition, setCondition] = useState<PhoneCondition | null>(null);
  const [activeCatalog, setActiveCatalog] = useState<CatalogTab>("phone");
  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [storageFilter, setStorageFilter] = useState<string>("all");
  const [colorFilter, setColorFilter] = useState<string>("all");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const { addToCart } = useCart();

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
      .forEach((p) => p.storage.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [activeBrand]);

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    phones
      .filter((p) => activeBrand === "all" || p.brand === activeBrand)
      .forEach((p) => p.color?.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [activeBrand]);

  const filteredPhones = useMemo(() => {
    const list = phones.filter((p) => {
      const brandMatch = activeBrand === "all" || p.brand === activeBrand;
      const storageMatch =
        storageFilter === "all" || p.storage.includes(storageFilter);
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
  }, [activeBrand, storageFilter, colorFilter, searchQuery, sortBy, condition]);

  const filteredGadgets = useMemo(() => {
    if (activeCatalog === "phone") return [];
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
  }, [activeCatalog, searchQuery, sortBy, condition]);

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

          <div className="grid sm:grid-cols-2 gap-5 max-w-xl mx-auto">
            {/* UK Used card */}
            <button
              onClick={() => {
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
        <div className="relative mb-5">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--ink-soft)" }}
          />
          <input
            type="text"
            placeholder={`Search ${
              activeCatalog === "phone"
                ? "phones"
                : CATALOG_TABS.find((t) => t.id === activeCatalog)?.label.toLowerCase()
            }...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--ink)",
            }}
          />
        </div>

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
        <p className="text-xs mb-5" style={{ color: "var(--ink-soft)" }}>
          {activeCatalog === "phone" ? filtered.length : filteredGadgets.length}{" "}
          device
          {(activeCatalog === "phone" ? filtered.length : filteredGadgets.length) !==
          1
            ? "s"
            : ""}{" "}
          found
        </p>

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGadgets.map((gadget) => {
                const price =
                  condition === "uk-used"
                    ? gadget.priceUkUsed
                    : gadget.priceBrandNew;
                const GadgetIcon = CATEGORY_ICONS[gadget.gadgetCategory];

                return (
                  <div
                    key={gadget.id}
                    onClick={() =>
                      router.push(`/buy/${gadget.id}?condition=${condition}`)
                    }
                    className="rounded-2xl overflow-hidden border group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    {/* Icon tile — stands in for a product photo */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{ background: "var(--accent-soft)", height: 160 }}
                    >
                      {gadget.badge && (
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
                          onClick={(e) => handleQuickAdd(e, gadget.id, "gadget")}
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{
                            background: justAdded === gadget.id ? "#16a34a" : "var(--accent-soft)",
                            color: justAdded === gadget.id ? "#fff" : "var(--accent)",
                            cursor: "pointer",
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
                  </div>
                );
              })}
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((phone) => {
              const price =
                condition === "uk-used"
                  ? phone.priceUkUsed
                  : phone.priceBrandNew;

              return (
                <div
                  key={phone.id}
                  onClick={() =>
                    router.push(`/buy/${phone.id}?condition=${condition}`)
                  }
                  className="rounded-2xl overflow-hidden border group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  {/* Image area */}
                  <div
                    className="relative flex items-center justify-center p-4"
                    style={{ background: "var(--border)", height: 160 }}
                  >
                    {phone.badge && (
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
                      {phone.storage[0]}
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
                        onClick={(e) => handleQuickAdd(e, phone.id, "phone")}
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          background: justAdded === phone.id ? "#16a34a" : "var(--accent-soft)",
                          color: justAdded === phone.id ? "#fff" : "var(--accent)",
                          cursor: "pointer",
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
                      {phone.storage.slice(0, 3).map((s) => (
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
                      {phone.storage.length > 3 && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "var(--border)",
                            color: "var(--ink-soft)",
                          }}
                        >
                          +{phone.storage.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
