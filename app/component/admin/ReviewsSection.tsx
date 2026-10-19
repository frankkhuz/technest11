"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, EyeOff, Eye } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { nameOf, type Review } from "@/app/types/backend";
import { Stars, StatusPill, Button, fieldStyle, timeAgo, nameOfAuthor } from "@/app/component/ui/kit";
import { SectionBody, FilterChips, ListState, RefreshButton, adminInput } from "./shared";

const STATUSES = ["visible", "hidden"] as const;

export default function ReviewsSection() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("visible");
  const [maxRating, setMaxRating] = useState("");
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ status });
    if (maxRating) qs.set("maxRating", maxRating);
    const r = await apiJson<{ reviews: Review[] }>(`/api/reviews/admin?${qs}`);
    setError(r.ok ? null : r.message);
    setRows(r.data?.reviews ?? []);
    setLoading(false);
  }, [status, maxRating]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const toggle = async (r: Review) => {
    const next = r.status === "hidden" ? "visible" : "hidden";
    let reason: string | undefined;
    if (next === "hidden") {
      const v = window.prompt("Why hide this review? (kept in the activity log)");
      if (v === null) return;
      reason = v.trim() || undefined;
    }
    setBusy(r._id);
    const res = await apiJson(`/api/reviews/admin/${r._id}`, { method: "PATCH", body: JSON.stringify({ status: next, reason }) });
    setBusy(null);
    if (!res.ok) return window.alert(res.message);
    setRows((xs) => xs.filter((x) => x._id !== r._id));
  };

  return (
    <SectionBody>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <FilterChips options={STATUSES} value={status} onChange={setStatus} />
        <div className="flex items-center gap-2 mb-4">
          <select value={maxRating} onChange={(e) => setMaxRating(e.target.value)} className={adminInput} style={fieldStyle}>
            <option value="">Any rating</option>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? "s" : ""} or less
              </option>
            ))}
          </select>
          <RefreshButton onClick={load} />
        </div>
      </div>
      <ListState loading={loading} error={error} empty={rows.length === 0} EmptyIcon={Star} emptyText="No reviews here">
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r._id} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Stars value={r.rating} />
                  <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                    {nameOfAuthor(r)}
                    {typeof r.author === "object" && r.author?.email ? ` (${r.author.email})` : ""} → {r.subjectName ?? nameOf(r.subject)}
                    {typeof r.subject === "object" && r.subject?.email ? ` (${r.subject.email})` : ""} · {timeAgo(r.createdAt)}
                  </p>
                  {r.comment && (
                    <p className="text-sm mt-1.5" style={{ color: "var(--ink)" }}>
                      {r.comment}
                    </p>
                  )}
                  {r.reply && (
                    <p className="text-xs mt-1.5" style={{ color: "var(--ink-soft)" }}>
                      Reply: {r.reply}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusPill status={r.status ?? status} />
                  <Button size="sm" variant={r.status === "hidden" ? "soft" : "danger"} Icon={r.status === "hidden" ? Eye : EyeOff} onClick={() => toggle({ ...r, status: r.status ?? status })} loading={busy === r._id}>
                    {(r.status ?? status) === "hidden" ? "Show" : "Hide"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ListState>
    </SectionBody>
  );
}
