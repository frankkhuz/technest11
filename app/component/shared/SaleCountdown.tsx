"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "2d 04h 10m" / "04:10:09" — the compact text form. */
export function countdownText(ms: number) {
  if (ms <= 0) return "Ended";
  const { d, h, m, s } = parts(ms);
  return d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * A self-ticking countdown. Only this component re-renders every second —
 * the product grid around it stays still. Digits are tabular and each
 * segment has a fixed width, so the timer never changes size as it ticks.
 *
 * `offset` = serverTime - Date.now(), so the clock follows the server.
 */
export default function SaleCountdown({
  endsAt,
  offset = 0,
  variant = "pill",
  prefix,
}: {
  endsAt: string | number | Date;
  offset?: number;
  variant?: "pill" | "boxes";
  prefix?: string;
}) {
  const end = new Date(endsAt).getTime();
  // null until mounted: server and first client render agree (no hydration
  // mismatch), and the reserved width keeps the layout still meanwhile.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const left = now === null ? null : end - (now + offset);

  if (variant === "boxes") {
    const p = left === null ? null : parts(left);
    const segs: [string, string][] = p
      ? [
          ...(p.d > 0 ? ([[String(p.d), "days"]] as [string, string][]) : []),
          [pad(p.h), "hrs"],
          [pad(p.m), "min"],
          [pad(p.s), "sec"],
        ]
      : [
          ["--", "hrs"],
          ["--", "min"],
          ["--", "sec"],
        ];
    return (
      <span className="inline-flex items-center gap-1.5" role="timer" aria-live="off">
        {prefix && <span className="text-xs font-semibold mr-1 opacity-90">{prefix}</span>}
        {segs.map(([v, label], i) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            {i > 0 && <span className="font-bold opacity-70">:</span>}
            <span
              className="num inline-flex flex-col items-center justify-center rounded-lg w-11 h-11"
              style={{ background: "rgba(0,0,0,0.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}
            >
              <span className="font-mono-tech text-base font-bold leading-none">{v}</span>
              <span className="text-[8px] uppercase tracking-wider opacity-75 mt-0.5">{label}</span>
            </span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className="font-mono-tech num inline-block min-w-[8ch] text-left" role="timer" aria-live="off">
      {prefix ? `${prefix} ` : ""}
      {left === null ? "--:--:--" : countdownText(left)}
    </span>
  );
}
