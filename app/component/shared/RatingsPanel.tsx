"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, Reply } from "lucide-react";
import { apiJson, jsonBody } from "@/app/lib/api";
import type { RatingSummary, Review } from "@/app/types/backend";
import { Card, Stars, EmptyState, Button, Notice, fieldClass, fieldStyle, timeAgo, nameOfAuthor } from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

function ReviewItem({ review, canReply, onReplied }: { review: Review; canReply: boolean; onReplied: (r: Review) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const r = await apiJson<{ review: Review }>(`/api/reviews/${review._id}/reply`, jsonBody({ reply: text.trim() }));
    setSaving(false);
    if (!r.ok) return setError(r.message);
    onReplied(r.data?.review ?? { ...review, reply: text.trim() });
    setOpen(false);
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Stars value={review.rating} />
          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
            {nameOfAuthor(review)} · {timeAgo(review.createdAt)}
            {review.label ? ` · ${review.label}` : ""}
          </p>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm mt-2" style={{ color: "var(--ink)" }}>
          {review.comment}
        </p>
      )}
      {review.reply && (
        <div className="mt-3 rounded-xl p-3 text-xs" style={{ background: "var(--bg)" }}>
          <p className="font-semibold mb-0.5" style={{ color: "var(--ink)" }}>
            Reply
          </p>
          <p style={{ color: "var(--ink-soft)" }}>{review.reply}</p>
        </div>
      )}
      {canReply && !review.reply && (
        <div className="mt-3">
          {open ? (
            <div className="space-y-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Thank them, or explain what happened — you can reply once."
                className={`${fieldClass} resize-none`}
                style={fieldStyle}
              />
              {error && <Notice tone="red">{error}</Notice>}
              <div className="flex gap-2">
                <Button onClick={send} loading={saving}>
                  Post reply
                </Button>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#C2542D" }}>
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

/** A user's public rating summary and reviews; `canReply` for the owner. */
export default function RatingsPanel({ userId, canReply }: { userId: string; canReply?: boolean }) {
  const [data, setData] = useState<RatingSummary | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      const r = await apiJson<RatingSummary>(`/api/reviews/users/${userId}?page=${p}`);
      if (r.data) {
        setData((prev) => (p === 1 || !prev ? r.data : { ...r.data!, reviews: [...prev.reviews, ...r.data!.reviews] }));
        setPage(p);
      }
      setLoading(false);
    },
    [userId]
  );

  useEffect(() => {
    if (userId) Promise.resolve().then(() => load(1));
  }, [userId, load]);

  if (loading && !data) return <RowListSkeleton count={3} />;
  if (!data || data.count === 0) {
    return <EmptyState Icon={Star} title="No reviews yet" body="Reviews appear here after completed deals." />;
  }

  const total = data.count || 1;
  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-5 flex-wrap">
        <div className="text-center">
          <p className="text-4xl font-bold" style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
            {data.average.toFixed(1)}
          </p>
          <Stars value={data.average} />
          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
            {data.count} review{data.count === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex-1 min-w-[180px] space-y-1">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = data.stars?.[n] ?? 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-3" style={{ color: "var(--ink-soft)" }}>
                  {n}
                </span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${(c / total) * 100}%`, background: "#f59e0b" }} />
                </div>
                <span className="w-6 text-right" style={{ color: "var(--ink-soft)" }}>
                  {c}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="space-y-3">
        {data.reviews.map((r) => (
          <ReviewItem
            key={r._id}
            review={r}
            canReply={!!canReply}
            onReplied={(next) => setData((d) => d && { ...d, reviews: d.reviews.map((x) => (x._id === r._id ? { ...x, ...next } : x)) })}
          />
        ))}
      </div>
      {data.pages && page < data.pages && (
        <div className="text-center">
          <Button variant="outline" onClick={() => load(page + 1)} loading={loading}>
            More reviews
          </Button>
        </div>
      )}
    </div>
  );
}
