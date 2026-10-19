"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, RefreshCcw } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import { REQUEST_TYPE_LABELS, idOf, type DeviceRequest } from "@/app/types/backend";
import { StatusPill, Button, ErrorText, Chip, Notice, formatDateTime } from "@/app/component/ui/kit";
import { SectionBody, FilterChips, ListState, RefreshButton, promptNumber } from "./shared";

const STATUSES = ["open", "accepted", "completed", "expired", "cancelled"] as const;

function RequestRow({ r, onChanged }: { r: DeviceRequest; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [showOffers, setShowOffers] = useState(false);
  const offers = r.offers ?? [];
  const accepted = r.acceptedOffer ?? offers.find((o) => o.status === "accepted");

  const patch = async (status: "completed" | "cancelled") => {
    let body: Record<string, unknown> = { status };
    if (status === "completed") {
      const finalPrice = promptNumber("Final deal price (₦):", accepted?.price);
      if (finalPrice === null) return;
      const commission = promptNumber("TechNest commission (₦):", finalPrice ? Math.round(finalPrice * 0.05) : undefined);
      if (commission === null) return;
      const adminNotes = window.prompt("Notes (optional):", r.adminNotes ?? "") ?? undefined;
      body = { ...body, finalPrice, commission, adminNotes };
    } else if (!window.confirm("Cancel this request?")) return;
    setBusy(status);
    const res = await apiJson(`/api/admin/requests/${idOf(r)}`, { method: "PATCH", body: JSON.stringify(body) });
    setBusy(null);
    if (!res.ok) return setMsg({ text: res.message, error: true });
    onChanged();
  };

  const rematch = async () => {
    setBusy("match");
    const res = await apiJson<{ added: number; matchedVendors: number }>(`/api/admin/requests/${idOf(r)}/match`, { method: "POST" });
    setBusy(null);
    if (!res.ok) return setMsg({ text: res.message, error: true });
    setMsg({ text: `${res.data?.added ?? 0} new vendor(s) matched — ${res.data?.matchedVendors ?? "?"} in total.` });
  };

  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>
            {REQUEST_TYPE_LABELS[r.type]} · {r.category}
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            {r.deviceName}
            {r.storage ? ` · ${r.storage}` : ""}
            {r.wantedDevice ? ` → ${r.wantedDevice}` : ""}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
            {r.reference ? `${r.reference} · ` : ""}
            {r.customer?.name} {r.customer?.email ? `(${r.customer.email})` : ""} · {r.city ? `${r.city}, ` : ""}
            {r.state} · {formatDateTime(r.createdAt)}
          </p>
          {r.issue && (
            <p className="text-xs mt-1" style={{ color: "var(--ink)" }}>
              Problem: {r.issue}
            </p>
          )}
          {accepted && (
            <p className="text-xs mt-1" style={{ color: "#16a34a" }}>
              Accepted: {accepted.vendorName ?? r.acceptedVendor?.name} · {formatPrice(accepted.price)}
              {r.acceptedVendor?.email ? ` · ${r.acceptedVendor.email}` : ""}
            </p>
          )}
          {r.adminNotes && (
            <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
              Notes: {r.adminNotes}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <StatusPill status={r.status} />
          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
            {offers.length} offer{offers.length === 1 ? "" : "s"} · {r.matchedVendorCount ?? r.matchedVendors ?? 0} matched
          </p>
          {typeof r.commission === "number" && (
            <p className="text-xs" style={{ color: "var(--ink)" }}>
              Commission {formatPrice(r.commission)}
            </p>
          )}
        </div>
      </div>

      {showOffers && offers.length > 0 && (
        <div className="mt-3 space-y-1">
          {offers.map((o) => (
            <div key={idOf(o)} className="flex justify-between text-xs px-3 py-2 rounded-lg" style={{ background: "var(--bg)" }}>
              <span style={{ color: "var(--ink)" }}>
                {o.vendorName} {o.status && o.status !== "active" ? `· ${o.status}` : ""} {o.eta ? `· ${o.eta}` : ""}
              </span>
              <span className="font-semibold" style={{ color: "var(--accent)" }}>
                {formatPrice(o.price)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {offers.length > 0 && (
          <Chip active={showOffers} onClick={() => setShowOffers((v) => !v)}>
            {showOffers ? "Hide offers" : "Show offers"}
          </Chip>
        )}
        {r.status === "open" && (
          <Button size="sm" variant="soft" Icon={RefreshCcw} onClick={rematch} loading={busy === "match"}>
            Match again
          </Button>
        )}
        {r.status === "accepted" && (
          <Button size="sm" onClick={() => patch("completed")} loading={busy === "completed"}>
            Mark completed
          </Button>
        )}
        {(r.status === "open" || r.status === "accepted") && (
          <Button size="sm" variant="danger" onClick={() => patch("cancelled")} loading={busy === "cancelled"}>
            Cancel
          </Button>
        )}
      </div>
      {msg && (
        <div className="mt-2">
          {msg.error ? <ErrorText>{msg.text}</ErrorText> : <Notice tone="green">{msg.text}</Notice>}
        </div>
      )}
    </div>
  );
}

export default function RequestsSection() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("open");
  const [unmatched, setUnmatched] = useState(false);
  const [rows, setRows] = useState<DeviceRequest[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ status });
    if (unmatched) qs.set("unmatched", "true");
    const r = await apiJson<{ requests: DeviceRequest[]; counts: Record<string, number> }>(`/api/admin/requests?${qs}`);
    setError(r.ok ? null : r.message);
    setRows(r.data?.requests ?? []);
    setCounts(r.data?.counts ?? {});
    setLoading(false);
  }, [status, unmatched]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  return (
    <SectionBody>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <FilterChips options={STATUSES} value={status} onChange={setStatus} counts={counts} />
        <div className="flex items-center gap-2 mb-4">
          <Chip active={unmatched} onClick={() => setUnmatched((v) => !v)}>
            No vendor matched
          </Chip>
          <RefreshButton onClick={load} />
        </div>
      </div>
      <ListState loading={loading} error={error} empty={rows.length === 0} EmptyIcon={Send} emptyText="No requests here">
        <div className="space-y-2">
          {rows.map((r) => (
            <RequestRow key={idOf(r)} r={r} onChanged={load} />
          ))}
        </div>
      </ListState>
    </SectionBody>
  );
}
