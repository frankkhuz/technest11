// Shared types for the local checkout/order system. Like transactions.ts,
// this is side-data this app owns (local MongoDB) — the external backend
// has no concept of a "catalog order" (it only knows about marketplace
// listings), so orders for /buy catalog items live here.

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";
export type ItemType = "phone" | "gadget";
export type PhoneCondition = "uk-used" | "brand-new";

export type Order = {
  id: string;
  reference: string;
  itemId: string;
  itemType: ItemType;
  itemName: string;
  itemSpec?: string;
  condition: PhoneCondition;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};
