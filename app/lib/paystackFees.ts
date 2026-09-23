// Shared money-math for marketplace-listing checkouts, where the buyer pays
// the seller's asking price PLUS a platform markup that covers Paystack's
// own processing fee and TechNest's commission. Kept in one place so the
// checkout API and the seller payout UI always agree on the numbers.

// TechNest's commission, as a percentage of the seller's price. Configurable
// via env so it can be tuned without a code change; 5% is a reasonable
// marketplace-commission default until the business sets its own rate.
export const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || 5);

// Paystack Nigeria's standard local-card rate: 1.5% + ₦100, capped at
// ₦2,000, with the flat ₦100 waived under ₦2,500. This is an estimate we
// charge the buyer up front — the platform (not the seller) actually bears
// Paystack's real deduction via `bearer: "account"` at initialize time, so
// slight rounding differences land on the platform's margin, never the
// seller's payout.
export function estimatePaystackFee(amountNaira: number): number {
  const percentFee = amountNaira * 0.015;
  const flatFee = amountNaira < 2500 ? 0 : 100;
  return Math.min(percentFee + flatFee, 2000);
}

/** Given a seller's asking price, returns what the buyer pays and how the
 * total splits between the seller's payout and the platform's cut. */
export function computeListingCheckout(sellerPrice: number) {
  const paystackFee = Math.round(estimatePaystackFee(sellerPrice));
  const commission = Math.round(sellerPrice * (PLATFORM_FEE_PERCENT / 100));
  const platformFee = paystackFee + commission;
  const totalCharge = sellerPrice + platformFee;
  return { sellerPrice, paystackFee, commission, platformFee, totalCharge };
}
