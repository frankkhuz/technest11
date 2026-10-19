"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Package, Truck, Store, Save } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import type { DeliveryStatus, OrderRequest, OrderRequestStatus } from "@/app/types/backend";
import { StatusPill, Button, ErrorText, humanize, formatDateTime } from "@/app/component/ui/kit";
import { SectionBody, FilterChips, SearchBox, ListState, RefreshButton, adminInput, promptNumber } from "./shared";

const STATUSES = ["new", "in_progress", "completed", "cancelled"] as const;
const DELIVERY: DeliveryStatus[] = ["not_started", "ready_for_pickup", "out_for_delivery", "delivered", "collected"];

const idOf = (r: OrderRequest) => r._id ?? r.id ?? "";

function OrderCard({ r, onSaved }: { r: OrderRequest; onSaved: (r: OrderRequest) => void }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(r.adminNotes ?? "");
  const [fee, setFee] = useState(r.delivery?.fee !== undefined ? String(r.delivery.fee) : "");
  const [dStatus, setDStatus] = useState<DeliveryStatus>(r.delivery?.status ?? "not_started");
  const [rider, setRider] = useState(r.delivery?.riderName ?? "");
  const [riderPhone, setRiderPhone] = useState(r.delivery?.riderPhone ?? "");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patch = async (key: string, body: Record<string, unknown>) => {
    setSaving(key);
    setError(null);
    const res = await apiJson<{ request: OrderRequest }>(`/api/admin/order-requests/${idOf(r)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setSaving(null);
    if (!res.ok) return setError(res.message);
    onSaved(res.data?.request ?? { ...r, ...body } as OrderRequest);
  };

  const move = (status: OrderRequestStatus) => {
    if (status === "completed") {
      const total = r.total ?? r.amount;
      const finalPrice = promptNumber("Final price the buyer paid (₦):", total);
      if (finalPrice === null) return;
      const commission = promptNumber("TechNest's commission on this (₦) — leave blank for catalog orders:", undefined);
      if (commission === null) return;
      return patch(status, { status, finalPrice, commission, adminNotes: notes || undefined });
    }
    if (status === "cancelled" && !window.confirm("Cancel this order? Any listing hold is released.")) return;
    patch(status, { status, adminNotes: notes || undefined });
  };

  const method = r.delivery?.method ?? r.deliveryMethod ?? "delivery";
  const items = r.items?.length
    ? r.items.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ")
    : r.listingName ?? (typeof r.listing === "object" && r.listing?.deviceName) ?? "Marketplace listing";

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            {items}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
            {r.reference} · {r.buyerName ?? r.buyer?.name} · {r.buyerPhone} {r.buyerEmail ? `· ${r.buyerEmail}` : ""}
          </p>
          <p className="text-xs mt-0.5 inline-flex items-center gap-1" style={{ color: "var(--ink-soft)" }}>
            {method === "pickup" ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
            {method === "pickup" ? "Pickup" : `Delivery · ${[r.deliveryAddress ?? r.delivery?.address, r.city ?? r.delivery?.city, r.state].filter(Boolean).join(", ")}`}
          </p>
          {r.note && (
            <p className="text-xs mt-1" style={{ color: "var(--ink)" }}>
              “{r.note}”
            </p>
          )}
          {typeof r.listing === "object" && r.listing?.status && (
            <p className="text-[11px] mt-1" style={{ color: "var(--ink-soft)" }}>
              Listing: {humanize(r.listing.status)}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <StatusPill status={r.status} />
          <p className="text-sm font-bold mt-1" style={{ color: "var(--accent)" }}>
            {formatPrice(r.totalWithDelivery ?? r.total ?? r.amount ?? 0)}
          </p>
          <p className="text-[10px]" style={{ color: "var(--ink-soft)" }}>
            {formatDateTime(r.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {r.whatsappUrl && (
          <a
            href={r.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg no-underline"
            style={{ background: "#25d366", color: "#fff" }}
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
        )}
        {(r.status === "new" || r.status === "in_progress") && (
          <>
            <Button variant="soft" onClick={() => move("in_progress")} loading={saving === "in_progress"} size="sm">
              {r.status === "in_progress" ? "Extend 48h hold" : "In progress (hold 48h)"}
            </Button>
            <Button onClick={() => move("completed")} loading={saving === "completed"} size="sm">
              Complete
            </Button>
            <Button variant="danger" onClick={() => move("cancelled")} loading={saving === "cancelled"} size="sm">
              Cancel
            </Button>
          </>
        )}
        <button onClick={() => setOpen((v) => !v)} className="text-xs font-medium ml-auto" style={{ color: "var(--accent)" }}>
          {open ? "Hide details" : "Delivery & notes"}
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 grid sm:grid-cols-2 gap-2" style={{ borderTop: "1px solid var(--border)" }}>
          <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
            Delivery fee (₦)
            <input value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, ""))} className={`${adminInput} w-full mt-1`} style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }} />
          </label>
          <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
            Delivery status
            <select value={dStatus} onChange={(e) => setDStatus(e.target.value as DeliveryStatus)} className={`${adminInput} w-full mt-1`} style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }}>
              {DELIVERY.map((d) => (
                <option key={d} value={d}>
                  {humanize(d)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
            Rider name
            <input value={rider} onChange={(e) => setRider(e.target.value)} className={`${adminInput} w-full mt-1`} style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }} />
          </label>
          <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
            Rider phone
            <input value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} className={`${adminInput} w-full mt-1`} style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }} />
          </label>
          <label className="text-[11px] sm:col-span-2" style={{ color: "var(--ink-soft)" }}>
            Admin notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${adminInput} w-full mt-1 resize-none`} style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border)" }} />
          </label>
          <div className="sm:col-span-2">
            <Button
              Icon={Save}
              onClick={() =>
                patch("delivery", {
                  adminNotes: notes,
                  delivery: {
                    fee: fee === "" ? undefined : Number(fee),
                    status: dStatus,
                    riderName: rider || undefined,
                    riderPhone: riderPhone || undefined,
                  },
                })
              }
              loading={saving === "delivery"}
              size="sm"
            >
              Save delivery & notes
            </Button>
          </div>
        </div>
      )}
      <div className="mt-2">
        <ErrorText>{error}</ErrorText>
      </div>
    </div>
  );
}

export default function WhatsAppOrdersSection() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("new");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<OrderRequest[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ status });
    if (q.trim()) qs.set("q", q.trim());
    const r = await apiJson<{ requests: OrderRequest[]; counts: Record<string, number> }>(`/api/admin/order-requests?${qs}`);
    setError(r.ok ? null : r.message);
    setRows(r.data?.requests ?? []);
    setCounts(r.data?.counts ?? {});
    setLoading(false);
  }, [status, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <SectionBody>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <FilterChips options={STATUSES} value={status} onChange={setStatus} counts={counts} />
        <RefreshButton onClick={load} />
      </div>
      <SearchBox value={q} onChange={setQ} placeholder="Search by reference, name, phone…" />
      <ListState loading={loading} error={error} empty={rows.length === 0} EmptyIcon={Package} emptyText="No WhatsApp orders here">
        <div className="space-y-2">
          {rows.map((r) => (
            <OrderCard
              key={idOf(r)}
              r={r}
              onSaved={(next) => setRows((xs) => (next.status !== status ? xs.filter((x) => idOf(x) !== idOf(r)) : xs.map((x) => (idOf(x) === idOf(r) ? { ...x, ...next } : x))))}
            />
          ))}
        </div>
      </ListState>
    </SectionBody>
  );
}
