"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ShoppingCart } from "lucide-react";
import Navbar from "../component/layout/Navbar";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/gadget";

const ACCENT = "#C2542D";

export default function CartPage() {
  const router = useRouter();
  const { resolvedLines, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.push("/buy")}
          className="inline-flex items-center gap-1.5 text-sm mb-6"
          style={{ color: "var(--ink-soft)", cursor: "pointer" }}
        >
          <ArrowLeft className="w-4 h-4" /> Continue browsing
        </button>

        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          Your Cart
        </h1>

        {resolvedLines.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingCart className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--ink-soft)" }} />
            <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Your cart is empty
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
              Add a phone, a charger, a mouse — whatever you need — and check out once.
            </p>
            <button
              onClick={() => router.push("/buy")}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl"
              style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
            >
              Browse the catalog
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {resolvedLines.map((line) => (
                <div
                  key={`${line.itemId}-${line.condition}`}
                  className="flex items-center gap-3 rounded-2xl p-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                      {line.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                      {line.condition === "uk-used" ? "UK Used" : "Brand New"}
                      {line.spec ? ` · ${line.spec}` : ""}
                    </p>
                    <p className="text-sm font-bold mt-1" style={{ color: ACCENT }}>
                      {formatPrice(line.unitPrice)}
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-1 rounded-lg flex-shrink-0"
                    style={{ background: "var(--border)" }}
                  >
                    <button
                      onClick={() => updateQuantity(line.itemId, line.condition, line.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center"
                      style={{ color: "var(--ink)", cursor: "pointer" }}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold" style={{ color: "var(--ink)" }}>
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(line.itemId, line.condition, line.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center"
                      style={{ color: "var(--ink)", cursor: "pointer" }}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(line.itemId, line.condition)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ color: "#DC2626", cursor: "pointer" }}
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                  Subtotal
                </span>
                <span className="text-xl font-bold" style={{ color: ACCENT }}>
                  {formatPrice(subtotal)}
                </span>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
                style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
              >
                <ShoppingBag className="w-4 h-4" /> Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
