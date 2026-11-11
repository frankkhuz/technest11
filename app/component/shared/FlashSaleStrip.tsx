"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Timer, ChevronRight } from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { formatPrice, cldImage } from "@/app/lib/helpers";
import { priceFor, stockNote, type Product } from "@/app/lib/products";
import SaleCountdown from "./SaleCountdown";

type FlashSale = { products: Product[]; upcoming: Product[]; serverTime: string };

const discountPct = (price: number, was: number | null) =>
  was && was > price ? Math.round(((was - price) / was) * 100) : 0;

/** Live flash sale, ending soonest first. The countdown runs off the
 * server's clock (data.serverTime), not the phone's. */
export default function FlashSaleStrip({ condition }: { condition: "uk-used" | "brand-new" }) {
  const router = useRouter();
  const [sale, setSale] = useState<FlashSale | null>(null);
  const [offset, setOffset] = useState(0);
  // Coarse clock used only to drop ended items; the visible countdown ticks
  // on its own so the product rail doesn't re-render every second.
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
    const t = setInterval(() => setNow(Date.now()), 15000);
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
      className="rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--accent), var(--secondary))", color: "#fff" }}
    >
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <p
          className="inline-flex items-center gap-1.5 font-bold min-w-0"
          style={{ fontFamily: "var(--font-grotesk), sans-serif" }}
        >
          <Zap className="w-4 h-4 flex-shrink-0" fill="#fff" /> <span className="truncate">{label}</span>
        </p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {endsAt && (
            <span
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.25)" }}
            >
              <Timer className="w-3.5 h-3.5" /> <SaleCountdown endsAt={endsAt} offset={offset} />
            </span>
          )}
          <button
            onClick={() => router.push("/flash-sales")}
            aria-label="See all flash sales"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="rail flex gap-2.5 sm:gap-3 pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {products.map((p) => {
          const { price, was } = priceFor(p, condition);
          const note = stockNote(p);
          const pct = discountPct(price, was);
          return (
            <button
              key={p.id}
              onClick={() => router.push(`/buy/${p.slug ?? p.id}?condition=${condition}`)}
              className="snap-start flex-shrink-0 w-36 rounded-xl p-2.5 text-left flex flex-col"
              style={{ background: "var(--surface)", cursor: "pointer" }}
            >
              <div
                className="relative h-20 w-full rounded-lg mb-2 flex items-center justify-center overflow-hidden"
                style={{ background: "var(--border)" }}
              >
                {p.image ? (
                  <img src={cldImage(p.image, 300)} alt={p.name} loading="lazy" className="h-full w-full object-contain" />
                ) : (
                  <Zap className="w-7 h-7" style={{ color: "var(--accent)" }} />
                )}
                {pct > 0 && (
                  <span
                    className="num absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "#DC2626", color: "#fff" }}
                  >
                    -{pct}%
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold line-clamp-1" style={{ color: "var(--ink)" }}>
                {p.name}
              </p>
              <p className="num text-sm font-bold truncate" style={{ color: "var(--accent)" }}>
                {formatPrice(price)}
              </p>
              {/* Fixed-height slots so cards with/without a "was" price or stock note line up */}
              <p className="num text-[10px] line-through h-[15px] truncate" style={{ color: "var(--ink-soft)" }}>
                {was ? formatPrice(was) : ""}
              </p>
              <p className="text-[10px] font-semibold h-[15px] truncate" style={{ color: "#DC2626" }}>
                {p.sale?.stockLimit
                  ? `${Math.min(100, Math.round(((p.sale.sold ?? 0) / p.sale.stockLimit) * 100))}% claimed`
                  : note ?? ""}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
