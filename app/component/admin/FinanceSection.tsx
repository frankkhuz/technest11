"use client";

import { useCallback, useEffect, useState } from "react";
import { Landmark, CheckCircle2 } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import { Notice, Button, SectionTitle, humanize, fieldStyle } from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";
import { SectionBody, Stat, adminInput } from "./shared";

type Bucket = { count?: number; sales?: number; revenue?: number };
type Payout = {
  orderRequestId?: string;
  id?: string;
  _id?: string;
  reference?: string;
  deviceName?: string;
  sellerName?: string;
  seller?: { name?: string; email?: string };
  amount?: number;
  onHold?: boolean;
  completedAt?: string;
};
type Commission = {
  requestId?: string;
  id?: string;
  _id?: string;
  reference?: string;
  deviceName?: string;
  vendorName?: string;
  vendor?: { name?: string; email?: string };
  commission?: number;
  amount?: number;
};
type Finance = {
  from: string;
  to: string;
  totals: Bucket;
  byChannel?: Record<string, Bucket> | ({ channel: string } & Bucket)[];
  byMonth?: Record<string, Bucket> | ({ month: string } & Bucket)[];
  outstanding?: {
    owedToSellers?: number;
    owedByVendors?: number;
    payoutsOnHold?: number;
    sellerPayouts?: Payout[];
    vendorCommissions?: Commission[];
  };
};

function rows(x: Finance["byChannel"] | Finance["byMonth"], key: "channel" | "month") {
  if (!x) return [];
  if (Array.isArray(x)) return x.map((r) => ({ name: String((r as Record<string, unknown>)[key]), ...r }));
  return Object.entries(x).map(([name, b]) => ({ name, ...b }));
}

const monthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};
const today = () => new Date().toISOString().slice(0, 10);

function Breakdown({ title, data }: { title: string; data: { name: string; count?: number; sales?: number; revenue?: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(1, ...data.map((d) => d.sales ?? 0));
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <SectionTitle>{title}</SectionTitle>
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="capitalize" style={{ color: "var(--ink)" }}>
                {humanize(d.name)} <span style={{ color: "var(--ink-soft)" }}>· {d.count ?? 0}</span>
              </span>
              <span style={{ color: "var(--ink-soft)" }}>
                {formatPrice(d.sales ?? 0)} · <strong style={{ color: "#16a34a" }}>{formatPrice(d.revenue ?? 0)}</strong>
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
              <div className="h-1.5 rounded-full" style={{ width: `${((d.sales ?? 0) / max) * 100}%`, background: "var(--accent)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FinanceSection() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [data, setData] = useState<Finance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiJson<Finance>(`/api/admin/finance?from=${from}&to=${to}`);
    setError(r.ok ? null : r.message);
    setData(r.data);
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const markPaid = async (kind: "payouts" | "commissions", id: string) => {
    const reference = window.prompt(
      kind === "payouts" ? "Transfer reference for the seller payout (optional):" : "Payment reference from the vendor (optional):"
    );
    if (reference === null) return;
    setBusy(id);
    const r = await apiJson(`/api/admin/finance/${kind}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ reference: reference.trim() || undefined }),
    });
    setBusy(null);
    if (!r.ok) return setError(r.message);
    load();
  };

  const o = data?.outstanding;

  return (
    <SectionBody>
      <div className="flex items-end gap-2 flex-wrap mb-5">
        <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${adminInput} block mt-1`} style={fieldStyle} />
        </label>
        <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`${adminInput} block mt-1`} style={fieldStyle} />
        </label>
      </div>

      {error && (
        <div className="mb-4">
          <Notice tone="red">{error}</Notice>
        </div>
      )}

      {loading && !data ? (
        <RowListSkeleton count={4} />
      ) : data ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat label="Deals" value={data.totals.count ?? 0} />
            <Stat label="Sales" value={formatPrice(data.totals.sales ?? 0)} />
            <Stat label="TechNest earnings" value={formatPrice(data.totals.revenue ?? 0)} tone="#16a34a" />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Breakdown title="By channel" data={rows(data.byChannel, "channel")} />
            <Breakdown title="By month" data={rows(data.byMonth, "month")} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="Owed to sellers" value={formatPrice(o?.owedToSellers ?? 0)} tone="#DC2626" />
            <Stat label="Owed by vendors" value={formatPrice(o?.owedByVendors ?? 0)} tone="#d97706" />
            <Stat label="Payouts on hold (disputes)" value={formatPrice(o?.payoutsOnHold ?? 0)} />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <SectionTitle>Seller payouts to send</SectionTitle>
              {!o?.sellerPayouts?.length ? (
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  Nothing owed to sellers.
                </p>
              ) : (
                <div className="space-y-2">
                  {o.sellerPayouts.map((p) => {
                    const id = p.orderRequestId ?? p.id ?? p._id ?? "";
                    return (
                      <div key={id} className="rounded-xl p-3 flex items-center justify-between gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                            {p.sellerName ?? p.seller?.name ?? "Seller"} · {formatPrice(p.amount ?? 0)}
                          </p>
                          <p className="text-xs truncate" style={{ color: "var(--ink-soft)" }}>
                            {p.reference} {p.deviceName ? `· ${p.deviceName}` : ""} {p.seller?.email ? `· ${p.seller.email}` : ""}
                          </p>
                        </div>
                        {p.onHold ? (
                          <span className="text-[11px] font-semibold" style={{ color: "#d97706" }}>
                            On hold
                          </span>
                        ) : (
                          <Button size="sm" Icon={CheckCircle2} onClick={() => markPaid("payouts", id)} loading={busy === id}>
                            Mark paid
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <SectionTitle>Vendor commission to collect</SectionTitle>
              {!o?.vendorCommissions?.length ? (
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  No commission outstanding.
                </p>
              ) : (
                <div className="space-y-2">
                  {o.vendorCommissions.map((c) => {
                    const id = c.requestId ?? c.id ?? c._id ?? "";
                    return (
                      <div key={id} className="rounded-xl p-3 flex items-center justify-between gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                            {c.vendorName ?? c.vendor?.name ?? "Vendor"} · {formatPrice(c.commission ?? c.amount ?? 0)}
                          </p>
                          <p className="text-xs truncate" style={{ color: "var(--ink-soft)" }}>
                            {c.reference} {c.deviceName ? `· ${c.deviceName}` : ""}
                          </p>
                        </div>
                        <Button size="sm" Icon={Landmark} onClick={() => markPaid("commissions", id)} loading={busy === id}>
                          Mark collected
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </SectionBody>
  );
}
