"use client";

import { useState } from "react";
import { HandCoins } from "lucide-react";
import { apiJson, jsonBody } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/helpers";
import type { MarketListing } from "@/app/types/backend";
import { Modal, Field, Button, ErrorText, Notice, fieldClass, fieldStyle } from "@/app/component/ui/kit";

/**
 * A vendor's offer on a marketplace listing. Bids are blind: the seller sees
 * every offer, other vendors only see how many there are, and a vendor only
 * ever sees their own amount.
 */
export default function VendorBidModal({
  listing,
  onClose,
  onPlaced,
}: {
  listing: MarketListing;
  onClose: () => void;
  onPlaced?: () => void;
}) {
  const myBid = listing.bids?.[0];
  const [amount, setAmount] = useState(String(myBid?.amount ?? listing.estimatedMin ?? ""));
  const [message, setMessage] = useState(myBid?.message ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) return setError("Enter the amount you'll pay.");
    setSaving(true);
    setError(null);
    const res = await apiJson(
      "/api/vendor/bid",
      jsonBody({ listingId: listing._id, amount: value, message: message.trim() || undefined })
    );
    setSaving(false);
    if (!res.ok) {
      setError(
        res.status === 403 ? "Only approved vendors can make offers — finish your vendor verification first." : res.message
      );
      return;
    }
    setDone(true);
    onPlaced?.();
  };

  return (
    <Modal open onClose={onClose} title={`Offer on ${listing.deviceName}`} Icon={HandCoins}>
      {done ? (
        <div className="text-center py-4">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
            Offer sent — {formatPrice(Number(amount))}
          </p>
          <p className="text-xs mb-5" style={{ color: "var(--ink-soft)" }}>
            The seller is notified. If they accept, TechNest arranges the handover.
          </p>
          <Button onClick={onClose} full>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
            Valued at {formatPrice(listing.estimatedMin)} – {formatPrice(listing.estimatedMax)}
            {listing.bidCount ? ` · ${listing.bidCount} offer${listing.bidCount === 1 ? "" : "s"} so far` : ""}
          </p>
          <Notice tone="neutral">Offers are blind — other vendors can&apos;t see your amount.</Notice>
          <Field label="Your offer (₦)">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className={fieldClass}
              style={fieldStyle}
            />
          </Field>
          <Field label="Message to the seller" optional>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="e.g. Can pick up today in Ikeja"
              className={`${fieldClass} resize-none`}
              style={fieldStyle}
            />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button onClick={submit} loading={saving} full>
            {myBid ? "Update offer" : "Send offer"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
