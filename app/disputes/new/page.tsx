"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale } from "lucide-react";
import { apiJson, jsonBody, uploadFiles } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import {
  DISPUTE_REASON_LABELS,
  type Dispute,
  type DisputeReason,
  type PendingReviewDeal,
  type ReviewSourceType,
} from "@/app/types/backend";
import EvidencePicker from "@/app/component/shared/EvidencePicker";
import {
  PageShell,
  Card,
  Field,
  Button,
  ErrorText,
  Notice,
  fieldClass,
  fieldStyle,
  formatDate,
  ACCENT,
} from "@/app/component/ui/kit";

const REASONS = Object.keys(DISPUTE_REASON_LABELS) as DisputeReason[];

function NewDispute() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isLoading } = useAuth();
  const presetType = params.get("type") as ReviewSourceType | null;
  const presetId = params.get("id");

  const [deals, setDeals] = useState<PendingReviewDeal[]>([]);
  const [source, setSource] = useState<{ type: ReviewSourceType; id: string } | null>(
    presetType && presetId ? { type: presetType, id: presetId } : null
  );
  const [reason, setReason] = useState<DisputeReason>("not_as_described");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/auth/login?from=${encodeURIComponent(`/disputes/new?${params.toString()}`)}`);
      return;
    }
    // Recently completed deals make a handy picker when we weren't sent here
    // from a specific order or request.
    apiJson<{ deals: PendingReviewDeal[] }>("/api/reviews/pending").then((r) => setDeals(r.data?.deals ?? []));
  }, [isLoading, user, router, params]);

  const submit = async () => {
    if (!source) return setError("Pick the deal this is about.");
    if (description.trim().length < 10) return setError("Describe what went wrong (at least a sentence).");
    setSaving(true);
    setError(null);
    try {
      const evidence = (await uploadFiles(photos)).map((f) => f.url);
      const r = await apiJson<{ dispute: Dispute }>(
        "/api/disputes",
        jsonBody({ source, reason, description: description.trim(), evidence })
      );
      if (!r.ok || !r.data) return setError(r.message);
      router.push(`/disputes/${r.data.dispute._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const presetDeal = deals.find((d) => d.id === presetId);

  return (
    <PageShell title="Report a problem" Icon={Scale} subtitle="Up to 7 days after a deal completes. The other side and TechNest staff are notified." width="max-w-2xl">
      <div className="space-y-4">
        <Card className="space-y-4">
          {presetType && presetId ? (
            <div className="rounded-xl p-3 text-sm" style={{ background: "var(--bg)", color: "var(--ink)" }}>
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                About
              </p>
              {presetDeal ? `${presetDeal.label} with ${presetDeal.subject.name}` : "The deal you came from"}
            </div>
          ) : (
            <Field label="Which deal?">
              {deals.length === 0 ? (
                <Notice tone="neutral">
                  No recent completed deals found. Open the order or request with the problem and choose “Report a problem” there.
                </Notice>
              ) : (
                <div className="space-y-2">
                  {deals.map((d) => {
                    const on = source?.id === d.id;
                    return (
                      <button
                        key={`${d.type}-${d.id}`}
                        onClick={() => setSource({ type: d.type, id: d.id })}
                        className="w-full text-left rounded-xl p-3"
                        style={{
                          border: `1.5px solid ${on ? ACCENT : "var(--border)"}`,
                          background: on ? "var(--accent-soft)" : "var(--bg)",
                          cursor: "pointer",
                        }}
                      >
                        <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                          {d.label}
                        </p>
                        <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                          with {d.subject.name} · completed {formatDate(d.completedAt)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </Field>
          )}

          <Field label="What's the problem?">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className="text-xs font-medium px-3 py-2.5 rounded-xl"
                  style={{
                    border: `1.5px solid ${reason === r ? ACCENT : "var(--border)"}`,
                    background: reason === r ? "var(--accent-soft)" : "var(--bg)",
                    color: "var(--ink)",
                    cursor: "pointer",
                  }}
                >
                  {DISPUTE_REASON_LABELS[r]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Tell us what happened">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="e.g. The phone was listed with 88% battery but shows 71%, and Face ID doesn't work."
              className={`${fieldClass} resize-none`}
              style={fieldStyle}
            />
          </Field>

          <Field label="Photos" optional hint="Up to 6 — screenshots, the device, the packaging.">
            <EvidencePicker files={photos} onChange={setPhotos} />
          </Field>
        </Card>
        {reason === "stolen_or_locked" && (
          <Notice tone="amber">If the device is locked to someone else&apos;s iCloud or Google account, include a photo of the lock screen.</Notice>
        )}
        <ErrorText>{error}</ErrorText>
        <Button onClick={submit} loading={saving} full>
          Submit
        </Button>
      </div>
    </PageShell>
  );
}

export default function NewDisputePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <NewDispute />
    </Suspense>
  );
}
