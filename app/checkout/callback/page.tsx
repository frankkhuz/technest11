"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Navbar from "../../component/layout/Navbar";
import { formatPrice } from "../../data/gadget";
import type { Order } from "../../lib/orders";

const ACCENT = "#C2542D";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!reference);
  const [error, setError] = useState<string | null>(
    reference ? null : "Missing payment reference."
  );

  useEffect(() => {
    if (!reference) return;
    fetch(`/api/checkout/verify?reference=${encodeURIComponent(reference)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data.order);
      })
      .catch(() => setError("Could not verify payment."))
      .finally(() => setLoading(false));
  }, [reference]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" style={{ color: ACCENT }} />
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Confirming your payment...
            </p>
          </>
        ) : error || !order || order.status !== "paid" ? (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#DC2626" }} />
            <p className="text-lg font-bold mb-1" style={{ color: "var(--ink)" }}>
              Payment not confirmed
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
              {error || "We couldn't confirm this payment. If you were charged, contact support."}
            </p>
            <button
              onClick={() => router.push("/buy")}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl"
              style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
            >
              Back to Buy
            </button>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: "#16a34a" }} />
            <p className="text-lg font-bold mb-1" style={{ color: "var(--ink)" }}>
              Payment successful
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
              Your order for {order.itemName} ({formatPrice(order.amount)}) is confirmed. We&apos;ll
              contact you on {order.buyerPhone} to arrange delivery.
            </p>
            <div
              className="rounded-xl p-4 mb-6 text-left"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                Order reference
              </p>
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                {order.reference}
              </p>
            </div>
            <button
              onClick={() => router.push("/buy")}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
              style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <CallbackContent />
    </Suspense>
  );
}
