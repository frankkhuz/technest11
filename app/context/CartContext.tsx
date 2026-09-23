"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { phones, gadgets, formatPrice, type PhoneCondition } from "../data/gadget";

export type CartItemType = "phone" | "gadget";

export type CartLine = {
  itemId: string;
  itemType: CartItemType;
  condition: PhoneCondition;
  quantity: number;
};

export type ResolvedCartLine = CartLine & {
  name: string;
  spec?: string;
  unitPrice: number;
  lineTotal: number;
};

const STORAGE_KEY = "technest_cart";

function readStoredCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredCart(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // localStorage unavailable (private window, blocked storage) — cart just
    // won't persist across reloads, which is acceptable degradation.
  }
}

function lookupCatalogItem(itemId: string, itemType: CartItemType) {
  if (itemType === "phone") {
    const phone = phones.find((p) => p.id === itemId);
    if (!phone) return null;
    return { name: phone.name, spec: phone.storage?.[0], priceUkUsed: phone.priceUkUsed, priceBrandNew: phone.priceBrandNew };
  }
  const gadget = gadgets.find((g) => g.id === itemId);
  if (!gadget) return null;
  return { name: gadget.name, spec: gadget.spec, priceUkUsed: gadget.priceUkUsed, priceBrandNew: gadget.priceBrandNew };
}

type CartContextValue = {
  lines: CartLine[];
  resolvedLines: ResolvedCartLine[];
  itemCount: number;
  subtotal: number;
  addToCart: (line: CartLine) => void;
  setCartToSingleItem: (line: CartLine) => void;
  updateQuantity: (itemId: string, condition: PhoneCondition, quantity: number) => void;
  removeFromCart: (itemId: string, condition: PhoneCondition) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readStoredCart());

  const persist = (next: CartLine[]) => {
    setLines(next);
    writeStoredCart(next);
  };

  const addToCart = (line: CartLine) => {
    setLines((prev) => {
      const existing = prev.find(
        (l) => l.itemId === line.itemId && l.condition === line.condition
      );
      const next = existing
        ? prev.map((l) =>
            l.itemId === line.itemId && l.condition === line.condition
              ? { ...l, quantity: l.quantity + line.quantity }
              : l
          )
        : [...prev, line];
      writeStoredCart(next);
      return next;
    });
  };

  const setCartToSingleItem = (line: CartLine) => {
    const next = [line];
    persist(next);
  };

  const updateQuantity = (itemId: string, condition: PhoneCondition, quantity: number) => {
    setLines((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((l) => !(l.itemId === itemId && l.condition === condition))
          : prev.map((l) =>
              l.itemId === itemId && l.condition === condition ? { ...l, quantity } : l
            );
      writeStoredCart(next);
      return next;
    });
  };

  const removeFromCart = (itemId: string, condition: PhoneCondition) => {
    setLines((prev) => {
      const next = prev.filter((l) => !(l.itemId === itemId && l.condition === condition));
      writeStoredCart(next);
      return next;
    });
  };

  const clearCart = () => persist([]);

  const resolvedLines = useMemo<ResolvedCartLine[]>(() => {
    return lines
      .map((line): ResolvedCartLine | null => {
        const item = lookupCatalogItem(line.itemId, line.itemType);
        if (!item) return null;
        const unitPrice = line.condition === "uk-used" ? item.priceUkUsed : item.priceBrandNew;
        return {
          ...line,
          name: item.name,
          spec: item.spec,
          unitPrice,
          lineTotal: unitPrice * line.quantity,
        };
      })
      .filter((l): l is ResolvedCartLine => l !== null);
  }, [lines]);

  const itemCount = resolvedLines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = resolvedLines.reduce((sum, l) => sum + l.lineTotal, 0);

  return (
    <CartContext.Provider
      value={{
        lines,
        resolvedLines,
        itemCount,
        subtotal,
        addToCart,
        setCartToSingleItem,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export { formatPrice };
