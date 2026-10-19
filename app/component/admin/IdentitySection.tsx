"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Check, X, ExternalLink } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { ID_TYPE_LABELS } from "@/app/types/backend";
import { Button, Pill, ErrorText, formatDateTime } from "@/app/component/ui/kit";
import { SectionBody, FilterChips, ListState, RefreshButton } from "./shared";

const STATUSES = ["pending", "verified", "rejected"] as const;

type Person = {
  userId: string;
  name: string;
  email: string;
  userType?: string;
  identity: {
    fullName?: string;
    idType?: string;
    bankName?: string;
    accountLast4?: string;
    accountName?: string;
    nameMatch?: boolean | "match" | "mismatch" | "partial" | null;
    submittedAt?: string;
    idDocumentUrl?: string;
    selfieUrl?: string;
    rejectionReason?: string;
  };
};

function matchTone(m: Person["identity"]["nameMatch"]) {
  if (m === true || m === "match") return { tone: "green" as const, label: "Bank name matches ID" };
  if (m === false || m === "mismatch") return { tone: "red" as const, label: "Bank name doesn't match" };
  if (m === "partial") return { tone: "amber" as const, label: "Partial name match" };
  return { tone: "neutral" as const, label: "Bank name not checked" };
}

export default function IdentitySection() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("pending");
  const [rows, setRows] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiJson<{ people: Person[] }>(`/api/admin/identity?status=${status}`);
    setError(r.ok ? null : r.message);
    setRows(r.data?.people ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const decide = async (p: Person, next: "verified" | "rejected") => {
    let reason: string | undefined;
    if (next === "rejected") {
      const v = window.prompt("Reason (shown to the user), e.g. 'ID photo is blurry':");
      if (v === null) return;
      reason = v.trim() || undefined;
    }
    setBusy(p.userId);
    const r = await apiJson(`/api/admin/identity/${p.userId}`, { method: "PATCH", body: JSON.stringify({ status: next, reason }) });
    setBusy(null);
    if (!r.ok) return setActionError(r.message);
    setActionError(null);
    setRows((xs) => xs.filter((x) => x.userId !== p.userId));
  };

  return (
    <SectionBody>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <FilterChips options={STATUSES} value={status} onChange={setStatus} />
        <RefreshButton onClick={load} />
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--ink-soft)" }}>
        Photo links are signed and expire — refresh if one stops opening.
      </p>
      {actionError && (
        <div className="mb-3">
          <ErrorText>{actionError}</ErrorText>
        </div>
      )}
      <ListState loading={loading} error={error} empty={rows.length === 0} EmptyIcon={ShieldCheck} emptyText="No identity checks here">
        <div className="grid md:grid-cols-2 gap-3">
          {rows.map((p) => {
            const m = matchTone(p.identity.nameMatch);
            return (
              <div key={p.userId} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  {p.identity.fullName ?? p.name}
                </p>
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  {p.name} · {p.email} · {p.userType}
                </p>
                <div className="grid grid-cols-2 gap-2 my-3">
                  {[
                    { url: p.identity.idDocumentUrl, label: ID_TYPE_LABELS[p.identity.idType ?? ""] ?? "ID" },
                    { url: p.identity.selfieUrl, label: "Selfie" },
                  ].map(({ url, label }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden relative"
                      style={{ background: "var(--border)", aspectRatio: "4/3" }}
                    >
                      {url && <img src={url} alt={label} className="w-full h-full object-cover" />}
                      <span className="absolute bottom-1 left-1 text-[10px] font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-1" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                        {label} <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </a>
                  ))}
                </div>
                <div className="space-y-1 text-xs mb-3" style={{ color: "var(--ink)" }}>
                  <p>
                    Bank: {p.identity.bankName} ····{p.identity.accountLast4}
                    {p.identity.accountName ? ` · “${p.identity.accountName}”` : ""}
                  </p>
                  <Pill tone={m.tone} size="xs">
                    {m.label}
                  </Pill>
                  <p style={{ color: "var(--ink-soft)" }}>Submitted {formatDateTime(p.identity.submittedAt)}</p>
                  {p.identity.rejectionReason && <p style={{ color: "#DC2626" }}>Rejected: {p.identity.rejectionReason}</p>}
                </div>
                {status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" Icon={Check} onClick={() => decide(p, "verified")} loading={busy === p.userId}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" Icon={X} onClick={() => decide(p, "rejected")} disabled={busy === p.userId}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ListState>
    </SectionBody>
  );
}
