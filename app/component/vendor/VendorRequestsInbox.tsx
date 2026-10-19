"use client";

import { useCallback, useEffect, useState } from "react";
import { Inbox, Trophy, Users, MapPin, Clock, HandCoins, Trash2 } from "lucide-react";
import { apiJson, jsonBody } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import {
  OFFER_PRICE_LABELS,
  REQUEST_TYPE_LABELS,
  idOf,
  type DeviceRequest,
  type RequestStatus,
} from "@/app/types/backend";
import {
  Card,
  Chip,
  EmptyState,
  Field,
  Button,
  ErrorText,
  Modal,
  Notice,
  Pill,
  StatusPill,
  fieldClass,
  fieldStyle,
  timeAgo,
  formatDateTime,
  ACCENT,
} from "@/app/component/ui/kit";
import { RowListSkeleton } from "@/app/component/ui/Skeleton";

const STATUSES: RequestStatus[] = ["open", "accepted", "completed", "expired", "cancelled"];

/** What the vendor's price means for this request type. */
const VENDOR_PRICE_HINT: Record<DeviceRequest["type"], string> = {
  buy: "What the customer pays you",
  accessory: "What the customer pays you",
  repair: "Your repair cost",
  sell: "What you'll pay for the device",
  swap: "Top-up the customer pays (0 for an even swap)",
};

