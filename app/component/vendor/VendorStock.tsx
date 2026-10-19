"use client";

import { useEffect, useRef, useState } from "react";
import { Boxes, Plus, UploadCloud, FileSpreadsheet, CheckCircle2, Download } from "lucide-react";
import { apiJson, jsonBody } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import {
  Card,
  Button,
  EmptyState,
  ErrorText,
  Field,
  Notice,
  SectionTitle,
  StatusPill,
  fieldClass,
  fieldStyle,
} from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

type StockItem = {
  _id: string;
  deviceName: string;
  buyPrice: number;
  sellPrice: number;
  condition?: string;
  storage?: string;
  category?: string;
  status: "in_stock" | "sold";
};

type BulkResult = {
  added: number;
  failed: number;
  dryRun: boolean;
  errors: { line: number; error: string }[];
};

const CONDITIONS = ["UK Used", "New", "Refurbished", "Nigerian Used"];
const CSV_TEMPLATE =
  "deviceName,buyPrice,sellPrice,condition,storage,category,quantity\n" +
  "iPhone 13 Pro,520000,610000,UK Used,256GB,phone,2\n" +
  "AirPods Pro 2,140000,175000,New,,audio,5\n";

function BulkUpload({ onDone }: { onDone: () => void }) {
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [checking, setChecking] = useState<"dry" | "real" | null>(null);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (dryRun: boolean) => {
    if (!csv.trim()) return setError("Paste your CSV or choose a file first.");
    setChecking(dryRun ? "dry" : "real");
    setError(null);
    const r = await apiJson<BulkResult>("/api/vendor/inventory/bulk", jsonBody({ csv, dryRun }));
    setChecking(null);
    if (!r.ok || !r.data) return setError(r.message);
    setResult(r.data);
    if (!dryRun && r.data.added > 0) {
      setCsv("");
      setFileName(null);
      onDone();
    }
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "technest-stock-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
            <FileSpreadsheet className="w-4 h-4" style={{ color: "#16a34a" }} /> Bulk upload from CSV
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>
            Columns: deviceName, buyPrice, sellPrice, condition, storage, category, quantity (up to 50 per row, 500 rows).
          </p>
        </div>
        <button onClick={downloadTemplate} className="inline-flex items-center gap-1 text-xs font-semibold flex-shrink-0" style={{ color: "#C2542D" }}>
          <Download className="w-3.5 h-3.5" /> Template
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" Icon={UploadCloud} onClick={() => fileRef.current?.click()}>
          {fileName ?? "Choose CSV file"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              setCsv(await f.text());
              setFileName(f.name);
              setResult(null);
            }
            e.target.value = "";
          }}
        />
      </div>
      <textarea
        value={csv}
        onChange={(e) => {
          setCsv(e.target.value);
          setResult(null);
        }}
        rows={5}
        placeholder={"…or paste it here\n" + CSV_TEMPLATE}
        className={`${fieldClass} font-mono-tech text-xs resize-y`}
        style={fieldStyle}
      />
      {result && (
        <Notice tone={result.errors.length ? "amber" : "green"}>
          <p className="font-semibold">
            {result.dryRun ? "Check complete: " : "Uploaded: "}
            {result.added} unit{result.added === 1 ? "" : "s"} {result.dryRun ? "ready to add" : "added"}
            {result.failed ? `, ${result.failed} row${result.failed === 1 ? "" : "s"} with problems` : ""}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-1 space-y-0.5 max-h-32 overflow-y-auto">
              {result.errors.map((e) => (
                <li key={`${e.line}-${e.error}`}>
                  Line {e.line}: {e.error}
                </li>
              ))}
            </ul>
          )}
        </Notice>
      )}
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button variant="soft" onClick={() => run(true)} loading={checking === "dry"} disabled={!!checking}>
          Check file
        </Button>
        <Button
          Icon={CheckCircle2}
          onClick={() => run(false)}
          loading={checking === "real"}
          disabled={!!checking || !result?.dryRun || result.added === 0}
        >
          Add {result?.dryRun && result.added ? result.added : ""} to stock
        </Button>
      </div>
      {!result && (
        <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
          Check the file first — nothing is saved until you add it.
        </p>
      )}
    </Card>
  );
}

