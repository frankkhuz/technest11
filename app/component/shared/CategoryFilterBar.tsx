"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import type { CategoryFilters, FilterAttribute } from "@/app/types/backend";

type Value = Record<string, string>;

const optionValues = (a: FilterAttribute) =>
  (a.options ?? []).map((o) => (typeof o === "string" ? { value: o, count: undefined } : o));

const selectStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--ink)",
  cursor: "pointer",
};

/**
 * The filter row for a catalog category, built from
 * GET /api/categories/:slug → filters.attributes. Each attribute carries the
 * query `param` (or `params` [min, max] for numbers) to send to /api/products.
 */
export default function CategoryFilterBar({
  slug,
  value,
  onChange,
}: {
  slug: string;
  value: Value;
  onChange: (v: Value) => void;
}) {
  const [attrs, setAttrs] = useState<FilterAttribute[]>([]);

  useEffect(() => {
    apiJson<{ filters: CategoryFilters }>(`/api/categories/${encodeURIComponent(slug)}`).then((r) =>
      setAttrs((r.data?.filters?.attributes ?? []).filter((a) => a.param || a.params))
    );
  }, [slug]);

  if (attrs.length === 0) return null;

  const set = (param: string, v: string) => {
    const next = { ...value };
    if (v) next[param] = v;
    else delete next[param];
    onChange(next);
  };

  const active = Object.keys(value).length;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--ink-soft)" }}>
        <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
      </span>
      {attrs.map((a) => {
        if (a.type === "number" && a.params) {
          const [minP, maxP] = a.params;
          return (
            <span key={a.key} className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--ink-soft)" }}>
              {a.label}
              <input
                value={value[minP] ?? ""}
                onChange={(e) => set(minP, e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="min"
                inputMode="decimal"
                className="w-14 px-2 py-1.5 rounded-lg outline-none"
                style={selectStyle}
              />
              –
              <input
                value={value[maxP] ?? ""}
                onChange={(e) => set(maxP, e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="max"
                inputMode="decimal"
                className="w-14 px-2 py-1.5 rounded-lg outline-none"
                style={selectStyle}
              />
              {a.unit}
            </span>
          );
        }
        const param = a.param!;
        if (a.type === "boolean") {
          const on = value[param] === "true";
          return (
            <button
              key={a.key}
              onClick={() => set(param, on ? "" : "true")}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{
                background: on ? "var(--accent)" : "var(--surface)",
                color: on ? "#fff" : "var(--ink-soft)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              {a.label}
            </button>
          );
        }
        // select / multiselect — one value per dropdown; multiselect values
        // are sent comma-joined ("any of") by the backend's rules.
        return (
          <select
            key={a.key}
            value={value[param] ?? ""}
            onChange={(e) => set(param, e.target.value)}
            className="text-xs px-3 py-2 rounded-lg outline-none"
            style={value[param] ? { ...selectStyle, borderColor: "var(--accent)", color: "var(--accent)" } : selectStyle}
          >
            <option value="">{a.label}: any</option>
            {optionValues(a).map((o) => (
              <option key={o.value} value={o.value}>
                {o.value}
                {o.count ? ` (${o.count})` : ""}
              </option>
            ))}
          </select>
        );
      })}
      {active > 0 && (
        <button
          onClick={() => onChange({})}
          className="inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--accent)", cursor: "pointer" }}
        >
          <X className="w-3.5 h-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
