"use client";

import { useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { apiJson, jsonBody, uploadFiles } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import {
  DISPUTE_REASON_LABELS,
  DISPUTE_RESOLUTION_LABELS,
  nameOf,
  type Dispute,
} from "@/app/types/backend";
import EvidencePicker from "@/app/component/shared/EvidencePicker";
import { Card, Button, ErrorText, StatusPill, fieldClass, fieldStyle, formatDateTime, ACCENT } from "@/app/component/ui/kit";

function Photos({ urls }: { urls?: string[] }) {
  if (!urls?.length) return null;
  return (
    <div className="flex gap-2 mt-2 flex-wrap">
      {urls.map((u) => (
        <a key={u} href={u} target="_blank" rel="noopener noreferrer">
          <img src={u} alt="Evidence" className="w-16 h-16 rounded-lg object-cover" />
        </a>
      ))}
    </div>
  );
}

/** The dispute summary and its message thread — the two sides and staff. */
export default function DisputeThread({
  dispute,
  onChange,
  viewerId,
}: {
  dispute: Dispute;
  onChange: (d: Dispute) => void;
  viewerId?: string;
}) {
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closed = dispute.status === "resolved" || dispute.status === "rejected";

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      const evidence = (await uploadFiles(photos)).map((f) => f.url);
      const r = await apiJson<{ dispute: Dispute }>(`/api/disputes/${dispute._id}/messages`, jsonBody({ text: text.trim(), evidence }));
      if (!r.ok || !r.data) return setError(r.message);
      onChange(r.data.dispute);
      setText("");
      setPhotos([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {DISPUTE_REASON_LABELS[dispute.reason] ?? dispute.reason}
            </p>
            <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
              {dispute.sourceLabel ?? dispute.label ?? "Deal"} · {nameOf(dispute.raisedBy)} vs {nameOf(dispute.against)} ·{" "}
              {formatDateTime(dispute.createdAt)}
            </p>
          </div>
          <StatusPill status={dispute.status} />
        </div>
        <p className="text-sm whitespace-pre-line" style={{ color: "var(--ink)" }}>
          {dispute.description}
        </p>
        <Photos urls={dispute.evidence} />
        {dispute.status === "resolved" && dispute.resolution && (
          <div className="mt-3 rounded-xl p-3 text-xs" style={{ background: "rgba(22,163,74,0.08)", color: "var(--ink)" }}>
            <p className="font-semibold" style={{ color: "#16a34a" }}>
              Decision: {DISPUTE_RESOLUTION_LABELS[dispute.resolution]}
              {dispute.refundAmount ? ` · ${formatPrice(dispute.refundAmount)}` : ""}
            </p>
            {dispute.resolutionNote && <p className="mt-0.5">{dispute.resolutionNote}</p>}
          </div>
        )}
        {dispute.status === "rejected" && (
          <div className="mt-3 rounded-xl p-3 text-xs" style={{ background: "rgba(220,38,38,0.06)", color: "var(--ink)" }}>
            <p className="font-semibold" style={{ color: "#DC2626" }}>
              Not upheld
            </p>
            {dispute.resolutionNote && <p className="mt-0.5">{dispute.resolutionNote}</p>}
          </div>
        )}
      </Card>

      <div className="space-y-2">
        {(dispute.messages ?? []).map((m, i) => {
          const staff = m.isStaff || m.role === "staff" || m.role === "admin";
          const mine = !!viewerId && m.author === viewerId;
          return (
            <div key={m._id ?? i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3"
                style={{
                  background: staff ? "var(--accent-soft)" : mine ? "var(--surface)" : "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <p className="inline-flex items-center gap-1 text-[11px] font-semibold mb-0.5" style={{ color: staff ? ACCENT : "var(--ink-soft)" }}>
                  {staff && <ShieldCheck className="w-3 h-3" />}
                  {staff ? "TechNest" : m.authorName ?? (mine ? "You" : "Other side")} · {formatDateTime(m.createdAt)}
                </p>
                <p className="text-sm whitespace-pre-line" style={{ color: "var(--ink)" }}>
                  {m.text}
                </p>
                <Photos urls={m.evidence} />
              </div>
            </div>
          );
        })}
      </div>

      {closed ? (
        <p className="text-xs text-center" style={{ color: "var(--ink-soft)" }}>
          This dispute is closed.
        </p>
      ) : (
        <Card className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Add a message or more details…"
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <EvidencePicker files={photos} onChange={setPhotos} />
            <Button Icon={Send} onClick={send} loading={sending} disabled={!text.trim()}>
              Send
            </Button>
          </div>
          <ErrorText>{error}</ErrorText>
        </Card>
      )}
    </div>
  );
}
