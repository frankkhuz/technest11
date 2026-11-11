"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { formatDate } from "@/app/component/ui/kit";
import type { Review } from "@/app/types/backend";

type ProductReviewsData = {
  average: number;
  count: number;
  /** Count per star value, e.g. { "5": 80, "4": 30, ... } */
  stars?: Record<string, number>;
  reviews: Review[];
  page?: number;
  pages?: number;
};

const authorOf = (r: Review) =>
  r.authorName || (typeof r.author === "object" && r.author?.name) || "TechNest buyer";

/**
 * "Ratings & reviews" for a catalog product — GET /api/reviews/products/{slug}.
 * Renders nothing until the endpoint answers, and nothing at all if the
 * backend doesn't have it yet, so the page never shows an empty shell.
 */
export default function ProductReviews({ slug }: { slug: string }) {
  const [data, setData] = useState<ProductReviewsData | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiJson<ProductReviewsData>(`/api/reviews/products/${encodeURIComponent(slug)}?page=1`).then((r) => {
      if (!cancelled && r.ok && r.data) setData(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!data) return null;

  const loadMore = async () => {
    setLoadingMore(true);
    const next = page + 1;
    const r = await apiJson<ProductReviewsData>(`/api/reviews/products/${encodeURIComponent(slug)}?page=${next}`);
    if (r.ok && r.data) {
      setData((d) => (d ? { ...d, reviews: [...d.reviews, ...r.data!.reviews], pages: r.data!.pages } : d));
      setPage(next);
    }
    setLoadingMore(false);
  };

  return (
    <section
      className="mt-8 rounded-2xl p-4 sm:p-6"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      aria-labelledby="product-reviews-title"
    >
      <h2 id="product-reviews-title" className="text-lg font-bold mb-4" style={{ color: "var(--ink)" }}>
        Ratings &amp; reviews
      </h2>

      {data.count === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          No ratings yet — buyers can rate this product after their order is completed.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-5 mb-5">
            <div className="text-center flex-shrink-0">
              <p className="num text-4xl font-bold leading-none" style={{ color: "var(--ink)" }}>
                {data.average.toFixed(1)}
              </p>
              <div className="flex justify-center mt-1.5" aria-hidden>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    style={{ color: "#f59e0b" }}
                    fill={i <= Math.round(data.average) ? "#f59e0b" : "transparent"}
                  />
                ))}
              </div>
              <p className="num text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                {data.count} rating{data.count === 1 ? "" : "s"}
              </p>
            </div>
            {data.stars && (
              <div className="flex-1 min-w-0 space-y-1">
                {[5, 4, 3, 2, 1].map((n) => {
                  const c = data.stars?.[String(n)] ?? 0;
                  const pct = data.count ? (c / data.count) * 100 : 0;
                  return (
                    <div key={n} className="flex items-center gap-2 text-[11px]" style={{ color: "var(--ink-soft)" }}>
                      <span className="num w-2">{n}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#f59e0b" }} />
                      </div>
                      <span className="num w-7 text-right">{c}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ul className="space-y-3">
            {data.reviews.map((r) => (
              <li key={r._id} className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                    {authorOf(r)}
                  </span>
                  <span className="text-[11px] flex-shrink-0" style={{ color: "var(--ink-soft)" }}>
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                <div className="flex mb-1" aria-label={`${r.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-3 h-3"
                      style={{ color: "#f59e0b" }}
                      fill={i <= r.rating ? "#f59e0b" : "transparent"}
                    />
                  ))}
                </div>
                {r.comment && (
                  <p className="text-sm" style={{ color: "var(--ink)" }}>
                    {r.comment}
                  </p>
                )}
                {r.reply && (
                  <p className="text-xs mt-2 pl-3" style={{ color: "var(--ink-soft)", borderLeft: "2px solid var(--border)" }}>
                    <strong>TechNest:</strong> {r.reply}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {(data.pages ?? 1) > page && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-4 w-full h-11 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ border: "1px solid var(--border)", color: "var(--ink)" }}
            >
              {loadingMore ? "Loading…" : "More reviews"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