export default function VendorStock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ deviceName: "", buyPrice: "", sellPrice: "", condition: "UK Used" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const r = await apiJson<{ inventory?: StockItem[]; items?: StockItem[] }>("/api/vendor/inventory");
    setItems(r.data?.inventory ?? r.data?.items ?? []);
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(load);
  }, []);

  const add = async () => {
    if (!form.deviceName.trim() || !Number(form.buyPrice) || !Number(form.sellPrice)) {
      return setError("Enter the device and both prices.");
    }
    setSaving(true);
    setError(null);
    const r = await apiJson(
      "/api/vendor/inventory",
      jsonBody({
        deviceName: form.deviceName.trim(),
        buyPrice: Number(form.buyPrice),
        sellPrice: Number(form.sellPrice),
        condition: form.condition,
      })
    );
    setSaving(false);
    if (!r.ok) return setError(r.message);
    setForm({ deviceName: "", buyPrice: "", sellPrice: "", condition: "UK Used" });
    setShowAdd(false);
    load();
  };

  const markSold = async (id: string) => {
    setItems((xs) => xs.map((x) => (x._id === id ? { ...x, status: "sold" } : x)));
    await apiJson("/api/vendor/inventory", { method: "PATCH", body: JSON.stringify({ id, status: "sold" }) });
  };

  const inStock = items.filter((i) => i.status === "in_stock");

  return (
    <div className="space-y-5">
      <Notice tone="neutral">Stock you hold helps match you to customer requests for those devices.</Notice>

      <BulkUpload onDone={load} />

      <div>
        <SectionTitle
          right={
            <Button variant="soft" Icon={Plus} onClick={() => setShowAdd((v) => !v)}>
              Add one
            </Button>
          }
        >
          My stock ({inStock.length} in stock)
        </SectionTitle>

        {showAdd && (
          <Card className="space-y-3 mb-3">
            <Field label="Device">
              <input value={form.deviceName} onChange={(e) => setForm({ ...form, deviceName: e.target.value })} placeholder="e.g. iPhone 14 Pro 256GB" className={fieldClass} style={fieldStyle} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Bought for (₦)">
                <input value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: e.target.value.replace(/\D/g, "") })} inputMode="numeric" className={fieldClass} style={fieldStyle} />
              </Field>
              <Field label="Selling for (₦)">
                <input value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: e.target.value.replace(/\D/g, "") })} inputMode="numeric" className={fieldClass} style={fieldStyle} />
              </Field>
              <Field label="Condition">
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={fieldClass} style={{ ...fieldStyle, cursor: "pointer" }}>
                  {CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <ErrorText>{error}</ErrorText>
            <Button onClick={add} loading={saving}>
              Save
            </Button>
          </Card>
        )}

        {loading ? (
          <RowListSkeleton count={3} />
        ) : items.length === 0 ? (
          <EmptyState Icon={Boxes} title="No stock yet" body="Upload a CSV above or add devices one at a time." />
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item._id}
                className={`flex items-center justify-between gap-3 rounded-xl p-3.5 ${item.status === "sold" ? "opacity-60" : ""}`}
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                    {item.deviceName}
                    {item.storage ? ` · ${item.storage}` : ""}
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    {item.condition ?? "—"} · bought {formatPrice(item.buyPrice)} · selling{" "}
                    <span style={{ color: "#C2542D", fontWeight: 600 }}>{formatPrice(item.sellPrice)}</span>
                  </p>
                </div>
                {item.status === "in_stock" ? (
                  <button
                    onClick={() => markSold(item._id)}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg flex-shrink-0"
                    style={{ border: "1px solid var(--border)", color: "var(--ink-soft)", cursor: "pointer" }}
                  >
                    Mark sold
                  </button>
                ) : (
                  <StatusPill status="sold" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
