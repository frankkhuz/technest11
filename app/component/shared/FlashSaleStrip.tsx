"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Timer } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import { priceFor, stockNote, type Product } from "@/app/lib/products";

type FlashSale = { products: Product[]; upcoming: Product[]; serverTime: string };

function countdown(ms: number) {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** Live flash sale, ending soonest first. The countdown runs off the
 * server's clock (data.serverTime), not the phone's. */
export default function FlashSaleStrip({ condition }: { condition: "uk-used" | "brand-new" }) {
  const router = useRouter();
  const [sale, setSale] = useState<FlashSale | null>(null);
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    apiJson<FlashSale>("/api/products/flash-sale").then((r) => {
      if (!r.data) return;
      setSale(r.data);
      setOffset(new Date(r.data.serverTime).getTime() - Date.now());
    });
  }, []);

  useEffect(() => {
    if (!sale?.products.length) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [sale]);

  const products = useMemo(
    () =>
      (sale?.products ?? []).filter(
        (p) => !p.sale?.endsAt || new Date(p.sale.endsAt).getTime() > now + offset
      ),
    [sale, now, offset]
  );

  if (products.length === 0) return null;
  const endsAt = products[0].sale?.endsAt;
  const label = products[0].sale?.label || "Flash Sale";

  return (
    <div
      className="rounded-2xl p-4 mb-6"
      style={{ background: "linear-gradient(135deg, var(--accent), var(--secondary))", color: "#fff" }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="inline-flex items-center gap-1.5 font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          <Zap className="w-4 h-4" fill="#fff" /> {label}
        </p>
        {endsAt && (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full font-mono-tech"
            style={{ background: "rgba(0,0,0,0.25)" }}
          >
            <Timer className="w-3.5 h-3.5" /> Ends in {countdown(new Date(endsAt).getTime() - (now + offset))}
          </span>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {products.map((p) => {
          const { price, was } = priceFor(p, condition);
          const note = stockNote(p);
          return (
            <button
              key={p.id}
              onClick={() => router.push(`/buy/${p.slug ?? p.id}?condition=${condition}`)}
              className="flex-shrink-0 w-36 rounded-xl p-2.5 text-left"
              style={{ background: "var(--surface)", cursor: "pointer" }}
            >
              <div className="h-20 rounded-lg mb-2 flex items-center justify-center overflow-hidden" style={{ background: "var(--border)" }}>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
                ) : (
                  <Zap className="w-7 h-7" style={{ color: "var(--accent)" }} />
                )}
              </div>
              <p className="text-xs font-semibold line-clamp-1" style={{ color: "var(--ink)" }}>
                {p.name}
              </p>
              <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                {formatPrice(price)}
              </p>
              {was && (
                <p className="text-[10px] line-through" style={{ color: "var(--ink-soft)" }}>
                  {formatPrice(was)}
                </p>
              )}
              {note && (
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#DC2626" }}>
                  {note}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
