"use client";

import { useCallback, useEffect, useState } from "react";
import { Megaphone, Send, Users } from "lucide-react";
import { apiJson, jsonBody } from "@/app/lib/api";
import { Button, Field, ErrorText, Notice, Pill, SectionTitle, fieldClass, fieldStyle, formatDateTime, humanize } from "@/app/component/ui/kit";
import { SectionBody, ListState } from "./shared";

const AUDIENCES = ["everyone", "customers", "all_vendors", "approved_vendors", "pending_vendors"] as const;
type Audience = (typeof AUDIENCES)[number];

type Announcement = {
  _id: string;
  audience: Audience;
  title: string;
  message: string;
  sendEmail?: boolean;
  recipients?: number;
  emailsQueued?: number;
  emailsSent?: number;
  emailsFailed?: number;
  emailsSkipped?: number;
  emailStatus?: string;
  createdAt: string;
  createdByName?: string;
};

export default function AnnouncementsSection() {
  const [audience, setAudience] = useState<Audience>("everyone");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState<"dry" | "send" | null>(null);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [past, setPast] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const r = await apiJson<{ announcements: Announcement[] }>("/api/admin/announcements");
    setPast(r.data?.announcements ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Dry run whenever the audience changes, so the count is always shown.
  useEffect(() => {
    setCount(null);
    apiJson<{ recipients: number }>(
      "/api/admin/announcements",
      jsonBody({ audience, title: title || "x", message: message || "x", sendEmail, dryRun: true })
    ).then((r) => r.ok && setCount(r.data?.recipients ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience, sendEmail]);

  const send = async () => {
    if (!title.trim() || !message.trim()) return setMsg({ text: "Add a title and a message.", error: true });
    if (!window.confirm(`Send to ${count ?? "every person in"} ${humanize(audience).toLowerCase()}${sendEmail ? " (with email)" : ""}?`)) return;
    setBusy("send");
    const r = await apiJson<{ recipients: number; emailsQueued: number; emailsSkipped: number }>(
      "/api/admin/announcements",
      jsonBody({ audience, title: title.trim(), message: message.trim(), sendEmail })
    );
    setBusy(null);
    if (!r.ok) return setMsg({ text: r.message, error: true });
    setMsg({
      text: `Sent to ${r.data?.recipients ?? 0} people${sendEmail ? ` · ${r.data?.emailsQueued ?? 0} emails queued, ${r.data?.emailsSkipped ?? 0} skipped (opted out or over the daily limit)` : ""}.`,
    });
    setTitle("");
    setMessage("");
    load();
  };

  return (
    <SectionBody width="max-w-3xl">
      <div className="rounded-2xl p-5 space-y-3 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <p className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
          <Megaphone className="w-4 h-4" style={{ color: "var(--accent)" }} /> New announcement
        </p>
        <Field label="Send to">
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{
                  background: audience === a ? "var(--accent)" : "var(--bg)",
                  color: audience === a ? "#fff" : "var(--ink-soft)",
                  border: "1px solid var(--border)",
                }}
              >
                {humanize(a)}
              </button>
            ))}
          </div>
        </Field>
        {count !== null && (
          <p className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--ink-soft)" }}>
            <Users className="w-3.5 h-3.5" /> Reaches {count} {count === 1 ? "person" : "people"}
          </p>
        )}
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={fieldClass} style={fieldStyle} />
        </Field>
        <Field label="Message" hint="Separate paragraphs with a blank line.">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className={`${fieldClass} resize-y`} style={fieldStyle} />
        </Field>
        <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--ink)" }}>
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
          Also email it (capped to stay inside the free email quota; people who opted out are skipped)
        </label>
        {msg && (msg.error ? <ErrorText>{msg.text}</ErrorText> : <Notice tone="green">{msg.text}</Notice>)}
        <Button Icon={Send} onClick={send} loading={busy === "send"}>
          Send announcement
        </Button>
      </div>

      <SectionTitle>Sent</SectionTitle>
      <ListState loading={loading} empty={past.length === 0} EmptyIcon={Megaphone} emptyText="No announcements yet">
        <div className="space-y-2">
          {past.map((a) => (
            <div key={a._id} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {a.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    {humanize(a.audience)} · {a.recipients ?? "?"} people · {formatDateTime(a.createdAt)}
                    {a.createdByName ? ` · by ${a.createdByName}` : ""}
                  </p>
                </div>
                {a.sendEmail && (
                  <Pill size="xs" tone={a.emailStatus === "done" ? "green" : "amber"}>
                    Email {a.emailsSent ?? 0}/{a.emailsQueued ?? 0}
                    {a.emailsFailed ? ` · ${a.emailsFailed} failed` : ""}
                  </Pill>
                )}
              </div>
              <p className="text-xs mt-2 whitespace-pre-line line-clamp-3" style={{ color: "var(--ink)" }}>
                {a.message}
              </p>
            </div>
          ))}
        </div>
      </ListState>
    </SectionBody>
  );
}
