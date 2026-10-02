"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import Navbar from "../component/layout/Navbar";
import { apiFetch } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/gadget";

const ACCENT = "#C2542D";

type OrderLine = { name: string; unitPrice: number; quantity: number };
type Order = {
  id: string;
  reference: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  amount: number;
  itemName?: string;
  createdAt: string;
  items?: OrderLine[];
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login?from=/orders");
      return;
    }
    apiFetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.data?.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [authLoading, user, router]);

  const orderAgain = async (orderId: string) => {
    setReordering(orderId);
    setNotice(null);
    try {
      const res = await apiFetch(`/api/orders/${orderId}/buy-again`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice(data.message || "Could not reorder this.");
        return;
      }
      const items: { itemId: string; itemType: "phone" | "gadget"; quantity: number }[] =
        data.data?.items ?? [];
      const unavailable: string[] = data.data?.unavailable ?? [];
      const priceChanges: { name: string }[] = data.data?.priceChanges ?? [];

      items.forEach((line) =>
        addToCart({
          itemId: line.itemId,
          itemType: line.itemType,
          condition: "uk-used",
          quantity: line.quantity,
        })
      );

      const notices: string[] = [];
      if (unavailable.length) notices.push(`${unavailable.length} item(s) no longer available.`);
      if (priceChanges.length) notices.push(`Prices changed for ${priceChanges.length} item(s).`);

      if (items.length === 0) {
        setNotice("None of these items are available anymore.");
        return;
      }
      if (notices.length) setNotice(notices.join(" "));
      router.push("/checkout");
    } catch {
      setNotice("Network error — please try again.");
    } finally {
      setReordering(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="text-center py-24">
          <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: "var(--ink-soft)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          My Orders
        </h1>

        {notice && (
          <div
            className="rounded-xl p-3 mb-4 text-xs flex items-start gap-2"
            style={{ background: "var(--accent-soft)", color: "var(--ink)" }}
          >
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
            {notice}
          </div>
        )}

        {orders.length === 0 ? (
          <div
            className="text-center py-24 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <Package className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--ink-soft)" }} />
            <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>
              No orders yet
            </p>
            <button
              onClick={() => router.push("/buy")}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl mt-3"
              style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
            >
              Browse the catalog
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl p-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                      {order.itemName ?? `${order.items?.length ?? 1} item(s)`}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
                      {new Date(order.createdAt).toLocaleDateString()} · {order.reference}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                    style={{
                      background:
                        order.status === "paid" ? "rgba(22,163,74,0.1)" : "var(--border)",
                      color: order.status === "paid" ? "#16a34a" : "var(--ink-soft)",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: ACCENT }}>
                    {formatPrice(order.amount)}
                  </p>
                  {order.status === "paid" && (
                    <button
                      onClick={() => orderAgain(order.id)}
                      disabled={reordering === order.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50"
                      style={{ background: "var(--accent-soft)", color: ACCENT, cursor: "pointer" }}
                    >
                      {reordering === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      Order again
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
