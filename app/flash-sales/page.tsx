"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ShoppingCart, Check, Clock, AlertTriangle, ArrowRight, Smartphone } from "lucide-react";
import Navbar from "@/app/component/layout/Navbar";
import SaleCountdown from "@/app/component/shared/SaleCountdown";
import { CardGridSkeleton, Skeleton } from "@/app/component/ui/Skeleton";
import { apiJson } from "@/app/lib/api";
import { formatPrice, cldImage } from "@/app/lib/helpers";
import { priceFor, stockNote, type Product } from "@/app/lib/products";
import { useCart, type PhoneCondition } from "@/app/context/CartContext";
import ProductRating, { anyRated } from "@/app/component/shared/ProductRating";

type FlashSale = { products: Product[]; upcoming: Product[]; serverTime: string };

const GRID = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4";
const IMAGE_H = 150;

/** "70% claimed" bar for capped sales (sale.stockLimit / sale.sold). */
function ClaimedBar({ sold, limit }: { sold: number; limit: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((sold / limit) * 100)));
  const left = Math.max(0, limit - sold);
  return (
    <div className="mt-1.5" aria-label={`${pct}% claimed, ${left} left`}>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #ff8a4c, #DC2626)" }}
        />
      </div>
      <p className="num text-[10px] mt-0.5 font-semibold" style={{ color: pct >= 80 ? "#DC2626" : "var(--ink-soft)" }}>
        {pct}% claimed · {left} left
      </p>
    </div>
  );
}

const discountPct = (price: number, was: number | null) =>
  was && was > price ? Math.round(((was - price) / was) * 100) : 0;

