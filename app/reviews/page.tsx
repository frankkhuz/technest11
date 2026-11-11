"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, CheckCircle2, Package } from "lucide-react";
import { apiJson, jsonBody } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { userIdOf } from "@/app/lib/auth";
import type { PendingReviewDeal } from "@/app/types/backend";
import { cldImage } from "@/app/lib/helpers";
import RatingsPanel from "@/app/component/shared/RatingsPanel";
import {
  PageShell,
  Card,
  Stars,
  Button,
  EmptyState,
  ErrorText,
  fieldClass,
  fieldStyle,
  formatDate,
  ACCENT,
} from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function RateCard({ deal, onDone }: { deal: PendingReviewDeal; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [now] = useState(() => Date.now());

  const submit = async () => {
    if (!rating) return setError("Pick 1 to 5 stars.");
    setSaving(true);
    const r = await apiJson(
      "/api/reviews",
      jsonBody({
        source: { type: deal.type, id: deal.id, ...(deal.product ? { productId: deal.product.id } : {}) },
        rating,
        comment: comment.trim() || undefined,
      })
    );
    setSaving(false);
    if (!r.ok) return setError(r.message);
    setDone(true);
    setTimeout(onDone, 1200);
  };

  const daysLeft = deal.completedAt
    ? Math.max(0, 30 - Math.floor((now - new Date(deal.completedAt).getTime()) / 86400000))
    : null;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {deal.product && (
            <div
              className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ background: "var(--border)" }}
            >
              {deal.product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cldImage(deal.product.image, 120)} alt="" className="w-full h-full object-contain" />
              ) : (
                <Package className="w-5 h-5" style={{ color: "var(--ink-soft)" }} />
              )}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
              {deal.product ? `Rate your ${deal.product.name}` : deal.subject?.name ?? "Your deal"}
            </p>
            <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
              {deal.label}
              {deal.completedAt ? ` · completed ${formatDate(deal.completedAt)}` : ""}
            </p>
          </div>
        </div>
        {daysLeft !== null && (
          <span className="text-[11px] flex-shrink-0" style={{ color: daysLeft <= 5 ? "#DC2626" : "var(--ink-soft)" }}>
            {daysLeft} day{daysLeft === 1 ? "" : "s"} left
          </span>
        )}
      </div>
      {done ? (
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#16a34a" }}>
          <CheckCircle2 className="w-4 h-4" /> Thanks for your review!
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Stars value={rating} size={26} onChange={setRating} />
            {rating > 0 && (
              <span className="text-sm font-medium" style={{ color: ACCENT }}>
                {RATING_WORDS[rating]}
              </span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            maxLength={600}
            placeholder="How did it go? (optional)"
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
          <ErrorText>{error}</ErrorText>
          <Button onClick={submit} loading={saving} disabled={!rating}>
            Submit review
          </Button>
        </div>
      )}
    </Card>
  );
}

function ReviewsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<"rate" | "mine">(params.get("tab") === "mine" ? "mine" : "rate");
  const [deals, setDeals] = useState<PendingReviewDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login?from=/reviews");
      return;
    }
    apiJson<{ deals: PendingReviewDeal[] }>("/api/reviews/pending")
      .then((r) => setDeals(r.data?.deals ?? []))
      .finally(() => setLoading(false));
  }, [isLoading, user, router]);

  return (
    <PageShell title="Ratings & Reviews" Icon={Star} subtitle="Rate who you dealt with — it helps everyone pick good vendors.">
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-5" style={{ background: "var(--border)" }}>
        {[
          { t: "rate", label: `To rate${deals.length ? ` (${deals.length})` : ""}` },
          { t: "mine", label: "About me" },
        ].map(({ t, label }) => (
          <button
            key={t}
            onClick={() => setTab(t as "rate" | "mine")}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#fff" : "var(--ink-soft)" }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "rate" ? (
        loading ? (
          <RowListSkeleton count={3} />
        ) : deals.length === 0 ? (
          <EmptyState
            Icon={Star}
            title="Nothing to rate right now"
            body="Completed deals appear here for 30 days so you can rate the other side."
          />
        ) : (
          <div className="space-y-3">
            {deals.map((d) => (
              <RateCard
                key={`${d.type}-${d.id}-${d.product?.id ?? ""}`}
                deal={d}
                // One order can hold several products — remove only the one rated.
                onDone={() => setDeals((xs) => xs.filter((x) => !(x.id === d.id && x.product?.id === d.product?.id)))}
              />
            ))}
          </div>
        )
      ) : (
        user && <RatingsPanel userId={userIdOf(user)} canReply />
      )}
    </PageShell>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <ReviewsContent />
    </Suspense>
  );
}
