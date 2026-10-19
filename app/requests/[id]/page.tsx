"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  Sparkles,
  ShieldCheck,
  Clock,
  BadgeCheck,
  MessageCircle,
  XCircle,
  Star,
  Flag,
  Inbox,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { apiJson } from "@/app/lib/api";
import { useAuth } from "@/app/hooks/useAuth";
import { formatPrice } from "@/app/lib/helpers";
import {
  OFFER_PRICE_LABELS,
  REQUEST_TYPE_LABELS,
  idOf,
  type DeviceRequest,
  type RequestOffer,
} from "@/app/types/backend";
import {
  PageShell,
  Card,
  Button,
  EmptyState,
  Notice,
  StatusPill,
  Pill,
  RatingBadge,
  SectionTitle,
  formatDateTime,
  timeAgo,
  ACCENT,
} from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

function offerRating(o: RequestOffer) {
  const r = o.vendorRating;
  if (r === null || r === undefined) return null;
  return typeof r === "number" ? { average: r, count: 0 } : r;
}

function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const { user, isLoading } = useAuth();
  const [request, setRequest] = useState<DeviceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await apiJson<{ request: DeviceRequest }>(`/api/requests/${id}`);
    if (!r.ok) setError(r.message);
    else setRequest(r.data?.request ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/auth/login?from=/requests/${id}`);
      return;
    }
    Promise.resolve().then(load);
  }, [isLoading, user, router, id, load]);

  // New offers arrive while the request is open — keep the list fresh.
  useEffect(() => {
    if (request?.status !== "open") return;
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [request?.status, load]);

  const accept = async (offer: RequestOffer) => {
    if (!window.confirm(`Accept ${offer.vendorName ?? "this vendor"}'s offer of ${formatPrice(offer.price)}? Other offers will be declined.`)) return;
    setBusy(idOf(offer));
    setActionError(null);
    const r = await apiJson<{ request: DeviceRequest }>(`/api/requests/${id}/offers/${idOf(offer)}/accept`, {
      method: "POST",
    });
    setBusy(null);
    if (!r.ok) return setActionError(r.message);
    const next = r.data?.request;
    if (next) setRequest(next);
    else load();
    if (next?.whatsappUrl) window.open(next.whatsappUrl, "_blank", "noopener");
  };

  const cancel = async () => {
    if (!window.confirm("Cancel this request? Vendors will stop sending offers.")) return;
    setBusy("cancel");
    const r = await apiJson(`/api/requests/${id}/cancel`, { method: "POST" });
    setBusy(null);
    if (!r.ok) return setActionError(r.message);
    load();
  };

  if (loading || isLoading) {
    return (
      <PageShell title="Request" Icon={Send}>
        <RowListSkeleton count={3} />
      </PageShell>
    );
  }

  if (error || !request) {
    return (
      <PageShell title="Request" Icon={Send}>
        <EmptyState
          Icon={Inbox}
          title="Request not found"
          body={error ?? "It may have been removed."}
          action={<Button onClick={() => router.push("/requests")}>Back to my requests</Button>}
        />
      </PageShell>
    );
  }

  const offers = [...(request.offers ?? [])]
    .filter((o) => o.status !== "withdrawn")
    .sort((a, b) =>
      request.type === "sell" ? b.price - a.price : a.price - b.price
    );
  const accepted = offers.find((o) => o.status === "accepted") ?? request.acceptedOffer ?? null;
  const priceLabel = OFFER_PRICE_LABELS[request.type];
  const posted = params.get("posted");

  return (
    <PageShell
      title={request.deviceName}
      Icon={Send}
      subtitle={
        <span className="inline-flex items-center gap-2 flex-wrap">
          <span style={{ color: ACCENT, fontWeight: 600 }}>{REQUEST_TYPE_LABELS[request.type]}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {request.city ? `${request.city}, ` : ""}
            {request.state}
          </span>
          <span>· posted {timeAgo(request.createdAt)}</span>
        </span>
      }
      actions={<StatusPill status={request.status} />}
    >
      <button
        onClick={() => router.push("/requests")}
        className="inline-flex items-center gap-1 text-xs font-medium mb-4"
        style={{ color: "var(--ink-soft)" }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> All requests
      </button>

      <div className="space-y-5">
        {posted !== null && request.status === "open" && (
          <Notice tone="green">
            Request sent{posted ? ` to ${posted} matching vendor${posted === "1" ? "" : "s"}` : ""}. Offers usually start
            arriving within the hour — we&apos;ll notify you.
          </Notice>
        )}

        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              ["Category", request.category],
              ["Storage", request.storage],
              ["Condition", request.condition],
              ["Wants", request.wantedDevice],
              ["Problem", request.issue],
              [
                "Budget",
                request.budgetMin || request.budgetMax
                  ? `${request.budgetMin ? formatPrice(request.budgetMin) : "—"} – ${request.budgetMax ? formatPrice(request.budgetMax) : "—"}`
                  : undefined,
              ],
              ["Offers close", request.expiresAt ? formatDateTime(request.expiresAt) : undefined],
              ["Auto-pick best", request.autoSelect ? "On" : undefined],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <p style={{ color: "var(--ink-soft)" }}>{k}</p>
                  <p className="font-medium capitalize" style={{ color: "var(--ink)" }}>
                    {v}
                  </p>
                </div>
              ))}
          </div>
          {request.description && (
            <p className="text-sm mt-3 pt-3" style={{ color: "var(--ink-soft)", borderTop: "1px solid var(--border)" }}>
              {request.description}
            </p>
          )}
          {!!request.images?.length && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {request.images.map((src) => (
                <img key={src} src={src} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ))}
            </div>
          )}
        </Card>

        {accepted && (
          <Card style={{ border: "1px solid rgba(22,163,74,0.3)" }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#16a34a" }}>
                  Accepted offer
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  {accepted.vendorName ?? "Vendor"} · {formatPrice(accepted.price)}
                </p>
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  TechNest is arranging this with you on WhatsApp.
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {request.whatsappUrl && request.status !== "completed" && (
                <a
                  href={request.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl no-underline"
                  style={{ background: "#25d366", color: "#fff" }}
                >
                  <MessageCircle className="w-4 h-4" /> Chat with TechNest
                </a>
              )}
              {request.status === "completed" && (
                <>
                  <Button variant="soft" Icon={Star} onClick={() => router.push("/reviews")}>
                    Rate this vendor
                  </Button>
                  <Button
                    variant="outline"
                    Icon={Flag}
                    onClick={() => router.push(`/disputes/new?type=device_request&id=${idOf(request)}`)}
                  >
                    Report a problem
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}

        <div>
          <SectionTitle
            right={
              offers.length > 1 ? (
                <span className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                  Best {request.type === "sell" ? "price for you" : "price"} first
                </span>
              ) : undefined
            }
          >
            Offers ({offers.length})
          </SectionTitle>
          {actionError && (
            <div className="mb-3">
              <Notice tone="red">{actionError}</Notice>
            </div>
          )}
          {offers.length === 0 ? (
            <EmptyState
              Icon={Clock}
              title={request.status === "open" ? "Waiting for offers" : "No offers"}
              body={
                request.status === "open"
                  ? `${request.matchedVendorCount ?? request.matchedVendors ?? "Matching"} vendor${
                      (request.matchedVendorCount ?? request.matchedVendors) === 1 ? "" : "s"
                    } can see this. You'll get a notification for each offer.`
                  : "This request closed without offers. Try posting again with a wider budget or area."
              }
            />
          ) : (
            <div className="space-y-3">
              {offers.map((o) => {
                const rating = offerRating(o);
                const isAccepted = o.status === "accepted";
                return (
                  <Card
                    key={idOf(o)}
                    style={
                      o.recommended && request.status === "open"
                        ? { border: `1.5px solid ${ACCENT}` }
                        : isAccepted
                          ? { border: "1.5px solid #16a34a" }
                          : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                            {o.vendorName ?? "Vendor"}
                          </p>
                          {o.vendorIdentityVerified && (
                            <BadgeCheck className="w-3.5 h-3.5" style={{ color: "#1d9bf0" }} aria-label="Verified vendor" />
                          )}
                          {o.recommended && (
                            <Pill tone="accent" Icon={Sparkles} size="xs">
                              Recommended
                            </Pill>
                          )}
                          {o.status && o.status !== "active" && <StatusPill status={o.status} />}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-xs" style={{ color: "var(--ink-soft)" }}>
                          <RatingBadge rating={rating} />
                          {typeof o.vendorCompletedDeals === "number" && (
                            <span>
                              {o.vendorCompletedDeals} deal{o.vendorCompletedDeals === 1 ? "" : "s"} done
                            </span>
                          )}
                          {o.eta && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {o.eta}
                            </span>
                          )}
                          {!!o.warrantyDays && (
                            <span className="inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> {o.warrantyDays}-day warranty
                            </span>
                          )}
                        </div>
                        {o.message && (
                          <p className="text-xs mt-2" style={{ color: "var(--ink)" }}>
                            &ldquo;{o.message}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                          {priceLabel}
                        </p>
                        <p className="text-lg font-bold" style={{ color: ACCENT, fontFamily: "Space Grotesk, sans-serif" }}>
                          {formatPrice(o.price)}
                        </p>
                      </div>
                    </div>
                    {request.status === "open" && (
                      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                        <Button onClick={() => accept(o)} loading={busy === idOf(o)} disabled={!!busy} full>
                          Accept this offer
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {request.status === "open" && (
          <div className="text-center">
            <button
              onClick={cancel}
              disabled={busy === "cancel"}
              className="inline-flex items-center gap-1 text-xs font-medium disabled:opacity-50"
              style={{ color: "#DC2626", cursor: "pointer" }}
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel this request
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default function RequestDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <RequestDetail />
    </Suspense>
  );
}
