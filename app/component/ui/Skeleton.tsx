import type { CSSProperties } from "react";

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div aria-hidden className={`skeleton rounded-md ${className}`} style={style} />;
}

export function CardSkeleton({ imageHeight = 160 }: { imageHeight?: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <Skeleton className="w-full rounded-none" style={{ height: imageHeight }} />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-2.5 w-1/2" />
        <Skeleton className="h-4 w-2/5 mt-3" />
        <Skeleton className="h-8 w-full rounded-lg mt-3" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  count = 8,
  className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
  imageHeight,
}: {
  count?: number;
  className?: string;
  imageHeight?: number;
}) {
  return (
    <div className={className} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} imageHeight={imageHeight} />
      ))}
    </div>
  );
}

export function RowListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-56 mb-3" />
      <Skeleton className="h-4 w-80 max-w-full mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <RowListSkeleton count={4} />
    </div>
  );
}
