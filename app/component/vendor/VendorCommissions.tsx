"use client";

import { useEffect, useState } from "react";
import { Percent } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import { Card, EmptyState, Notice, StatusPill, formatDate } from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

type CommissionRow = {
  id: string;
  reference?: string;
  deviceName: string;
  finalPrice: number;
  commission: number;
  commissionStatus: string;
  completedAt?: string;
};

type Commissions = { owed: number; paid: number; requests: CommissionRow[] };

export default function VendorCommissions() {
  const [data, setData] = useState<Commissions | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiJson<Commissions>("/api/vendor/commissions").then((r) => {
      if (r.ok) setData(r.data);
      else setError(r.message);
    });
  }, []);

  if (error) return <Notice tone="red">{error}</Notice>;
  if (!data) return <RowListSkeleton count={3} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs mb-1" style={{ color: "var(--ink-soft)" }}>
            You owe TechNest
          </p>
          <p className="text-2xl font-bold" style={{ color: data.owed > 0 ? "#DC2626" : "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
            {formatPrice(data.owed)}
          </p>
        </Card>
        <Card>
          <p className="text-xs mb-1" style={{ color: "var(--ink-soft)" }}>
            Paid so far
          </p>
          <p className="text-2xl font-bold" style={{ color: "#16a34a", fontFamily: "Space Grotesk, sans-serif" }}>
            {formatPrice(data.paid)}
          </p>
        </Card>
      </div>
      {data.owed > 0 && (
        <Notice tone="amber">
          Settle commission with TechNest on WhatsApp — you&apos;ll get a receipt notification once it&apos;s recorded.
        </Notice>
      )}
      {data.requests.length === 0 ? (
        <EmptyState Icon={Percent} title="No commission yet" body="When you complete a customer request, TechNest's share shows here." />
      ) : (
        <div className="space-y-2">
          {data.requests.map((r) => (
            <div
              key={r.id}
              className="rounded-xl p-3.5 flex items-center justify-between gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                  {r.deviceName}
                </p>
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  {r.reference ? `${r.reference} · ` : ""}
                  {formatDate(r.completedAt)} · deal {formatPrice(r.finalPrice)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                  {formatPrice(r.commission)}
                </p>
                <StatusPill status={r.commissionStatus === "paid" ? "paid" : "pending"} label={r.commissionStatus === "paid" ? "Paid" : "Owed"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
