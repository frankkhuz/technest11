"use client";

import { useCallback, useEffect, useState } from "react";
import { Scale, ArrowLeft, Gavel } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { userIdOf } from "@/app/lib/auth";
import {
  DISPUTE_REASON_LABELS,
  DISPUTE_RESOLUTION_LABELS,
  nameOf,
  type Dispute,
  type DisputeResolution,
} from "@/app/types/backend";
import DisputeThread from "@/app/component/shared/DisputeThread";
import { StatusPill, Button, Card, ErrorText, fieldStyle, timeAgo } from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";
import { SectionBody, FilterChips, ListState, RefreshButton, adminInput } from "./shared";

const STATUSES = ["open", "investigating", "resolved", "rejected"] as const;
const RESOLUTIONS = Object.keys(DISPUTE_RESOLUTION_LABELS) as DisputeResolution[];

function Decide({ dispute, onChange }: { dispute: Dispute; onChange: (d: Dispute) => void }) {
  const [resolution, setResolution] = useState<DisputeResolution>("refund");
  const [note, setNote] = useState("");
  const [refund, setRefund] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (dispute.status === "resolved" || dispute.status === "rejected") return null;

  const patch = async (status: "investigating" | "resolved" | "rejected") => {
    if (status !== "investigating" && !note.trim() && !window.confirm("Decide without a note to both sides?")) return;
    setBusy(status);
    setError(null);
    const body: Record<string, unknown> = { status, resolutionNote: note.trim() || undefined };
    if (status === "resolved") {
      body.resolution = resolution;
      if (refund) body.refundAmount = Number(refund);
    }
    const r = await apiJson<{ dispute: Dispute }>(`/api/disputes/admin/${dispute._id}`, { method: "PATCH", body: JSON.stringify(body) });
    setBusy(null);
    if (!r.ok) return setError(r.message);
    if (r.data?.dispute) onChange(r.data.dispute);
  };

  return (
    <Card className="space-y-3">
      <p className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--ink)" }}>
        <Gavel className="w-4 h-4" style={{ color: "var(--accent)" }} /> Decide
      </p>
      <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
        Refund or return-and-refund cancels a held seller payout; any other outcome releases it. Refunds are paid outside the app — record the amount.
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        <select value={resolution} onChange={(e) => setResolution(e.target.value as DisputeResolution)} className={adminInput} style={fieldStyle}>
          {RESOLUTIONS.map((r) => (
            <option key={r} value={r}>
              {DISPUTE_RESOLUTION_LABELS[r]}
            </option>
          ))}
        </select>
        <input value={refund} onChange={(e) => setRefund(e.target.value.replace(/\D/g, ""))} placeholder="Refund amount (₦)" className={adminInput} style={fieldStyle} />
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Decision note (both sides see it)" className={`${adminInput} w-full resize-none`} style={fieldStyle} />
      <div className="flex gap-2 flex-wrap">
        {dispute.status === "open" && (
          <Button size="sm" variant="soft" onClick={() => patch("investigating")} loading={busy === "investigating"}>
            Mark investigating
          </Button>
        )}
        <Button size="sm" onClick={() => patch("resolved")} loading={busy === "resolved"}>
          Resolve
        </Button>
        <Button size="sm" variant="danger" onClick={() => patch("rejected")} loading={busy === "rejected"}>
          Reject
        </Button>
      </div>
      <ErrorText>{error}</ErrorText>
    </Card>
  );
}

export default function DisputesSection() {
  const { user } = useAuth();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("open");
  const [rows, setRows] = useState<Dispute[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Dispute | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiJson<{ disputes: Dispute[]; counts: Record<string, number> }>(`/api/disputes/admin?status=${status}`);
    setError(r.ok ? null : r.message);
    setRows(r.data?.disputes ?? []);
    setCounts(r.data?.counts ?? {});
    setLoading(false);
  }, [status]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    if (!openId) return void Promise.resolve().then(() => setDetail(null));
    apiJson<{ dispute: Dispute }>(`/api/disputes/${openId}`).then((r) => setDetail(r.data?.dispute ?? null));
  }, [openId]);

  if (openId) {
    return (
      <SectionBody width="max-w-3xl">
        <button onClick={() => { setOpenId(null); load(); }} className="inline-flex items-center gap-1 text-xs font-medium mb-4" style={{ color: "var(--ink-soft)" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> All disputes
        </button>
        {!detail ? (
          <RowListSkeleton count={3} />
        ) : (
          <div className="space-y-4">
            <Decide dispute={detail} onChange={setDetail} />
            <DisputeThread dispute={detail} onChange={setDetail} viewerId={userIdOf(user)} />
          </div>
        )}
      </SectionBody>
    );
  }

  return (
    <SectionBody>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <FilterChips options={STATUSES} value={status} onChange={setStatus} counts={counts} />
        <RefreshButton onClick={load} />
      </div>
      <ListState loading={loading} error={error} empty={rows.length === 0} EmptyIcon={Scale} emptyText="No disputes here">
        <div className="space-y-2">
          {rows.map((d) => (
            <button
              key={d._id}
              onClick={() => setOpenId(d._id)}
              className="w-full text-left rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  {DISPUTE_REASON_LABELS[d.reason] ?? d.reason} · {d.sourceLabel ?? d.label ?? d.source?.type}
                </p>
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  {nameOf(d.raisedBy)}
                  {typeof d.raisedBy === "object" && d.raisedBy?.email ? ` (${d.raisedBy.email})` : ""} vs {nameOf(d.against)}
                  {typeof d.against === "object" && d.against?.email ? ` (${d.against.email})` : ""} · {timeAgo(d.createdAt)}
                </p>
                <p className="text-xs mt-1 line-clamp-1" style={{ color: "var(--ink)" }}>
                  {d.description}
                </p>
              </div>
              <StatusPill status={d.status} />
            </button>
          ))}
        </div>
      </ListState>
    </SectionBody>
  );
}
