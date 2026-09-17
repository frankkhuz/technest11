"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Repeat, ShoppingCart, Wallet, ArrowRight, Loader2 } from "lucide-react";
import { formatPrice } from "@/app/lib/helpers";
import { useAuth } from "@/app/hooks/useAuth";
import Navbar from "@/app/component/layout/Navbar";
import TransactionStatusBadge from "@/app/component/transactions/TransactionStatusBadge";
import type { Transaction, TransactionStatus } from "@/app/lib/transactions";

const ACCENT = "#C2542D";

const TYPE_ICON = { buy: ShoppingCart, sell: Wallet, swap: Repeat };

const TABS: { id: TransactionStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "completed", label: "Completed" },
];

export default function TransactionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TransactionStatus | "all">("all");
  const [acting, setActing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/transactions");
      return;
    }
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const updateStatus = async (id: string, status: TransactionStatus) => {
    setActing(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTransactions((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));
      }
    } finally {
      setActing(null);
    }
  };

  const filtered = tab === "all" ? transactions : transactions.filter((t) => t.status === tab);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
        >
          My Transactions
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          Buy requests, swap offers, and sales — all in one place.
        </p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-0.5">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap flex-shrink-0"
              style={{
                background: tab === id ? ACCENT : "var(--surface)",
                color: tab === id ? "#fff" : "var(--ink)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: "var(--ink-soft)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              No transactions here yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => {
              const Icon = TYPE_ICON[t.type];
              const isSeller = t.sellerId === user?.id;
              return (
                <div
                  key={t.id}
                  className="rounded-2xl p-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--accent-soft)", color: ACCENT }}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                          {t.listingDeviceName} {t.listingStorage}
                        </p>
                        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                          {t.type === "swap"
                            ? `Swap offer from ${isSeller ? t.buyerName : "you"}`
                            : isSeller
                            ? `${t.buyerName} wants to buy this`
                            : `Requested from ${t.sellerName}`}
                        </p>
                      </div>
                    </div>
                    <TransactionStatusBadge status={t.status} />
                  </div>

                  {t.swapDetails && (
                    <div
                      className="rounded-xl p-3 mb-3 text-xs flex items-center justify-between"
                      style={{ background: "var(--bg)" }}
                    >
                      <span style={{ color: "var(--ink-soft)" }}>
                        Offering {t.swapDetails.offeredDeviceName} {t.swapDetails.offeredStorage} (
                        {formatPrice(t.swapDetails.offeredValuation)})
                      </span>
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            t.swapDetails.direction === "pay_extra"
                              ? "#DC2626"
                              : t.swapDetails.direction === "refund"
                              ? "#16a34a"
                              : "var(--ink)",
                        }}
                      >
                        {t.swapDetails.direction === "even"
                          ? "Even"
                          : `${t.swapDetails.direction === "pay_extra" ? "+" : "-"}${formatPrice(
                              Math.abs(t.swapDetails.priceDifference)
                            )}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {t.status === "pending" && isSeller && (
                      <>
                        <button
                          onClick={() => updateStatus(t.id, "accepted")}
                          disabled={acting === t.id}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
                          style={{ background: ACCENT, color: "#fff", cursor: "pointer" }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(t.id, "cancelled")}
                          disabled={acting === t.id}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
                          style={{ border: "1px solid var(--border)", color: "var(--ink)", cursor: "pointer" }}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {t.status === "accepted" && (
                      <>
                        <button
                          onClick={() => updateStatus(t.id, "completed")}
                          disabled={acting === t.id}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40 inline-flex items-center gap-1"
                          style={{ background: "#16a34a", color: "#fff", cursor: "pointer" }}
                        >
                          Mark Completed <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => updateStatus(t.id, "cancelled")}
                          disabled={acting === t.id}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
                          style={{ border: "1px solid var(--border)", color: "var(--ink)", cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