export default function FlashSalesPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [sale, setSale] = useState<FlashSale | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [offset, setOffset] = useState(0);
  const [condition, setCondition] = useState<PhoneCondition>("uk-used");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  // Coarse clock (15s) used only to drop ended deals; timers tick themselves.
  const [now, setNow] = useState(() => Date.now());

  const fetchSale = () =>
    apiJson<FlashSale>("/api/products/flash-sale").then((r) => {
      if (!r.data) {
        setState("error");
        return;
      }
      setSale(r.data);
      setOffset(new Date(r.data.serverTime).getTime() - Date.now());
      setState("ready");
    });

  const retry = () => {
    setState("loading");
    fetchSale();
  };

  useEffect(() => {
    fetchSale();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  const live = useMemo(
    () =>
      (sale?.products ?? []).filter(
        (p) => !p.sale?.endsAt || new Date(p.sale.endsAt).getTime() > now + offset
      ),
    [sale, now, offset]
  );
  const upcoming = sale?.upcoming ?? [];
  const ratedGrid = anyRated(live);
  const cappedGrid = live.some((p) => !!p.sale?.stockLimit);
  const endsAt = live[0]?.sale?.endsAt;
  const nextStart = upcoming
    .map((p) => p.sale?.startsAt)
    .filter((t): t is string => !!t)
    .sort()[0];

  const quickAdd = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    addToCart({ itemId: p.id, itemType: p.type, condition, quantity: 1 });
    setJustAdded(p.id);
    setTimeout(() => setJustAdded((cur) => (cur === p.id ? null : cur)), 1200);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      {/* Hero — fixed min-height so the timer arriving never pushes content down */}
      <section
        className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-10"
        style={{ background: "linear-gradient(135deg, #ff8a4c 0%, var(--accent) 40%, var(--secondary) 100%)", color: "#fff" }}
      >
        <div
          aria-hidden
          className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
        <div className="relative max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest opacity-90">
              <Zap className="w-3.5 h-3.5" fill="#fff" /> Limited time
            </p>
            <h1 className="text-2xl sm:text-4xl font-bold mt-1" style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
              Flash Sales
            </h1>
            <p className="text-sm opacity-85 mt-1">Today&apos;s biggest price drops — while stock lasts.</p>
          </div>
          <div className="h-11">
            {state === "loading" ? (
              <Skeleton className="h-11 w-48 rounded-lg opacity-60" />
            ) : endsAt ? (
              <SaleCountdown endsAt={endsAt} offset={offset} variant="boxes" prefix="Ends in" />
            ) : nextStart ? (
              <SaleCountdown endsAt={nextStart} offset={offset} variant="boxes" prefix="Next sale in" />
            ) : (
              <span
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(0,0,0,0.22)" }}
              >
                <Clock className="w-4 h-4" /> New deals drop soon
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* Condition switch */}
        <div
          role="tablist"
          aria-label="Condition"
          className="grid grid-cols-2 p-1 rounded-xl mb-5 max-w-xs"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {(
            [
              ["uk-used", "UK Used"],
              ["brand-new", "Brand New"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              role="tab"
              aria-selected={condition === val}
              onClick={() => setCondition(val)}
              className="h-10 rounded-lg text-sm font-semibold transition-colors"
              style={
                condition === val
                  ? { background: "var(--accent)", color: "#fff" }
                  : { background: "transparent", color: "var(--ink-soft)" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {state === "loading" && <CardGridSkeleton count={8} imageHeight={IMAGE_H} className={GRID} />}

        {state === "error" && (
          <div
            className="text-center py-14 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <AlertTriangle className="w-9 h-9 mx-auto mb-3" style={{ color: "#DC2626" }} />
            <p className="font-semibold mb-1">Couldn&apos;t load flash sales</p>
            <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
              Check your connection and try again.
            </p>
            <button
              onClick={retry}
              className="h-11 px-6 rounded-xl text-sm font-semibold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Retry
            </button>
          </div>
        )}

        {state === "ready" && live.length === 0 && (
          <div
            className="text-center py-14 px-4 rounded-2xl mb-8"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Zap className="w-7 h-7" />
            </div>
            <p className="font-semibold mb-1">No flash sales running right now</p>
            <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
              {upcoming.length ? "The next deals are lined up below." : "New deals drop regularly — check back soon."}
            </p>
            <button
              onClick={() => router.push("/buy?condition=uk-used")}
              className="inline-flex items-center gap-1.5 h-11 px-6 rounded-xl text-sm font-semibold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Browse all devices <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {state === "ready" && live.length > 0 && (
          <div className={GRID}>
            {live.map((p) => {
              const { price, was } = priceFor(p, condition);
              const pct = discountPct(price, was);
              const note = stockNote(p);
              const added = justAdded === p.id;
              return (
                <div
                  key={p.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/buy/${p.slug ?? p.id}?condition=${condition}`)}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/buy/${p.slug ?? p.id}?condition=${condition}`)}
                  className="card-hover flex flex-col min-w-0 rounded-2xl overflow-hidden cursor-pointer"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="relative flex items-center justify-center p-3"
                    style={{ background: "var(--border)", height: IMAGE_H }}
                  >
                    {p.image ? (
                      <img
                        src={cldImage(p.image, 400)}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Smartphone className="w-12 h-12" style={{ color: "var(--accent)" }} strokeWidth={1.5} />
                    )}
                    {pct > 0 && (
                      <span
                        className="num absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "#DC2626", color: "#fff" }}
                      >
                        -{pct}%
                      </span>
                    )}
                    {p.sale?.endsAt && (
                      <span
                        className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded-full"
                        style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                      >
                        <Clock className="w-3 h-3" />
                        <SaleCountdown endsAt={p.sale.endsAt} offset={offset} />
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-snug line-clamp-2 min-h-[2.75em]">{p.name}</p>
                    <p className="text-[10px] truncate mb-1" style={{ color: "var(--ink-soft)" }}>
                      {p.brand}
                    </p>
                    <div className="mb-1.5">
                      <ProductRating rating={p.rating} reserve={ratedGrid} />
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-1.5">
                      <div className="min-w-0">
                        <p className="num text-sm sm:text-base font-bold truncate" style={{ color: "#DC2626" }}>
                          {formatPrice(price)}
                        </p>
                        <p className="num text-[10px] line-through h-[15px] truncate" style={{ color: "var(--ink-soft)" }}>
                          {was ? formatPrice(was) : ""}
                        </p>
                      </div>
                      <button
                        onClick={(e) => p.inStock && quickAdd(e, p)}
                        disabled={!p.inStock}
                        aria-label={`Add ${p.name} to cart`}
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40"
                        style={{
                          background: added ? "#16a34a" : "var(--accent)",
                          color: "#fff",
                        }}
                      >
                        {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                      </button>
                    </div>
                    {p.sale?.stockLimit ? (
                      <ClaimedBar sold={p.sale.sold ?? 0} limit={p.sale.stockLimit} />
                    ) : cappedGrid ? (
                      <div className="h-[29px] mt-1.5" aria-hidden />
                    ) : null}
                    <p className="text-[10px] font-semibold h-[15px] mt-1 truncate" style={{ color: "#DC2626" }}>
                      {!p.inStock ? "Sold out" : note ?? ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {state === "ready" && upcoming.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
              Coming up
            </h2>
            <div className={GRID}>
              {upcoming.map((p) => {
                const { price, was } = priceFor(p, condition);
                const regular = condition === "brand-new" ? p.priceBrandNew : p.priceUkUsed;
                const salePrice = condition === "brand-new" ? p.sale?.priceBrandNew : p.sale?.priceUkUsed;
                const teaser = salePrice && salePrice < regular ? salePrice : null;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col min-w-0 rounded-2xl overflow-hidden"
                    style={{ background: "var(--surface)", border: "1px dashed var(--border)" }}
                  >
                    <div
                      className="relative flex items-center justify-center p-3"
                      style={{ background: "var(--accent-soft)", height: 110 }}
                    >
                      {p.image ? (
                        <img src={cldImage(p.image, 400)} alt={p.name} loading="lazy" className="h-full w-full object-contain opacity-80" />
                      ) : (
                        <Smartphone className="w-10 h-10" style={{ color: "var(--accent)" }} strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug line-clamp-2 min-h-[2.75em]">{p.name}</p>
                      <p className="num text-sm font-bold mt-auto truncate" style={{ color: teaser ? "#DC2626" : "var(--ink)" }}>
                        {formatPrice(teaser ?? was ?? price)}
                        {teaser && (
                          <span className="ml-1.5 text-[10px] font-medium line-through" style={{ color: "var(--ink-soft)" }}>
                            {formatPrice(regular)}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] font-semibold h-[15px] truncate" style={{ color: "var(--accent)" }}>
                        {p.sale?.startsAt ? <SaleCountdown endsAt={p.sale.startsAt} offset={offset} prefix="Starts in" /> : "Coming soon"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
