"use client";

import { useCallback, useEffect, useState } from "react";
import { History, ChevronDown } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { Button, fieldStyle, formatDateTime } from "@/app/component/ui/kit";
import { SectionBody, ListState, RefreshButton, adminInput } from "./shared";

type Entry = {
  _id?: string;
  actorName?: string;
  actor?: string;
  action: string;
  path?: string;
  targetId?: string;
  details?: unknown;
  status?: number;
  ip?: string;
  createdAt: string;
};

function EntryRow({ e, onTarget }: { e: Entry; onTarget: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-3 py-2.5 text-xs" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p style={{ color: "var(--ink)" }}>
            <strong>{e.actorName ?? "Admin"}</strong> · {e.action}
          </p>
          <p className="truncate" style={{ color: "var(--ink-soft)" }}>
            {e.path}
            {e.targetId && (
              <>
                {" · "}
                <button onClick={() => onTarget(e.targetId!)} className="font-mono-tech underline" style={{ color: "var(--accent)" }}>
                  {e.targetId}
                </button>
              </>
            )}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p style={{ color: "var(--ink-soft)" }}>{formatDateTime(e.createdAt)}</p>
          {e.details !== undefined && e.details !== null && (
            <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-0.5" style={{ color: "var(--accent)" }}>
              details <ChevronDown className="w-3 h-3" style={{ transform: open ? "rotate(180deg)" : undefined }} />
            </button>
          )}
        </div>
      </div>
      {open && (
        <pre className="mt-2 p-2 rounded-lg overflow-x-auto text-[10px] font-mono-tech" style={{ background: "var(--bg)", color: "var(--ink)" }}>
          {JSON.stringify(e.details, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AuditSection() {
  const [q, setQ] = useState("");
  const [targetId, setTargetId] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (p = 1) => {
      setLoading(p === 1);
      const qs = new URLSearchParams({ page: String(p) });
      if (q.trim()) qs.set("q", q.trim());
      if (targetId.trim()) qs.set("targetId", targetId.trim());
      const r = await apiJson<{ entries: Entry[]; page: number; pages: number }>(`/api/admin/audit?${qs}`);
      setError(r.ok ? null : r.message);
      setEntries((prev) => (p === 1 ? r.data?.entries ?? [] : [...prev, ...(r.data?.entries ?? [])]));
      setPage(r.data?.page ?? p);
      setPages(r.data?.pages ?? 1);
      setLoading(false);
    },
    [q, targetId]
  );

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <SectionBody width="max-w-4xl">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Action, e.g. approve, finance, products" className={`${adminInput} flex-1 min-w-[200px]`} style={fieldStyle} />
        <input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Record id" className={`${adminInput} w-44 font-mono-tech`} style={fieldStyle} />
        <RefreshButton onClick={() => load(1)} />
      </div>
      <p className="text-[11px] mb-3" style={{ color: "var(--ink-soft)" }}>
        Every admin change is recorded automatically and kept for two years.
      </p>
      <ListState loading={loading} error={error} empty={entries.length === 0} EmptyIcon={History} emptyText="Nothing recorded">
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", borderTop: "none" }}>
          {entries.map((e, i) => (
            <EntryRow key={e._id ?? i} e={e} onTarget={setTargetId} />
          ))}
        </div>
        {page < pages && (
          <div className="text-center mt-4">
            <Button size="sm" variant="outline" onClick={() => load(page + 1)}>
              Older
            </Button>
          </div>
        )}
      </ListState>
    </SectionBody>
  );
}
