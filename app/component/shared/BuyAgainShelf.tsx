"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw, ShoppingCart, Check } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import { useCart } from "@/app/context/CartContext";
import { formatPrice } from "@/app/data/gadget";
import type { Product } from "@/app/lib/products";

const ACCENT = "#C2542D";

type BuyAgainItem = {
  product: Product;
  currentPrice: number;
  available: boolean;
  lastBoughtAt: string;
  timesBought: number;
};

export default function BuyAgainShelf() {
  const [items, setItems] = useState<BuyAgainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    apiFetch("/api/orders/buy-again")
      .then((r) => r.json())
      .then((d) => setItems(d.data?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <RotateCcw className="w-4 h-4" style={{ color: ACCENT }} />
        <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>
          Buy Again
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex-shrink-0 w-44 rounded-xl p-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <Link href={`/buy/${item.product.id}`} className="no-underline">
              <p className="text-xs font-semibold line-clamp-2 mb-1" style={{ color: "var(--ink)" }}>
                {item.product.name}
              </p>
            </Link>
            <p className="text-sm font-bold mb-0.5" style={{ color: ACCENT }}>
              {formatPrice(item.currentPrice)}
            </p>
            <p className="text-[10px] mb-2" style={{ color: "var(--ink-soft)" }}>
              Bought {item.timesBought > 1 ? `${item.timesBought}× · ` : ""}
              {new Date(item.lastBoughtAt).toLocaleDateString()}
            </p>
            <button
              onClick={() => {
                if (!item.available) return;
                addToCart({
                  itemId: item.product.id,
                  itemType: item.product.type,
                  condition: "uk-used",
                  quantity: 1,
                });
                setJustAdded(item.product.id);
                setTimeout(() => setJustAdded((cur) => (cur === item.product.id ? null : cur)), 1200);
              }}
              disabled={!item.available}
              className="w-full text-xs font-semibold py-1.5 rounded-lg inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
              style={{
                background: justAdded === item.product.id ? "#16a34a" : "var(--accent-soft)",
                color: justAdded === item.product.id ? "#fff" : ACCENT,
                cursor: item.available ? "pointer" : "not-allowed",
              }}
            >
              {!item.available ? (
                "Out of stock"
              ) : justAdded === item.product.id ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" /> Add to cart
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
