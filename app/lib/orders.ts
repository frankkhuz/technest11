// Shared types for the local checkout/order system. Like transactions.ts,
// this is side-data this app owns (local MongoDB) — the external backend
// has no concept of a "catalog order" (it only knows about marketplace
// listings), so orders for /buy catalog items live here.

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";
export type ItemType = "phone" | "gadget" | "swap" | "listing";
export type PhoneCondition = "uk-used" | "brand-new";

export type OrderLineItem = {
  itemId: string;
  itemType: ItemType;
  name: string;
  spec?: string;
  condition: PhoneCondition;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  reference: string;
  itemId: string;
  itemType: ItemType;
  itemName: string;
  itemSpec?: string;
  condition: PhoneCondition;
  amount: number;
  /** Itemized breakdown — populated for cart checkouts (may hold several
   * lines) and for single-item/swap/listing checkouts (always exactly one
   * line, mirroring the top-level itemName/amount for backward compat). */
  items?: OrderLineItem[];
  /** Marketplace-listing purchases only: the seller's cut vs. the platform's
   * added fee, and which Paystack subaccount (if any) received the split. */
  sellerId?: string;
  sellerAmount?: number;
  platformFee?: number;
  subaccountCode?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};
