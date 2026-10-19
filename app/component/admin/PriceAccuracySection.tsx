"use client";

import { useEffect, useState } from "react";
import { Target, AlertTriangle } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { fieldStyle } from "@/app/component/ui/kit";
import { SectionBody, ListState, Stat, adminInput } from "./shared";

type Row = {
  deviceId: string;
  name: string;
  deals: number;
  dealRatio: number | null;
  offers: number;
  offerRatio: number | null;
  suggestion?: string | null;
};
type Accuracy = { overall: { deals: number; dealRatio: number | null; offers: number; offerRatio: number | null }; devices: Row[] };

const pct = (r: number | null | undefined) => (r === null || r === undefined ? "—" : `${Math.round(r * 100)}%`);
const tone = (r: number | null | undefined) =>
  r === null || r === undefined ? "var(--ink-soft)" : Math.abs(1 - r) >= 0.1 ? "#DC2626" : Math.abs(1 - r) >= 0.05 ? "#d97706" : "#16a34a";

export default function PriceAccuracySection() {
  const [days, setDays] = useState("180");
  const [data, setData] = useState<Accuracy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiJson<Accuracy>(`/api/admin/prices/accuracy?days=${days}`).then((r) => {
      setError(r.ok ? null : r.message);
      setData(r.data);
      setLoading(false);
    });
  }, [days]);

  return (
    <SectionBody width="max-w-4xl">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <p className="text-xs max-w-lg" style={{ color: "var(--ink-soft)" }}>
          How our valuation estimates compare with what vendors offer and what sellers accept. 85% means vendors pay about 15% under our
          estimate. Fix flagged devices in the valuation price table.
        </p>
        <select
          value={days}
          onChange={(e) => {
            setLoading(true);
            setDays(e.target.value);
          }} className={adminInput} style={fieldStyle}>
          {["30", "90", "180", "365"].map((d) => (
            <option key={d} value={d}>
              Last {d} days
            </option>
          ))}
        </select>
      </div>
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <Stat label="Accepted deals" value={data.overall.deals} />
          <Stat label="Deal price vs estimate" value={pct(data.overall.dealRatio)} tone={tone(data.overall.dealRatio)} />
          <Stat label="Vendor offers" value={data.overall.offers} />
          <Stat label="Offers vs estimate" value={pct(data.overall.offerRatio)} tone={tone(data.overall.offerRatio)} />
        </div>
      )}
      <ListState loading={loading} error={error} empty={!data?.devices.length} EmptyIcon={Target} emptyText="Not enough deals yet">
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-semibold" style={{ background: "var(--bg)", color: "var(--ink-soft)" }}>
            <span className="col-span-5">Device</span>
            <span className="col-span-2 text-right">Deals</span>
            <span className="col-span-2 text-right">Deal ratio</span>
            <span className="col-span-3 text-right">Offers / ratio</span>
          </div>
          {data?.devices.map((d) => (
            <div key={d.deviceId} className="px-3 py-2.5 text-xs" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-5 truncate" style={{ color: "var(--ink)" }}>
                  {d.name}
                </span>
                <span className="col-span-2 text-right" style={{ color: "var(--ink)" }}>
                  {d.deals}
                </span>
                <span className="col-span-2 text-right font-semibold" style={{ color: tone(d.dealRatio) }}>
                  {pct(d.dealRatio)}
                </span>
                <span className="col-span-3 text-right" style={{ color: tone(d.offerRatio) }}>
                  {d.offers} / {pct(d.offerRatio)}
                </span>
              </div>
              {d.suggestion && (
                <p className="inline-flex items-center gap-1 mt-1" style={{ color: "#d97706" }}>
                  <AlertTriangle className="w-3 h-3" /> {d.suggestion}
                </p>
              )}
            </div>
          ))}
        </div>
      </ListState>
    </SectionBody>
  );
}