function OfferModal({
  request,
  onClose,
  onSaved,
}: {
  request: DeviceRequest;
  onClose: () => void;
  onSaved: (r: DeviceRequest | null) => void;
}) {
  const mine = request.myOffer;
  const [price, setPrice] = useState(mine ? String(mine.price) : "");
  const [message, setMessage] = useState(mine?.message ?? "");
  const [eta, setEta] = useState(mine?.eta ?? "Same day");
  const [warrantyDays, setWarrantyDays] = useState(mine?.warrantyDays ? String(mine.warrantyDays) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (price === "" || Number(price) < 0) return setError("Enter your price.");
    setSaving(true);
    setError(null);
    const r = await apiJson<{ request: DeviceRequest }>(
      `/api/requests/${idOf(request)}/offers`,
      jsonBody({
        price: Number(price),
        message: message.trim() || undefined,
        eta: eta.trim() || undefined,
        warrantyDays: Number(warrantyDays) || undefined,
      })
    );
    setSaving(false);
    if (!r.ok) return setError(r.message);
    onSaved(r.data?.request ?? null);
  };

  const withdraw = async () => {
    if (!window.confirm("Withdraw your offer?")) return;
    setSaving(true);
    const r = await apiJson(`/api/requests/${idOf(request)}/offers`, { method: "DELETE" });
    setSaving(false);
    if (!r.ok) return setError(r.message);
    onSaved(null);
  };

  return (
    <Modal open onClose={onClose} title={mine ? "Update your offer" : "Make an offer"} Icon={HandCoins}>
      <div className="space-y-3">
        <div className="rounded-xl p-3 text-xs" style={{ background: "var(--bg)" }}>
          <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
            {request.deviceName}
            {request.storage ? ` · ${request.storage}` : ""}
          </p>
          <p style={{ color: "var(--ink-soft)" }}>
            {REQUEST_TYPE_LABELS[request.type]}
            {request.wantedDevice ? ` → wants ${request.wantedDevice}` : ""}
            {request.issue ? ` · ${request.issue}` : ""}
          </p>
          {(request.budgetMin || request.budgetMax) && (
            <p className="mt-1" style={{ color: "var(--ink)" }}>
              Budget: {request.budgetMin ? formatPrice(request.budgetMin) : "—"} – {request.budgetMax ? formatPrice(request.budgetMax) : "—"}
            </p>
          )}
        </div>
        <Field label="Price (₦)" hint={VENDOR_PRICE_HINT[request.type]}>
          <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={fieldClass} style={fieldStyle} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="When can you do it?">
            <input value={eta} onChange={(e) => setEta(e.target.value)} placeholder="Same day" className={fieldClass} style={fieldStyle} />
          </Field>
          <Field label="Warranty (days)" optional>
            <input value={warrantyDays} onChange={(e) => setWarrantyDays(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="0" className={fieldClass} style={fieldStyle} />
          </Field>
        </div>
        <Field label="Message to the customer" optional>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={400} placeholder="Condition, colour, what's included…" className={`${fieldClass} resize-none`} style={fieldStyle} />
        </Field>
        <Notice tone="neutral">Don&apos;t include phone numbers — TechNest connects you if the customer accepts.</Notice>
        <ErrorText>{error}</ErrorText>
        <Button onClick={save} loading={saving} full>
          {mine ? "Update offer" : "Send offer"}
        </Button>
        {mine && (
          <Button variant="danger" Icon={Trash2} onClick={withdraw} disabled={saving} full>
            Withdraw offer
          </Button>
        )}
      </div>
    </Modal>
  );
}

export default function VendorRequestsInbox({ focusId }: { focusId?: string | null }) {
  const [status, setStatus] = useState<RequestStatus>("open");
  const [requests, setRequests] = useState<DeviceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offering, setOffering] = useState<DeviceRequest | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await apiJson<{ requests: DeviceRequest[] }>(`/api/requests/for-vendor?status=${status}`);
    setError(r.ok ? null : r.message);
    setRequests(r.data?.requests ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  // Opened from a notification — jump straight to that request's offer form.
  useEffect(() => {
    if (!focusId) return;
    apiJson<{ request: DeviceRequest }>(`/api/requests/${focusId}`).then((r) => {
      if (r.data?.request?.status === "open") setOffering(r.data.request);
    });
  }, [focusId]);

  return (
    <div>
      <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
        Customer requests matched to what you sell, where you serve and your stock. Customers never see your contact
        details — and you won&apos;t see theirs — TechNest arranges every deal.
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: "none" }}>
        {STATUSES.map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      </div>

      {loading ? (
        <RowListSkeleton count={3} />
      ) : error ? (
        <Notice tone="red">{error}</Notice>
      ) : requests.length === 0 ? (
        <EmptyState
          Icon={Inbox}
          title={status === "open" ? "No open requests right now" : `No ${status} requests`}
          body={
            status === "open"
              ? "Add your stock and make sure your vendor types and states are set — that's how requests find you."
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={idOf(r)} style={r.youWon ? { border: "1.5px solid #16a34a" } : undefined}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
                      {REQUEST_TYPE_LABELS[r.type]}
                    </span>
                    {r.youWon && (
                      <Pill tone="green" Icon={Trophy} size="xs">
                        You won
                      </Pill>
                    )}
                    {status !== "open" && <StatusPill status={r.status} />}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    {r.deviceName}
                    {r.storage ? ` · ${r.storage}` : ""}
                    {r.condition ? ` · ${r.condition}` : ""}
                  </p>
                  {(r.wantedDevice || r.issue) && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--ink)" }}>
                      {r.wantedDevice ? `Wants: ${r.wantedDevice}` : `Problem: ${r.issue}`}
                    </p>
                  )}
                  {r.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--ink-soft)" }}>
                      {r.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs flex-wrap" style={{ color: "var(--ink-soft)" }}>
                    {r.customerName && <span>{r.customerName}</span>}
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {r.city ? `${r.city}, ` : ""}
                      {r.state}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" /> {r.offerCount ?? 0} offer{r.offerCount === 1 ? "" : "s"}
                    </span>
                    {r.expiresAt && r.status === "open" && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> closes {formatDateTime(r.expiresAt)}
                      </span>
                    )}
                    <span>{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {(r.budgetMin || r.budgetMax) && (
                    <>
                      <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                        Budget
                      </p>
                      <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                        {r.budgetMax ? formatPrice(r.budgetMax) : formatPrice(r.budgetMin!)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {!!r.images?.length && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {r.images.map((src) => (
                    <img key={src} src={src} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ))}
                </div>
              )}

              <div
                className="mt-3 pt-3 flex items-center justify-between gap-2 flex-wrap"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                {r.myOffer ? (
                  <p className="text-xs" style={{ color: "var(--ink)" }}>
                    Your offer ({OFFER_PRICE_LABELS[r.type].toLowerCase()}):{" "}
                    <strong style={{ color: ACCENT }}>{formatPrice(r.myOffer.price)}</strong>
                    {r.myOffer.status && r.myOffer.status !== "active" && ` · ${r.myOffer.status}`}
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                    You haven&apos;t offered yet
                  </p>
                )}
                {r.status === "open" && (
                  <Button variant={r.myOffer ? "soft" : "primary"} Icon={HandCoins} onClick={() => setOffering(r)}>
                    {r.myOffer ? "Update offer" : "Make an offer"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {offering && (
        <OfferModal
          request={offering}
          onClose={() => setOffering(null)}
          onSaved={() => {
            setOffering(null);
            load();
          }}
        />
      )}
    </div>
  );
}
