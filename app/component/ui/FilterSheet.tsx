"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Filters that open as a bottom-sheet drawer on phones and render inline on
 * sm+ screens. The same children are used in both, so filter state and any
 * data the filter controls fetch are never duplicated.
 *
 * - `desktopAlwaysOpen`: on sm+ the panel is always visible (otherwise it
 *   follows `open`, like a disclosure).
 * - The sheet floats over the page, so opening/closing it never changes the
 *   page's height or scroll position.
 */
export default function FilterSheet({
  open,
  onClose,
  title = "Filters",
  resultLabel,
  onClear,
  clearDisabled,
  desktopAlwaysOpen = false,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** e.g. "Show 24 results" — the sheet's main button. */
  resultLabel?: string;
  onClear?: () => void;
  clearDisabled?: boolean;
  desktopAlwaysOpen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  // z-[110]: above the chat bubble (z-100) and both nav bars.
  // Lock the page behind the sheet (phones only) and close on Escape.
  useEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    // Lock <html> too: with overflow-x: clip on <html>, body overflow no
    // longer propagates to the viewport, so locking body alone wouldn't stop
    // the page scrolling behind the sheet.
    const html = document.documentElement;
    const prevBody = document.body.style.overflow;
    const prevHtml = html.style.overflow;
    if (mobile) {
      document.body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const desktop = desktopAlwaysOpen ? "sm:block" : open ? "sm:block" : "sm:hidden";

  return (
    <div
      className={`${open ? "fixed inset-0 z-[110] flex items-end" : "hidden"} sm:static sm:z-auto ${desktop} ${className}`}
    >
      {open && (
        <button
          type="button"
          aria-label="Close filters"
          onClick={onClose}
          className="sheet-backdrop sm:hidden absolute inset-0"
          style={{ background: "rgba(10,6,14,0.5)", cursor: "default" }}
        />
      )}
      <div
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label={title}
        className="sheet-panel relative w-full max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-[var(--surface)] sm:max-h-none sm:overflow-visible sm:rounded-none sm:bg-transparent shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.45)] sm:shadow-none"
      >
        {/* Sheet chrome — phones only */}
        <div
          className="sm:hidden sticky top-0 z-10 px-4 pt-2.5 pb-3 bg-[var(--surface)]"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="mx-auto mb-2.5 h-1.5 w-10 rounded-full" style={{ background: "var(--border)" }} />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center"
              style={{ color: "var(--ink-soft)" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-0">{children}</div>

        <div
          className="sm:hidden sticky bottom-0 flex gap-2 px-4 pt-3 bg-[var(--surface)]"
          style={{
            borderTop: "1px solid var(--border)",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          }}
        >
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={clearDisabled}
              className="flex-1 h-12 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ border: "1px solid var(--border)", color: "var(--ink)" }}
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-[2] h-12 rounded-xl text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--secondary))",
              color: "#fff",
            }}
          >
            {resultLabel ?? "Show results"}
          </button>
        </div>
      </div>
    </div>
  );
}
