import { Star } from "lucide-react";
import type { Rating } from "@/app/types/backend";

/**
 * Compact "★ 4.6 (128)" row for product cards.
 * - Rated → stars line.
 * - Not rated + `reserve` → an empty line of the same height, so cards in a
 *   grid where *some* products are rated still line up.
 * - Not rated, no reserve → nothing.
 */
export default function ProductRating({
  rating,
  reserve = false,
  size = "sm",
}: {
  rating?: Rating;
  reserve?: boolean;
  size?: "sm" | "md";
}) {
  const h = size === "md" ? "h-5" : "h-4";
  if (!rating || !rating.count) return reserve ? <div className={h} aria-hidden /> : null;
  const full = Math.round(rating.average);
  return (
    <div
      className={`flex items-center gap-1 ${h} ${size === "md" ? "text-sm" : "text-[11px]"}`}
      aria-label={`Rated ${rating.average.toFixed(1)} out of 5 from ${rating.count} rating${rating.count === 1 ? "" : "s"}`}
    >
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={size === "md" ? "w-4 h-4" : "w-3 h-3"}
            style={{ color: "#f59e0b" }}
            fill={i <= full ? "#f59e0b" : "transparent"}
            strokeWidth={1.8}
          />
        ))}
      </span>
      <span className="num font-semibold" style={{ color: "var(--ink)" }}>
        {rating.average.toFixed(1)}
      </span>
      <span className="num" style={{ color: "var(--ink-soft)" }}>
        ({rating.count})
      </span>
    </div>
  );
}

/** True when at least one product in the list has ratings. */
export const anyRated = (list: { rating?: Rating }[]) => list.some((p) => !!p.rating?.count);
