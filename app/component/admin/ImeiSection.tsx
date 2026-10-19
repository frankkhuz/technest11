"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldAlert, Database, HelpCircle, Shuffle, Check, X, Undo2, Plus, Upload } from "lucide-react";
import { apiJson, jsonBody } from "@/app/lib/api";
import type { StolenReport } from "@/app/types/backend";
import { Button, StatusPill, Notice, ErrorText, Chip, fieldStyle, formatDate, formatDateTime } from "@/app/component/ui/kit";
import { SectionBody, FilterChips, ListState, RefreshButton, SearchBox, adminInput } from "./shared";

type View = "reports" | "tac" | "unknown" | "mismatches";
const REPORT_STATUSES = ["pending", "confirmed", "rejected", "recovered"] as const;

type Tac = { tac: string; brand: string; model: string; deviceType?: string; active?: boolean; source?: string };
type UnknownCode = { tac: string; count: number; deviceNames: string[]; lastSeen: string };
type Mismatch = UnknownCode & { tacBrand: string; tacModel: string; listingIds: string[] };

function Reports() {
  const [status, setStatus] = useState<(typeof REPORT_STATUSES)[number]>("pending");
  const [rows, setRows] = useState<StolenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiJson<{ reports: StolenReport[] }>(`/api/admin/imei/stolen-reports?status=${status}`);
    setError(r.ok ? null : r.message);
    setRows(r.data?.reports ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const decide = async (rep: StolenReport, next: "confirmed" | "rejected" | "recovered") => {
    if (next === "confirmed" && !window.confirm("Confirm this report? Any open listing with this IMEI is taken down and its requests cancelled.")) return;
    const reviewNotes = window.prompt("Notes for the reporter (optional):") ?? undefined;
    setBusy(rep._id);
    const r = await apiJson<{ listingsRemoved?: number }>(`/api/admin/imei/stolen-reports/${rep._id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: next, reviewNotes: reviewNotes?.trim() || undefined }),
    });
    setBusy(null);
    if (!r.ok) return setMsg(r.message);
    setMsg(next === "confirmed" ? `Confirmed — ${r.data?.listingsRemoved ?? 0} listing(s) taken down.` : `Marked ${next}.`);
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <FilterChips options={REPORT_STATUSES} value={status} onChange={setStatus} />
        <RefreshButton onClick={load} />
      </div>
      {msg && (
        <div className="mb-3">
          <Notice tone="neutral">{msg}</Notice>
        </div>
      )}
      <ListState loading={loading} error={error} empty={rows.length === 0} EmptyIcon={ShieldAlert} emptyText="No reports here">
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r._id} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {r.brand} {r.model} · <span className="font-mono-tech">{r.imei ?? `…${r.imeiLast4}`}</span>
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    {r.reporter?.name} {r.reporter?.email ? `(${r.reporter.email})` : ""} · {r.policeStation}
                    {r.incidentDate ? ` · stolen ${formatDate(r.incidentDate)}` : ""} · reported {formatDate(r.createdAt)}
                  </p>
                  {r.description && (
                    <p className="text-xs mt-1" style={{ color: "var(--ink)" }}>
                      {r.description}
                    </p>
                  )}
                  {r.policeReportUrl && (
                    <a href={r.policeReportUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                      View police extract →
                    </a>
                  )}
                  {!!r.hits?.length && (
                    <p className="text-xs mt-1" style={{ color: "#DC2626" }}>
                      Latest hits:{" "}
                      {r.hits
                        .slice(0, 3)
                        .map((h) => `${h.kind ?? h.type ?? "check"} ${formatDateTime(h.at ?? h.createdAt)}`)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <StatusPill status={r.status} />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {r.status === "pending" && (
                  <>
                    <Button size="sm" Icon={Check} onClick={() => decide(r, "confirmed")} loading={busy === r._id}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="danger" Icon={X} onClick={() => decide(r, "rejected")} disabled={busy === r._id}>
                      Reject
                    </Button>
                  </>
                )}
                {r.status === "confirmed" && (
                  <Button size="sm" variant="outline" Icon={Undo2} onClick={() => decide(r, "recovered")} loading={busy === r._id}>
                    Close as recovered
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ListState>
    </>
  );
}

function TacTable() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Tac[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ tac: "", brand: "", model: "", deviceType: "phone" });
  const [csv, setCsv] = useState("");
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiJson<{ devices: Tac[]; total: number }>(`/api/admin/imei/tac?q=${encodeURIComponent(q)}`);
    setRows(r.data?.devices ?? []);
    setTotal(r.data?.total ?? 0);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const save = async () => {
    if (!/^\d{8}$/.test(form.tac)) return setMsg({ text: "A TAC is the first 8 digits of an IMEI.", error: true });
    setBusy("save");
    const r = await apiJson("/api/admin/imei/tac", jsonBody({ ...form, active: true }));
    setBusy(null);
    setMsg(r.ok ? { text: `Saved ${form.tac}.` } : { text: r.message, error: true });
    if (r.ok) {
      setForm({ tac: "", brand: "", model: "", deviceType: "phone" });
      load();
    }
  };

  const importCsv = async () => {
    setBusy("import");
    const r = await apiJson<{ added: number; updated: number; skippedManual: number; problems: unknown[] }>(
      "/api/admin/imei/tac/import",
      jsonBody({ csv })
    );
    setBusy(null);
    if (!r.ok || !r.data) return setMsg({ text: r.message, error: true });
    setMsg({
      text: `Added ${r.data.added}, updated ${r.data.updated}, kept ${r.data.skippedManual} hand-entered, ${r.data.problems?.length ?? 0} problem line(s).`,
    });
    setCsv("");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
            <Plus className="w-4 h-4" /> Add or correct one code
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.tac} onChange={(e) => setForm({ ...form, tac: e.target.value.replace(/\D/g, "").slice(0, 8) })} placeholder="TAC (8 digits)" className={`${adminInput} font-mono-tech`} style={fieldStyle} />
            <select value={form.deviceType} onChange={(e) => setForm({ ...form, deviceType: e.target.value })} className={adminInput} style={fieldStyle}>
              {["phone", "tablet", "wearable", "other"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand" className={adminInput} style={fieldStyle} />
            <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model" className={adminInput} style={fieldStyle} />
          </div>
          <Button size="sm" onClick={save} loading={busy === "save"}>
            Save
          </Button>
        </div>
        <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
            <Upload className="w-4 h-4" /> Paste CSV
          </p>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={3}
            placeholder={"tac,brand,model[,deviceType]\n35391110,Apple,iPhone 13 Pro,phone"}
            className={`${adminInput} w-full font-mono-tech resize-y`}
            style={fieldStyle}
          />
          <p className="text-[10px]" style={{ color: "var(--ink-soft)" }}>
            About 250 lines per paste. Hand-entered codes are never overwritten.
          </p>
          <Button size="sm" onClick={importCsv} loading={busy === "import"} disabled={!csv.trim()}>
            Import
          </Button>
        </div>
      </div>
      {msg && (msg.error ? <ErrorText>{msg.text}</ErrorText> : <Notice tone="green">{msg.text}</Notice>)}
      <SearchBox value={q} onChange={setQ} placeholder="Search TAC, brand or model…" />
      <ListState loading={loading} empty={rows.length === 0} EmptyIcon={Database} emptyText="No codes match">
        <p className="text-xs mb-2" style={{ color: "var(--ink-soft)" }}>
          Showing {rows.length} of {total}
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {rows.map((t, i) => (
            <div key={t.tac} className="flex items-center gap-3 px-3 py-2 text-xs" style={{ background: "var(--surface)", borderTop: i ? "1px solid var(--border)" : undefined }}>
              <span className="font-mono-tech w-20 flex-shrink-0" style={{ color: "var(--ink)" }}>
                {t.tac}
              </span>
              <span className="flex-1 truncate" style={{ color: "var(--ink)" }}>
                {t.brand} {t.model}
              </span>
              <span style={{ color: "var(--ink-soft)" }}>{t.deviceType}</span>
              {t.active === false && <span style={{ color: "#DC2626" }}>inactive</span>}
            </div>
          ))}
        </div>
      </ListState>
    </div>
  );
}

function CodeList({ kind }: { kind: "unknown" | "mismatches" }) {
  const [rows, setRows] = useState<Mismatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<{ codes: Mismatch[] }>(`/api/admin/imei/tac/${kind}`).then((r) => {
      setRows(r.data?.codes ?? []);
      setLoading(false);
    });
  }, [kind]);

  return (
    <>
      <p className="text-xs mb-3" style={{ color: "var(--ink-soft)" }}>
        {kind === "unknown"
          ? "IMEI model codes seen on listings that aren't in the TAC table yet — fill them in so future listings get checked."
          : "Listings whose IMEI belongs to a different model than the seller typed. Many on one code can mean the TAC entry itself is wrong."}
      </p>
      <ListState loading={loading} empty={rows.length === 0} EmptyIcon={kind === "unknown" ? HelpCircle : Shuffle} emptyText="Nothing to fix">
        <div className="space-y-2">
          {rows.map((c) => (
            <div key={c.tac} className="rounded-xl p-3 text-xs" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-tech font-semibold" style={{ color: "var(--ink)" }}>
                  {c.tac}
                  {kind === "mismatches" && (
                    <span className="font-sans font-normal" style={{ color: "var(--ink-soft)" }}>
                      {" "}
                      · table says {c.tacBrand} {c.tacModel}
                    </span>
                  )}
                </span>
                <span style={{ color: "var(--ink-soft)" }}>
                  {c.count}× · last {formatDate(c.lastSeen)}
                </span>
              </div>
              <p className="mt-1" style={{ color: "var(--ink)" }}>
                Sellers typed: {c.deviceNames.slice(0, 5).join(", ")}
              </p>
            </div>
          ))}
        </div>
      </ListState>
    </>
  );
}

export default function ImeiSection() {
  const [view, setView] = useState<View>("reports");
  return (
    <SectionBody>
      <div className="flex gap-2 mb-5 flex-wrap">
        {(
          [
            ["reports", "Stolen reports"],
            ["tac", "TAC table"],
            ["unknown", "Unknown codes"],
            ["mismatches", "Model mismatches"],
          ] as [View, string][]
        ).map(([v, label]) => (
          <Chip key={v} active={view === v} onClick={() => setView(v)}>
            {label}
          </Chip>
        ))}
      </div>
      {view === "reports" && <Reports />}
      {view === "tac" && <TacTable />}
      {(view === "unknown" || view === "mismatches") && <CodeList key={view} kind={view} />}
    </SectionBody>
  );
}
