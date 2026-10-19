"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShieldAlert, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import { Button, Pill, type Tone } from "@/app/component/ui/kit";

type Check = string | { code?: string; id?: string; level?: string; severity?: string; message?: string; label?: string };
type Review = {
  checks?: Check[];
  aiReview?: { verdict?: string; summary?: string; issues?: string[]; recommendation?: string; createdAt?: string } | null;
  marketPrice?: { min?: number; max?: number; base?: number } | number | null;
  ai?: { enabled?: boolean; reason?: string };
  source?: string;
  aiReason?: string;
};

/** Friendly names for the automatic red-flag checks. */
export const CHECK_LABELS: Record<string, string> = {
  imei_missing: "No IMEI",
  imei_model_mismatch: "IMEI is a different model",
  imei_model_unknown: "IMEI model unknown",
  no_imei_photo: "No *#06# screenshot",
  snapchat_banned: "Snapchat banned",
  price_high: "Priced above market",
  price_low: "Priced suspiciously low",
  contact_in_text: "Contact details in text",
  no_photos: "No photos",
  duplicate: "Possible duplicate",
  new_account: "Brand-new account",
  reported_stolen: "Reported stolen",
};

function checkInfo(c: Check): { code: string; text: string; tone: Tone } {
  if (typeof c === "string") return { code: c, text: CHECK_LABELS[c] ?? c.replace(/_/g, " "), tone: "amber" };
  const code = c.code ?? c.id ?? "";
  const level = (c.level ?? c.severity ?? "").toLowerCase();
  return {
    code,
    text: c.message ?? c.label ?? CHECK_LABELS[code] ?? code.replace(/_/g, " "),
    tone: level === "high" || level === "error" || level === "danger" ? "red" : level === "info" || level === "ok" ? "neutral" : "amber",
  };
}

export function CheckChips({ checks }: { checks?: Check[] }) {
  if (!checks?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {checks.map((c, i) => {
        const { code, text, tone } = checkInfo(c);
        return (
          <Pill key={`${code}-${i}`} tone={tone} size="xs" Icon={tone === "red" ? ShieldAlert : AlertTriangle}>
            {text}
          </Pill>
        );
      })}
    </div>
  );
}

export default function ListingReviewAids({ listingId }: { listingId: string }) {
  const [data, setData] = useState<Review | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    apiJson<Review>(`/api/admin/listings/${listingId}/review`).then((r) => setData(r.data ?? {}));
  }, [listingId]);

  const runAi = async () => {
    setRunning(true);
    const r = await apiJson<Review>(`/api/admin/listings/${listingId}/review`, { method: "POST" });
    setRunning(false);
    if (r.data) setData((d) => ({ ...d, ...r.data }));
  };

  if (!data) return null;
  const market = data.marketPrice;
  const ai = data.aiReview;

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--border)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
          Review aids
        </p>
        <Button size="sm" variant="soft" Icon={Sparkles} onClick={runAi} loading={running}>
          {ai ? "Re-run AI review" : "AI review"}
        </Button>
      </div>
      {data.checks?.length ? (
        <CheckChips checks={data.checks} />
      ) : (
        <p className="inline-flex items-center gap-1 text-xs" style={{ color: "#16a34a" }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> No automatic red flags
        </p>
      )}
      {market !== null && market !== undefined && (
        <p className="text-xs" style={{ color: "var(--ink)" }}>
          Market price:{" "}
          {typeof market === "number"
            ? formatPrice(market)
            : market.min && market.max
              ? `${formatPrice(market.min)} – ${formatPrice(market.max)}`
              : formatPrice(market.base ?? 0)}
        </p>
      )}
      {ai && (
        <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: "var(--surface)" }}>
          <p className="font-semibold inline-flex items-center gap-1" style={{ color: "var(--ink)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} /> AI says: {ai.verdict ?? ai.recommendation ?? "—"}
          </p>
          {ai.summary && <p style={{ color: "var(--ink)" }}>{ai.summary}</p>}
          {ai.issues?.map((i) => (
            <p key={i} style={{ color: "#d97706" }}>
              • {i}
            </p>
          ))}
        </div>
      )}
      {(data.aiReason || (data.ai && data.ai.enabled === false)) && (
        <p className="inline-flex items-center gap-1 text-[11px]" style={{ color: "var(--ink-soft)" }}>
          <Info className="w-3 h-3" /> AI unavailable ({data.aiReason ?? data.ai?.reason}) — the free checks above still apply. You make the final call.
        </p>
      )}
    </div>
  );
}
