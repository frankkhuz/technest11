"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Zap, ZapOff, FileSpreadsheet, Save } from "lucide-react";
import { apiJson, jsonBody } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import type { Product } from "@/app/lib/products";
import { Button, Notice, ErrorText, Pill, Chip, fieldStyle } from "@/app/component/ui/kit";
import { SectionBody, SearchBox, ListState, RefreshButton, adminInput } from "./shared";

type AdminProduct = Product & { _id?: string; isActive?: boolean; category?: string };
type BulkRow = { line: number; slug?: string; action: "create" | "update" | "error"; error?: string };
type BulkResult = { created: number; updated: number; failed: number; dryRun: boolean; rows: BulkRow[] };

const keyOf = (p: AdminProduct) => p.slug ?? p.id;

function BulkCsv({ onDone }: { onDone: () => void }) {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<BulkResult | null>(null);
  const [busy, setBusy] = useState<"dry" | "real" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (dryRun: boolean) => {
    setBusy(dryRun ? "dry" : "real");
    setError(null);
    const r = await apiJson<BulkResult>("/api/products/bulk", jsonBody({ csv, dryRun }));
    setBusy(null);
    if (!r.ok || !r.data) return setError(r.message);
    setResult(r.data);
    if (!dryRun) {
      setCsv("");
      onDone();
    }
  };

  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
        <FileSpreadsheet className="w-4 h-4" style={{ color: "#16a34a" }} /> Bulk add / update from CSV
      </p>
      <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
        Columns: slug, type, name, brand, category, priceUkUsed, priceBrandNew, storage|colors|tags (separate with |), ram, spec, badge,
        image, inStock (yes/no), stock. Any other column is a category filter (e.g. connectivity). Existing slugs are updated; blank cells
        are left alone. Up to 1,000 rows.
      </p>
      <label className="inline-block text-xs font-semibold cursor-pointer" style={{ color: "var(--accent)" }}>
        Choose file…
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              setCsv(await f.text());
              setResult(null);
            }
            e.target.value = "";
          }}
        />
      </label>
      <textarea
        value={csv}
        onChange={(e) => {
          setCsv(e.target.value);
          setResult(null);
        }}
        rows={4}
        placeholder="…or paste CSV here"
        className={`${adminInput} w-full font-mono-tech resize-y`}
        style={fieldStyle}
      />
      {result && (
        <Notice tone={result.failed ? "amber" : "green"}>
          <p className="font-semibold">
            {result.dryRun ? "Preview: " : "Done: "}
            {result.created} new, {result.updated} updated, {result.failed} with errors
          </p>
          {result.rows.filter((r) => r.action === "error").length > 0 && (
            <ul className="mt-1 max-h-32 overflow-y-auto">
              {result.rows
                .filter((r) => r.action === "error")
                .map((r) => (
                  <li key={r.line}>
                    Line {r.line}
                    {r.slug ? ` (${r.slug})` : ""}: {r.error}
                  </li>
                ))}
            </ul>
          )}
        </Notice>
      )}
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button size="sm" variant="soft" onClick={() => run(true)} loading={busy === "dry"} disabled={!csv.trim() || !!busy}>
          Preview
        </Button>
        <Button size="sm" onClick={() => run(false)} loading={busy === "real"} disabled={!result?.dryRun || !!busy || result.created + result.updated === 0}>
          Apply
        </Button>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const [rows, setRows] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [onlySale, setOnlySale] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});
  const [sale, setSale] = useState({ percentOff: "15", endsAt: "", startsAt: "", label: "Flash Sale" });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiJson<{ products: AdminProduct[] }>("/api/admin/products");
    setError(r.ok ? null : r.message);
    setRows(r.data?.products ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const shown = useMemo(() => {
    const needle = q.toLowerCase();
    return rows.filter(
      (p) =>
        (!onlySale || p.sale?.active) &&
        (!needle || p.name.toLowerCase().includes(needle) || p.brand?.toLowerCase().includes(needle) || keyOf(p).includes(needle))
    );
  }, [rows, q, onlySale]);

  const toggle = (k: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const saveStock = async (p: AdminProduct) => {
    const raw = stockEdits[keyOf(p)];
    setBusy(`stock-${keyOf(p)}`);
    const stockQuantity = raw === "" ? null : Number(raw);
    const r = await apiJson(`/api/products/${encodeURIComponent(keyOf(p))}`, {
      method: "PATCH",
      body: JSON.stringify({ stockQuantity, inStock: stockQuantity === null ? p.inStock : stockQuantity > 0 }),
    });
    setBusy(null);
    if (!r.ok) return setMsg({ text: r.message, error: true });
    setRows((xs) => xs.map((x) => (keyOf(x) === keyOf(p) ? { ...x, stockQuantity, inStock: stockQuantity === null ? x.inStock : stockQuantity > 0 } : x)));
    setStockEdits((s) => {
      const next = { ...s };
      delete next[keyOf(p)];
      return next;
    });
  };

  const startSale = async () => {
    if (!selected.size) return setMsg({ text: "Tick the products to put on sale.", error: true });
    if (!sale.endsAt) return setMsg({ text: "Pick when the sale ends.", error: true });
    setBusy("sale");
    const r = await apiJson<{ updated: number; notFound: string[] }>(
      "/api/products/flash-sale",
      jsonBody({
        slugs: [...selected],
        percentOff: Number(sale.percentOff),
        endsAt: new Date(sale.endsAt).toISOString(),
        startsAt: sale.startsAt ? new Date(sale.startsAt).toISOString() : undefined,
        label: sale.label || undefined,
      })
    );
    setBusy(null);
    if (!r.ok) return setMsg({ text: r.message, error: true });
    setMsg({ text: `${r.data?.updated ?? 0} product(s) on sale${r.data?.notFound?.length ? ` · not found: ${r.data.notFound.join(", ")}` : ""}.` });
    setSelected(new Set());
    load();
  };

  const endSale = async () => {
    const slugs = selected.size ? [...selected] : rows.filter((p) => p.sale?.active).map(keyOf);
    if (!slugs.length) return;
    if (!window.confirm(`End the sale on ${slugs.length} product(s) now?`)) return;
    setBusy("end");
    const r = await apiJson("/api/products/flash-sale", { method: "DELETE", body: JSON.stringify({ slugs }) });
    setBusy(null);
    if (!r.ok) return setMsg({ text: r.message, error: true });
    setMsg({ text: "Sale ended." });
    setSelected(new Set());
    load();
  };

  return (
    <SectionBody>
      <div className="grid lg:grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-4 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
            <Zap className="w-4 h-4" style={{ color: "var(--accent)" }} /> Flash sale ({selected.size} selected)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
              % off
              <input value={sale.percentOff} onChange={(e) => setSale({ ...sale, percentOff: e.target.value.replace(/\D/g, "") })} className={`${adminInput} w-full mt-1`} style={fieldStyle} />
            </label>
            <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
              Label
              <input value={sale.label} onChange={(e) => setSale({ ...sale, label: e.target.value })} className={`${adminInput} w-full mt-1`} style={fieldStyle} />
            </label>
            <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
              Starts (optional)
              <input type="datetime-local" value={sale.startsAt} onChange={(e) => setSale({ ...sale, startsAt: e.target.value })} className={`${adminInput} w-full mt-1`} style={fieldStyle} />
            </label>
            <label className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
              Ends
              <input type="datetime-local" value={sale.endsAt} onChange={(e) => setSale({ ...sale, endsAt: e.target.value })} className={`${adminInput} w-full mt-1`} style={fieldStyle} />
            </label>
          </div>
          <p className="text-[10px]" style={{ color: "var(--ink-soft)" }}>
            Prices round to the nearest ₦100. For exact prices, edit a product&apos;s sale directly.
          </p>
          <div className="flex gap-2">
            <Button size="sm" Icon={Zap} onClick={startSale} loading={busy === "sale"}>
              Start sale
            </Button>
            <Button size="sm" variant="danger" Icon={ZapOff} onClick={endSale} loading={busy === "end"}>
              End {selected.size ? "selected" : "all"} sales
            </Button>
          </div>
        </div>
        <BulkCsv onDone={load} />
      </div>

      {msg && <div className="mb-3">{msg.error ? <ErrorText>{msg.text}</ErrorText> : <Notice tone="green">{msg.text}</Notice>}</div>}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <SearchBox value={q} onChange={setQ} placeholder="Search products…" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Chip active={onlySale} onClick={() => setOnlySale((v) => !v)}>
            On sale
          </Chip>
          <RefreshButton onClick={load} />
        </div>
      </div>

      <ListState loading={loading} error={error} empty={shown.length === 0} EmptyIcon={Boxes} emptyText="No products">
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {shown.map((p, i) => {
            const k = keyOf(p);
            const edit = stockEdits[k];
            return (
              <div
                key={k}
                className="flex flex-wrap items-center gap-3 px-3 py-2.5"
                style={{ background: "var(--surface)", borderTop: i ? "1px solid var(--border)" : undefined, opacity: p.isActive === false ? 0.5 : 1 }}
              >
                <input type="checkbox" checked={selected.has(k)} onChange={() => toggle(k)} aria-label={`Select ${p.name}`} />
                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                    {p.name}{" "}
                    <span className="font-mono-tech text-[10px]" style={{ color: "var(--ink-soft)" }}>
                      {k}
                    </span>
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                    {p.category} · UK used {formatPrice(p.priceUkUsed)} · new {formatPrice(p.priceBrandNew)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {p.sale?.active && (
                    <Pill tone="red" size="xs" Icon={Zap}>
                      {formatPrice(p.sale.priceUkUsed ?? 0)}
                    </Pill>
                  )}
                  {!p.inStock && <Pill tone="neutral" size="xs">Out of stock</Pill>}
                  {p.lowStock && p.inStock && <Pill tone="amber" size="xs">Low</Pill>}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    value={edit ?? (p.stockQuantity ?? "").toString()}
                    onChange={(e) => setStockEdits((s) => ({ ...s, [k]: e.target.value.replace(/\D/g, "") }))}
                    placeholder="∞"
                    title="Units in stock (blank = not counted)"
                    className={`${adminInput} w-16 text-center`}
                    style={fieldStyle}
                  />
                  {edit !== undefined && (
                    <button onClick={() => saveStock(p)} disabled={busy === `stock-${k}`} aria-label="Save stock" style={{ color: "var(--accent)" }}>
                      <Save className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ListState>
    </SectionBody>
  );
}
