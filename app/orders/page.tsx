"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Loader2,
  RotateCcw,
  AlertTriangle,
  MessageCircle,
  Truck,
  Store,
  Bike,
  Star,
  Flag,
} from "lucide-react";
import Navbar from "../component/layout/Navbar";
import { apiFetch, apiJson } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/gadget";
import { Skeleton, RowListSkeleton } from "@/app/component/ui/Skeleton";
import { StatusPill, SectionTitle, humanize, formatDate } from "@/app/component/ui/kit";
import type { DeliveryStatus, OrderRequest } from "@/app/types/backend";

const ACCENT = "#C2542D";

type OrderLine = { name: string; unitPrice: number; quantity: number };
type Order = {
  id: string;
  reference: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  fulfillmentStatus?: string;
  amount: number;
  itemName?: string;
  createdAt: string;
  items?: OrderLine[];
};

const ORDER_STEPS = ["new", "in_progress", "completed"] as const;
const ORDER_STEP_LABELS: Record<string, string> = {
  new: "Received",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const DELIVERY_STEPS: Record<"delivery" | "pickup", DeliveryStatus[]> = {
  delivery: ["not_started", "out_for_delivery", "delivered"],
  pickup: ["not_started", "ready_for_pickup", "collected"],
};

function orderTitle(r: OrderRequest) {
  if (r.items?.length) {
    return r.items.length === 1
      ? `${r.items[0].name}${r.items[0].quantity > 1 ? ` × ${r.items[0].quantity}` : ""}`
      : `${r.items.length} items`;
  }
  if (r.listingName) return r.listingName;
  if (r.listing && typeof r.listing === "object" && r.listing.deviceName) return r.listing.deviceName;
  return "Marketplace device";
}

function Progress({ steps, current, labels }: { steps: readonly string[]; current: string; labels: (s: string) => string }) {
  const idx = Math.max(0, steps.indexOf(current));
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className="flex-1 min-w-0">
          <div
            className="h-1.5 rounded-full mb-1"
            style={{ background: i <= idx ? ACCENT : "var(--border)" }}
          />
          <p
            className="text-[10px] truncate"
            style={{ color: i <= idx ? "var(--ink)" : "var(--ink-soft)", fontWeight: i === idx ? 600 : 400 }}
          >
            {labels(s)}
          </p>
        </div>
      ))}
    </div>
  );
}

function WhatsAppOrderCard({ r }: { r: OrderRequest }) {
  const router = useRouter();
  const method = r.delivery?.method ?? r.deliveryMethod ?? "delivery";
  const deliveryStatus = r.delivery?.status ?? "not_started";
  const total = r.totalWithDelivery ?? r.total ?? r.amount;
  const cancelled = r.status === "cancelled";

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
            {orderTitle(r)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
            {formatDate(r.createdAt)}
            {r.reference ? ` · ${r.reference}` : ""}
          </p>
        </div>
        <StatusPill status={r.status} label={ORDER_STEP_LABELS[r.status] ?? humanize(r.status)} />
      </div>

      {!cancelled && (
        <div className="mb-3">
          <Progress steps={ORDER_STEPS} current={r.status} labels={(s) => ORDER_STEP_LABELS[s]} />
        </div>
      )}

      {!cancelled && r.status !== "new" && (
        <div className="rounded-xl p-3 mb-3 space-y-2" style={{ background: "var(--bg)" }}>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--ink)" }}>
            {method === "pickup" ? <Store className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
            {method === "pickup" ? "Pickup" : "Delivery"} · {humanize(deliveryStatus)}
          </p>
          <Progress
            steps={DELIVERY_STEPS[method]}
            current={deliveryStatus}
            labels={(s) => (s === "not_started" ? "Preparing" : humanize(s))}
          />
          {r.delivery?.riderName && (
            <p className="inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--ink-soft)" }}>
              <Bike className="w-3.5 h-3.5" /> Rider: {r.delivery.riderName}
              {r.delivery.riderPhone && (
                <a href={`tel:${r.delivery.riderPhone}`} className="font-semibold no-underline" style={{ color: ACCENT }}>
                  {r.delivery.riderPhone}
                </a>
              )}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          {typeof total === "number" && (
            <p className="text-sm font-bold" style={{ color: ACCENT }}>
              {formatPrice(total)}
            </p>
          )}
          {typeof r.delivery?.fee === "number" && r.delivery.fee > 0 && (
            <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
              incl. {formatPrice(r.delivery.fee)} delivery
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {r.status === "completed" && (
            <>
              <button
                onClick={() => router.push("/reviews")}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: "var(--accent-soft)", color: ACCENT, cursor: "pointer" }}
              >
                <Star className="w-3.5 h-3.5" /> Rate
              </button>
              <button
                onClick={() => router.push(`/disputes/new?type=order_request&id=${r._id ?? r.id}`)}
                className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ border: "1px solid var(--border)", color: "var(--ink-soft)", cursor: "pointer" }}
              >
                <Flag className="w-3.5 h-3.5" /> Report a problem
              </button>
            </>
          )}
          {r.whatsappUrl && !cancelled && (
            <a
              href={r.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg no-underline"
              style={{ background: "#25d366", color: "#fff" }}
            >
              <MessageCircle className="w-3.5 h-3.5" /> Reopen WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login?from=/orders");
      return;
    }
    Promise.all([
      apiJson<{ requests: OrderRequest[] }>("/api/order-requests/mine"),
      apiJson<{ orders: Order[] }>("/api/orders"),
    ])
      .then(([wa, online]) => {
        setRequests(wa.data?.requests ?? []);
        setOrders(online.data?.orders ?? []);
      })
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
      const items: { itemId: string; itemType: "phone" | "gadget"; quantity: number; condition?: "uk-used" | "brand-new" }[] =
        data.data?.items ?? [];
      const unavailable: string[] = data.data?.unavailable ?? [];
      const priceChanges: { name: string }[] = data.data?.priceChanges ?? [];

      items.forEach((line) =>
        addToCart({
          itemId: line.itemId,
          itemType: line.itemType,
          condition: line.condition ?? "uk-used",
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Skeleton className="h-8 w-40 mb-6" />
          <RowListSkeleton count={4} />
        </div>
      </div>
    );
  }

  const empty = orders.length === 0 && requests.length === 0;

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

        {empty ? (
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
          <div className="space-y-8">
            {requests.length > 0 && (
              <section>
                <SectionTitle>Orders through TechNest</SectionTitle>
                <div className="space-y-3">
                  {requests.map((r) => (
                    <WhatsAppOrderCard key={r._id ?? r.id ?? r.reference} r={r} />
                  ))}
                </div>
              </section>
            )}

            {orders.length > 0 && (
              <section>
                <SectionTitle>Paid online</SectionTitle>
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
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {order.status === "paid" && order.fulfillmentStatus && (
                            <StatusPill status={order.fulfillmentStatus} />
                          )}
                          <StatusPill status={order.status} />
                        </div>
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
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
