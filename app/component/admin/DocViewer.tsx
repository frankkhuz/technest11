"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ExternalLink, FileText, ImageOff, X, ZoomIn, ZoomOut } from "lucide-react";

export type Doc = { url?: string | null; label: string; mime?: string | null };

/** PDFs (and Cloudinary "raw" uploads) can't go in an <img>. Uses the
 * backend's mime type when given, otherwise guesses from the URL. */
export const isPdf = (url?: string | null, mime?: string | null) =>
  mime
    ? /pdf/i.test(mime)
    : !!url && (/\.pdf($|[?#])/i.test(url) || /\/raw\/upload\//.test(url) || /format=pdf/i.test(url));

/**
 * Full-screen, in-page viewer for submitted documents and photos, so an
 * admin can inspect everything before approving without juggling tabs.
 * Images: click / zoom button toggles fit ↔ full size (scrollable).
 * PDFs: embedded. ← / → and Esc work; "Open" still gives a new tab.
 */
export function DocViewer({ docs, index, onClose }: { docs: Doc[]; index: number; onClose: () => void }) {
  const list = docs.filter((d) => d.url);
  const [i, setI] = useState(Math.max(0, Math.min(index, list.length - 1)));
  const [zoom, setZoom] = useState(false);
  const [broken, setBroken] = useState(false);
  const doc = list[i];

  const n = list.length;
  const go = (d: number) => {
    setI((cur) => (cur + d + n) % n);
    setZoom(false);
    setBroken(false);
  };

  useEffect(() => {
    const move = (d: number) => {
      setI((cur) => (cur + d + n) % n);
      setZoom(false);
      setBroken(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && n > 1) move(1);
      if (e.key === "ArrowLeft" && n > 1) move(-1);
    };
    document.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
    };
  }, [onClose, n]);

  if (!doc?.url) return null;
  const pdf = isPdf(doc.url, doc.mime);

  // Portal to <body>: rendered inside an admin panel, the overlay would be
  // trapped under that panel's stacking context (and the sticky header).
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={doc.label}
      className="fixed inset-0 z-[120] flex flex-col"
      style={{ background: "rgba(8,6,12,0.97)" }}
    >
      <div
        className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-white"
        style={{ paddingTop: "max(10px, env(safe-area-inset-top))", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <p className="text-sm font-semibold truncate flex-1 min-w-0">
          {doc.label}
          {list.length > 1 && <span className="num ml-2 text-white/50 font-normal">{i + 1} / {list.length}</span>}
        </p>
        {!pdf && !broken && (
          <button
            onClick={() => setZoom((z) => !z)}
            aria-label={zoom ? "Fit to screen" : "Full size"}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10"
          >
            {zoom ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
        )}
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 px-3 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold hover:bg-white/10"
        >
          <ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">Open in new tab</span>
        </a>
        <button onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className={`relative flex-1 min-h-0 ${zoom ? "overflow-auto" : "overflow-hidden flex items-center justify-center"} p-2 sm:p-6`}>
        {pdf ? (
          <iframe src={doc.url} title={doc.label} className="w-full h-full rounded-lg bg-white" />
        ) : broken ? (
          <div className="text-center text-white/70 text-sm">
            <ImageOff className="w-10 h-10 mx-auto mb-3 opacity-60" />
            This file can&apos;t be previewed here (the signed link may have expired).
            <br />
            Try &ldquo;Open in new tab&rdquo;, or refresh the admin panel for a fresh link.
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.url}
            alt={doc.label}
            onClick={() => setZoom((z) => !z)}
            onError={() => setBroken(true)}
            className={zoom ? "max-w-none cursor-zoom-out" : "max-w-full max-h-full object-contain cursor-zoom-in rounded-lg"}
          />
        )}

        {list.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

/** A thumbnail tile that opens the viewer. Shows a placeholder when missing. */
export function DocTile({
  doc,
  onOpen,
  aspect = "4/3",
}: {
  doc: Doc;
  onOpen?: () => void;
  aspect?: string;
}) {
  const [broken, setBroken] = useState(false);
  const pdf = isPdf(doc.url, doc.mime);
  const missing = !doc.url;
  return (
    <button
      type="button"
      onClick={missing ? undefined : onOpen}
      disabled={missing}
      className="group relative block w-full rounded-lg overflow-hidden text-left disabled:cursor-not-allowed"
      style={{ background: "var(--border)", aspectRatio: aspect }}
      aria-label={missing ? `${doc.label} — not submitted` : `View ${doc.label}`}
    >
      {!missing && !pdf && !broken && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doc.url!}
          alt={doc.label}
          loading="lazy"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      )}
      {(missing || pdf || broken) && (
        // pb-7 keeps the icon/text clear of the label pill along the bottom
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-2 pt-2 pb-7 text-center" style={{ color: "var(--ink-soft)" }}>
          {missing ? <ImageOff className="w-6 h-6 opacity-60" /> : <FileText className="w-7 h-7" style={{ color: "var(--accent)" }} />}
          <span className="text-[11px] font-medium leading-tight">{missing ? "Not submitted" : pdf ? "PDF" : "View"}</span>
        </span>
      )}
      <span
        className="absolute bottom-1 left-1 right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded truncate"
        style={{ background: "rgba(0,0,0,0.6)", color: "#fff", width: "fit-content", maxWidth: "calc(100% - 8px)" }}
      >
        {doc.label}
      </span>
    </button>
  );
}

/** Tiny helper: a gallery of tiles sharing one viewer. */
export function DocGallery({ docs, className = "grid grid-cols-2 sm:grid-cols-3 gap-2", aspect }: { docs: Doc[]; className?: string; aspect?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const viewable = docs.filter((d) => d.url);
  return (
    <>
      <div className={className}>
        {docs.map((d, k) => (
          <DocTile key={`${d.label}-${k}`} doc={d} aspect={aspect} onOpen={() => setOpen(viewable.indexOf(d))} />
        ))}
      </div>
      {open !== null && open >= 0 && <DocViewer docs={viewable} index={open} onClose={() => setOpen(null)} />}
    </>
  );
}
