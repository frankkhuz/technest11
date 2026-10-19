"use client";

// Shared pieces for the admin sections — same look as the existing
// Orders / Transactions / AI tabs in app/admin/page.tsx.

import type { ReactNode } from "react";
import { RefreshCw, Search, type LucideIcon } from "lucide-react";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";
import { Notice, fieldStyle } from "@/app/component/ui/kit";

export function SectionBody({ children, width = "max-w-5xl" }: { children: ReactNode; width?: string }) {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className={width}>{children}</div>
    </div>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  counts,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  counts?: Partial<Record<string, number>>;
  labels?: Partial<Record<T, string>>;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {options.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium capitalize whitespace-nowrap inline-flex items-center gap-1.5 flex-shrink-0"
          style={{
            background: value === s ? "var(--accent)" : "var(--surface)",
            color: value === s ? "#fff" : "var(--ink-soft)",
            border: "1px solid var(--border)",
          }}
        >
          {labels?.[s] ?? s.replace(/_/g, " ")}
          {counts && counts[s] !== undefined && (
            <span
              className="text-[10px] px-1.5 rounded-full"
              style={{
                background: value === s ? "rgba(255,255,255,0.25)" : "var(--border)",
              }}
            >
              {counts[s]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mb-4 max-w-md">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-soft)" }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm pl-9 pr-3 py-2 rounded-xl outline-none"
        style={fieldStyle}
      />
    </div>
  );
}

export function ListState({
  loading,
  error,
  empty,
  EmptyIcon,
  emptyText,
  children,
}: {
  loading: boolean;
  error?: string | null;
  empty: boolean;
  EmptyIcon: LucideIcon;
  emptyText: string;
  children: ReactNode;
}) {
  if (loading) return <RowListSkeleton count={5} />;
  if (error) return <Notice tone="red">{error}</Notice>;
  if (empty) {
    return (
      <div className="text-center py-16">
        <EmptyIcon className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--ink-soft)" }} />
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          {emptyText}
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

export function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg"
      style={{ border: "1px solid var(--border)", color: "var(--ink-soft)" }}
    >
      <RefreshCw className="w-3.5 h-3.5" /> Refresh
    </button>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-xs mb-1" style={{ color: "var(--ink-soft)" }}>
        {label}
      </p>
      <p className="text-xl font-bold" style={{ color: tone ?? "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
        {value}
      </p>
    </div>
  );
}

export const adminInput = "text-xs px-2.5 py-2 rounded-lg outline-none";

/** Prompt for a number, prefilled; returns undefined if cancelled or blank. */
export function promptNumber(message: string, prefill?: number): number | undefined | null {
  const raw = window.prompt(message, prefill !== undefined ? String(prefill) : "");
  if (raw === null) return null;
  const n = Number(raw.replace(/[^\d.]/g, ""));
  return raw.trim() === "" || !Number.isFinite(n) ? undefined : n;
}
