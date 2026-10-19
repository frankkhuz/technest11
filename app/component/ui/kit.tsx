"use client";

// Small building blocks for the pages added with backend v2. They reproduce
// the inline-style patterns already used across the app (surface cards,
// rounded-full status pills, bottom-sheet modals) so new screens look like
// the existing ones without copying the same style objects everywhere.

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Star, X, AlertTriangle, Info, CheckCircle2, Loader2, type LucideIcon } from "lucide-react";
import Navbar from "@/app/component/layout/Navbar";

export const ACCENT = "#C2542D";

// ── Tones ──────────────────────────────────────────────────────────────────

export type Tone = "green" | "amber" | "red" | "purple" | "blue" | "accent" | "neutral";

export const TONES: Record<Tone, { color: string; bg: string }> = {
  green: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  amber: { color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  red: { color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
  purple: { color: "#7c3aed", bg: "rgba(124,58,237,0.12)" },
  blue: { color: "#1d9bf0", bg: "rgba(29,155,240,0.1)" },
  accent: { color: "var(--accent)", bg: "var(--accent-soft)" },
  neutral: { color: "var(--ink-soft)", bg: "var(--border)" },
};

/** A sensible tone for the status words the backend uses. */
export function statusTone(status?: string): Tone {
  switch (status) {
    case "active":
    case "completed":
    case "paid":
    case "verified":
    case "confirmed":
    case "resolved":
    case "delivered":
    case "collected":
    case "accepted":
    case "visible":
      return "green";
    case "pending":
    case "pending_review":
    case "new":
    case "open":
    case "investigating":
    case "ready_for_pickup":
      return "amber";
    case "in_progress":
    case "out_for_delivery":
      return "purple";
    case "rejected":
    case "failed":
    case "removed":
    case "hidden":
      return "red";
    default:
      return "neutral";
  }
}

export const humanize = (s?: string) =>
  s ? s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "";

export function Pill({
  tone = "neutral",
  Icon,
  children,
  size = "sm",
}: {
  tone?: Tone;
  Icon?: LucideIcon;
  children: ReactNode;
  size?: "xs" | "sm";
}) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full flex-shrink-0 whitespace-nowrap ${
        size === "xs" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
      style={{ background: t.bg, color: t.color }}
    >
      {Icon && <Icon className={size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      {children}
    </span>
  );
}

export function StatusPill({ status, label }: { status?: string; label?: string }) {
  return <Pill tone={statusTone(status)}>{label ?? humanize(status)}</Pill>;
}

// ── Layout ─────────────────────────────────────────────────────────────────

export const surface: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
};

export function Card({
  children,
  className = "",
  style,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 sm:p-5 ${className}`}
      style={{ ...surface, cursor: onClick ? "pointer" : undefined, ...style }}
    >
      {children}
    </div>
  );
}

export function PageShell({
  title,
  subtitle,
  Icon,
  actions,
  width = "max-w-3xl",
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  Icon?: LucideIcon;
  actions?: ReactNode;
  width?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />
      <div className={`${width} mx-auto px-4 sm:px-6 py-8`}>
        <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" style={{ color: ACCENT }} />}
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
              >
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>
        {children}
      </p>
      {right}
    </div>
  );
}

export function EmptyState({
  Icon,
  title,
  body,
  action,
}: {
  Icon: LucideIcon;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-14 px-6 rounded-2xl" style={surface}>
      <Icon className="w-9 h-9 mx-auto mb-3" style={{ color: "var(--ink-soft)" }} />
      <p className="font-semibold mb-1" style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}>
        {title}
      </p>
      {body && (
        <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--ink-soft)" }}>
          {body}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({
  tone = "accent",
  children,
  action,
}: {
  tone?: "accent" | "red" | "green" | "amber" | "neutral";
  children: ReactNode;
  action?: ReactNode;
}) {
  const t = TONES[tone];
  const Icon = tone === "red" || tone === "amber" ? AlertTriangle : tone === "green" ? CheckCircle2 : Info;
  return (
    <div
      className="rounded-xl p-3 text-xs flex items-start gap-2"
      style={{ background: t.bg, color: "var(--ink)" }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: t.color }} />
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Buttons ────────────────────────────────────────────────────────────────

export function Button({
  children,
  onClick,
  disabled,
  loading,
  variant = "primary",
  Icon,
  type = "button",
  className = "",
  full,
  size = "md",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "soft" | "outline" | "danger" | "whatsapp" | "ghost";
  Icon?: LucideIcon;
  type?: "button" | "submit";
  className?: string;
  full?: boolean;
  size?: "sm" | "md";
}) {
  const styles: Record<string, CSSProperties> = {
    primary: { background: ACCENT, color: "#fff" },
    soft: { background: "var(--accent-soft)", color: ACCENT },
    outline: { background: "transparent", color: "var(--ink)", border: "1px solid var(--border)" },
    danger: { background: "rgba(220,38,38,0.08)", color: "#DC2626" },
    whatsapp: { background: "#25d366", color: "#fff" },
    ghost: { background: "transparent", color: "var(--ink-soft)" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold disabled:opacity-40 hover:opacity-90 ${
        size === "sm" ? "text-xs px-3 py-1.5 rounded-lg" : "text-sm px-4 py-2.5 rounded-xl"
      } ${
        full ? "w-full" : ""
      } ${className}`}
      style={{ cursor: "pointer", ...styles[variant] }}
    >
      {loading ? (
        <Loader2 className={size === "sm" ? "w-3.5 h-3.5 animate-spin" : "w-4 h-4 animate-spin"} />
      ) : Icon ? (
        <Icon className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      ) : null}
      {children}
    </button>
  );
}

// ── Forms ──────────────────────────────────────────────────────────────────

export const fieldClass = "w-full text-sm px-3.5 py-2.5 rounded-xl outline-none";
export const fieldStyle: CSSProperties = {
  background: "var(--bg)",
  color: "var(--ink)",
  border: "1px solid var(--border)",
};

export function Field({
  label,
  hint,
  children,
  optional,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
        {label}
        {optional && (
          <span className="font-normal" style={{ color: "var(--ink-soft)" }}>
            {" "}
            (optional)
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] mt-1" style={{ color: "var(--ink-soft)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap"
      style={{
        background: active ? ACCENT : "var(--surface)",
        color: active ? "#fff" : "var(--ink-soft)",
        border: "1px solid var(--border)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="text-xs" style={{ color: "#DC2626" }}>
      {children}
    </p>
  );
}

// ── Modal (bottom sheet on mobile, centered on desktop) ───────────────────

export function Modal({
  open,
  onClose,
  title,
  Icon,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  Icon?: LucideIcon;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`rounded-2xl w-full ${width} p-6 max-h-[90vh] overflow-y-auto`}
        style={surface}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--accent-soft)", color: ACCENT }}
              >
                <Icon className="w-4 h-4" />
              </div>
            )}
            <h3
              className="text-base font-bold truncate"
              style={{ color: "var(--ink)", fontFamily: "Space Grotesk, sans-serif" }}
            >
              {title}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--ink-soft)", cursor: "pointer" }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Ratings ────────────────────────────────────────────────────────────────

export function Stars({
  value,
  size = 14,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        const star = (
          <Star
            style={{ width: size, height: size, color: "#f59e0b" }}
            fill={filled ? "#f59e0b" : "transparent"}
            strokeWidth={1.8}
          />
        );
        return onChange ? (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            style={{ cursor: "pointer" }}
          >
            {star}
          </button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </span>
  );
}

/** "★ 4.6 (12)" — or "New" when there are no reviews yet. */
export function RatingBadge({
  rating,
}: {
  rating?: { average: number; count: number } | number | null;
}) {
  const avg = typeof rating === "number" ? rating : rating?.average;
  const count = typeof rating === "number" ? undefined : rating?.count;
  if (!avg) {
    return (
      <span className="text-[11px] font-medium" style={{ color: "var(--ink-soft)" }}>
        New on TechNest
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--ink)" }}>
      <Star className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} fill="#f59e0b" />
      {avg.toFixed(1)}
      {count !== undefined && (
        <span className="font-normal" style={{ color: "var(--ink-soft)" }}>
          ({count})
        </span>
      )}
    </span>
  );
}

export const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (d?: string | null) =>
  d
    ? new Date(d).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

export function timeAgo(d?: string | null) {
  if (!d) return "";
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const days = Math.floor(s / 86400);
  return days < 30 ? `${days}d ago` : formatDate(d);
}

/** Reviewer display name from whichever field the endpoint filled in. */
export function nameOfAuthor(r: { authorName?: string; author?: { name?: string } | string }) {
  if (r.authorName) return r.authorName;
  if (r.author && typeof r.author === "object" && r.author.name) return r.author.name;
  return "TechNest customer";
}
