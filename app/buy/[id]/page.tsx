"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Check,
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
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import Navbar from "../../component/layout/Navbar";
import { phones, gadgets, formatPrice, type GadgetCategoryKey } from "../../data/gadget";
import { useCart } from "../../context/CartContext";

const ACCENT = "#C2542D";

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23F0F0F8'/%3E%3Crect x='72' y='24' width='56' height='104' rx='10' fill='%23C8C8E0'/%3E%3Ccircle cx='100' cy='148' r='7' fill='%23C8C8E0'/%3E%3C/svg%3E";

const CATEGORY_ICONS: Record<GadgetCategoryKey, LucideIcon> = {
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

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const phone = phones.find((p) => p.id === params.id);
  const gadget = !phone ? gadgets.find((g) => g.id === params.id) : undefined;

  const initialCondition = searchParams.get("condition") === "brand-new" ? "brand-new" : "uk-used";
  const [condition, setCondition] = useState<"uk-used" | "brand-new">(initialCondition);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart, setCartToSingleItem } = useCart();

  if (!phone && !gadget) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: "var(--ink)" }}>
            We couldn&apos;t find that item
          </p>
          <button
            onClick={() => router.push("/buy")}
            className="text-sm font-semibold"
            style={{ color: ACCENT, cursor: "pointer" }}
          >
            ← Back to Buy
          </button>
        </div>
      </div>
    );
  }

  const item = phone ?? gadget!;
  const price = condition === "uk-used" ? item.priceUkUsed : item.priceBrandNew;
  const GadgetIcon = gadget ? CATEGORY_ICONS[gadget.gadgetCategory] : Smartphone;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm mb-6"
          style={{ color: "var(--ink-soft)", cursor: "pointer" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image / icon */}
          <div
            className="rounded-2xl flex items-center justify-center p-8"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", minHeight: 320 }}
          >
            {phone ? (
              <img
                src={imgError ? FALLBACK : phone.image}
                alt={phone.name}
                onError={() => setImgError(true)}
                className="max-h-64 object-contain"
              />
            ) : (
              <GadgetIcon className="w-28 h-28" style={{ color: ACCENT }} strokeWidth={1.25} />
            )}
          </div>

          {/* Details */}
          <div>
            {item.badge && (
              <span
                className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                style={{ background: "var(--accent-soft)", color: ACCENT }}
              >
                {item.badge}
              </span>
            )}
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
            >
              {item.name}
            </h1>
            <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
              {phone ? `${phone.brand} · ${phone.ram ?? ""}`.trim() : `${gadget!.brand}${gadget!.spec ? ` · ${gadget!.spec}` : ""}`}
            </p>

            {/* Condition toggle */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                onClick={() => setCondition("uk-used")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2"
                style={{
                  borderColor: condition === "uk-used" ? ACCENT : "var(--border)",
                  background: condition === "uk-used" ? "var(--accent-soft)" : "var(--surface)",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                <MapPin className="w-4 h-4" /> UK Used
              </button>
              <button
                onClick={() => setCondition("brand-new")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2"
                style={{
                  borderColor: condition === "brand-new" ? ACCENT : "var(--border)",
                  background: condition === "brand-new" ? "var(--accent-soft)" : "var(--surface)",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                <Sparkles className="w-4 h-4" /> Brand New
              </button>
            </div>

            <p className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
              {formatPrice(price)}
            </p>
            <p className="text-xs mb-6" style={{ color: "var(--ink-soft)" }}>
              {condition === "uk-used" ? "Fairly used, tested & verified" : "Sealed box, full warranty"}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => {
                  addToCart({ itemId: item.id, itemType: phone ? "phone" : "gadget", condition, quantity: 1 });
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1500);
                }}
                className="py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
                style={{
                  background: "var(--accent-soft)",
                  color: ACCENT,
                  cursor: "pointer",
                  border: `1.5px solid ${ACCENT}`,
                }}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                {added ? "Added" : "Add to Cart"}
              </button>
              <button
                onClick={() => {
                  setCartToSingleItem({ itemId: item.id, itemType: phone ? "phone" : "gadget", condition, quantity: 1 });
                  router.push("/checkout");
                }}
                className="py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
                style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
              >
                <ShoppingBag className="w-4 h-4" /> Buy Now
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4" style={{ color: "var(--ink-soft)" }} />
                <span className="text-[10px]" style={{ color: "var(--ink-soft)" }}>
                  Verified
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4" style={{ color: "var(--ink-soft)" }} />
                <span className="text-[10px]" style={{ color: "var(--ink-soft)" }}>
                  Fast delivery
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4" style={{ color: "var(--ink-soft)" }} />
                <span className="text-[10px]" style={{ color: "var(--ink-soft)" }}>
                  Easy returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
