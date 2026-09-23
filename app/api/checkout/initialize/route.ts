import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import { phones, gadgets } from "@/app/data/gadget";
import { isValidNigerianPhone } from "@/app/lib/validation";
import { computeListingCheckout } from "@/app/lib/paystackFees";
import type { PayoutAccount } from "@/app/lib/payout";
import type { ItemType, PhoneCondition, OrderLineItem } from "@/app/lib/orders";

type CartCheckoutItem = { itemId: string; itemType: "phone" | "gadget"; condition: PhoneCondition; quantity: number };

// Re-derive every item and its price server-side from the catalog — never
// trust a client-supplied amount, or anyone could pay ₦1 for a MacBook Pro
// by editing the request body.
function lookupItem(itemId: string, itemType: "phone" | "gadget") {
  if (itemType === "phone") {
    const phone = phones.find((p) => p.id === itemId);
    if (!phone) return null;
    return { name: phone.name, spec: phone.storage?.[0], priceUkUsed: phone.priceUkUsed, priceBrandNew: phone.priceBrandNew };
  }
  const gadget = gadgets.find((g) => g.id === itemId);
  if (!gadget) return null;
  return { name: gadget.name, spec: gadget.spec, priceUkUsed: gadget.priceUkUsed, priceBrandNew: gadget.priceBrandNew };
}

type BackendListing = {
  _id: string;
  deviceName: string;
  storage?: string;
  estimatedMax: number;
  status?: string;
  owner?: { _id: string; name: string };
};

async function lookupListing(listingId: string, cookie: string | null): Promise<BackendListing | null> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl || !/^https?:\/\//.test(backendUrl)) return null;
  try {
    const res = await fetch(`${backendUrl}/api/listings/${listingId}`, {
      headers: cookie ? { cookie } : undefined,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data?.listing ?? body?.data ?? body?.listing ?? null) as BackendListing | null;
  } catch {
    return null;
  }
}

async function startPaystack(
  secretKey: string,
  origin: string,
  email: string,
  amount: number,
  reference: string,
  metadata: Record<string, unknown>,
  split?: { subaccountCode: string; platformFeeKobo: number }
) {
  const payload: Record<string, unknown> = {
    email,
    amount: Math.round(amount * 100), // kobo
    reference,
    callback_url: `${origin}/checkout/callback`,
    metadata,
  };
  if (split) {
    payload.subaccount = split.subaccountCode;
    payload.transaction_charge = split.platformFeeKobo;
    // The platform (main account) absorbs Paystack's real processing fee —
    // we've already priced it into transaction_charge above, so the seller
    // always nets their exact listed price.
    payload.bearer = "account";
  }

  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const paystackData = await paystackRes.json();
  if (!paystackRes.ok || !paystackData.status) {
    return { error: paystackData.message || "Could not start checkout. Try again." };
  }
  return { authorizationUrl: paystackData.data.authorization_url as string };
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Checkout is not configured yet. Add PAYSTACK_SECRET_KEY to .env to enable payments." },
      { status: 503 }
    );
  }

  let body: {
    items?: CartCheckoutItem[];
    listingId?: string;
    swapTransactionId?: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    deliveryAddress: string;
  };
  try {
    body = await req.json();
    if (
      !body.buyerName?.trim() ||
      !body.buyerEmail?.trim() ||
      !body.buyerPhone?.trim() ||
      !body.deliveryAddress?.trim() ||
      (!body.swapTransactionId && !body.listingId && (!body.items || body.items.length === 0))
    ) {
      throw new Error("missing fields");
    }
  } catch {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }

  if (!isValidNigerianPhone(body.buyerPhone)) {
    return NextResponse.json({ error: "Enter a valid Nigerian phone number." }, { status: 400 });
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const now = new Date();
    const origin = req.nextUrl.origin;

    // ── Swap price-difference top-up ──────────────────────────────────────
    if (body.swapTransactionId) {
      const user = await getCurrentUser(req);
      if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

      let objectId: ObjectId;
      try {
        objectId = new ObjectId(body.swapTransactionId);
      } catch {
        return NextResponse.json({ error: "Swap request not found." }, { status: 404 });
      }
      const txn = await db.collection("transactions").findOne({ _id: objectId });
      if (!txn) return NextResponse.json({ error: "Swap request not found." }, { status: 404 });
      if (txn.buyerId !== user.id) {
        return NextResponse.json({ error: "This isn't your swap request." }, { status: 403 });
      }
      const diff = txn.swapDetails?.priceDifference ?? 0;
      if (diff <= 0) {
        return NextResponse.json({ error: "No payment is needed for this swap." }, { status: 400 });
      }

      const itemName = `Swap top-up: ${txn.swapDetails?.offeredDeviceName ?? "your device"} → ${txn.listingDeviceName}`;
      const lineItems: OrderLineItem[] = [
        { itemId: body.swapTransactionId, itemType: "swap", name: itemName, condition: "uk-used", unitPrice: diff, quantity: 1 },
      ];
      const orderDoc = {
        reference: "",
        itemId: body.swapTransactionId,
        itemType: "swap" as ItemType,
        itemName,
        itemSpec: undefined,
        condition: "uk-used" as PhoneCondition,
        amount: diff,
        items: lineItems,
        buyerName: body.buyerName.trim(),
        buyerEmail: body.buyerEmail.trim(),
        buyerPhone: body.buyerPhone.trim(),
        deliveryAddress: body.deliveryAddress.trim(),
        status: "pending" as const,
        createdAt: now,
        updatedAt: now,
      };
      const insertResult = await db.collection("orders").insertOne(orderDoc);
      const reference = `TN-${insertResult.insertedId.toString()}`;
      await db.collection("orders").updateOne({ _id: insertResult.insertedId }, { $set: { reference } });

      const result = await startPaystack(secretKey, origin, body.buyerEmail.trim(), diff, reference, {
        swapTransactionId: body.swapTransactionId,
        buyerName: body.buyerName.trim(),
      });
      if ("error" in result) return NextResponse.json({ error: result.error }, { status: 502 });
      return NextResponse.json({ authorizationUrl: result.authorizationUrl, reference });
    }

    // ── Marketplace listing purchase (split: seller price + platform fee) ──
    if (body.listingId) {
      const user = await getCurrentUser(req);
      if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

      const listing = await lookupListing(body.listingId, req.headers.get("cookie"));
      if (!listing || !listing.owner?._id) {
        return NextResponse.json({ error: "That listing could not be found." }, { status: 404 });
      }
      if (listing.owner._id === user.id) {
        return NextResponse.json({ error: "You can't buy your own listing." }, { status: 400 });
      }

      const payoutAccount = await db
        .collection<PayoutAccount>("payoutAccounts")
        .findOne({ userId: listing.owner._id });
      if (!payoutAccount) {
        return NextResponse.json(
          { error: "This seller hasn't set up payouts yet — try reaching them on WhatsApp instead." },
          { status: 409 }
        );
      }

      const { sellerPrice, platformFee, totalCharge } = computeListingCheckout(listing.estimatedMax);
      const itemName = listing.deviceName;
      const lineItems: OrderLineItem[] = [
        {
          itemId: body.listingId,
          itemType: "listing",
          name: itemName,
          spec: listing.storage,
          condition: "uk-used",
          unitPrice: totalCharge,
          quantity: 1,
        },
      ];

      const orderDoc = {
        reference: "",
        itemId: body.listingId,
        itemType: "listing" as ItemType,
        itemName,
        itemSpec: listing.storage,
        condition: "uk-used" as PhoneCondition,
        amount: totalCharge,
        items: lineItems,
        sellerId: listing.owner._id,
        sellerAmount: sellerPrice,
        platformFee,
        subaccountCode: payoutAccount.subaccountCode,
        buyerName: body.buyerName.trim(),
        buyerEmail: body.buyerEmail.trim(),
        buyerPhone: body.buyerPhone.trim(),
        deliveryAddress: body.deliveryAddress.trim(),
        status: "pending" as const,
        createdAt: now,
        updatedAt: now,
      };
      const insertResult = await db.collection("orders").insertOne(orderDoc);
      const reference = `TN-${insertResult.insertedId.toString()}`;
      await db.collection("orders").updateOne({ _id: insertResult.insertedId }, { $set: { reference } });

      const result = await startPaystack(
        secretKey,
        origin,
        body.buyerEmail.trim(),
        totalCharge,
        reference,
        { listingId: body.listingId, buyerName: body.buyerName.trim() },
        { subaccountCode: payoutAccount.subaccountCode, platformFeeKobo: Math.round(platformFee * 100) }
      );
      if ("error" in result) return NextResponse.json({ error: result.error }, { status: 502 });
      return NextResponse.json({ authorizationUrl: result.authorizationUrl, reference });
    }

    // ── Cart checkout (catalog phones/gadgets — one or many items) ─────────
    const cartItems = body.items!;
    const lineItems: OrderLineItem[] = [];
    for (const line of cartItems) {
      const item = lookupItem(line.itemId, line.itemType);
      if (!item) {
        return NextResponse.json({ error: "One of the items in your cart could not be found." }, { status: 404 });
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 20) {
        return NextResponse.json({ error: "Invalid quantity." }, { status: 400 });
      }
      const unitPrice = line.condition === "uk-used" ? item.priceUkUsed : item.priceBrandNew;
      lineItems.push({
        itemId: line.itemId,
        itemType: line.itemType,
        name: item.name,
        spec: item.spec,
        condition: line.condition,
        unitPrice,
        quantity: line.quantity,
      });
    }
    const amount = lineItems.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const itemName =
      lineItems.length === 1
        ? lineItems[0].name
        : `${lineItems[0].name} + ${lineItems.length - 1} more item${lineItems.length > 2 ? "s" : ""}`;

    const orderDoc = {
      reference: "",
      itemId: lineItems[0].itemId,
      itemType: lineItems[0].itemType,
      itemName,
      itemSpec: lineItems.length === 1 ? lineItems[0].spec : undefined,
      condition: lineItems[0].condition,
      amount,
      items: lineItems,
      buyerName: body.buyerName.trim(),
      buyerEmail: body.buyerEmail.trim(),
      buyerPhone: body.buyerPhone.trim(),
      deliveryAddress: body.deliveryAddress.trim(),
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
    };
    const insertResult = await db.collection("orders").insertOne(orderDoc);
    const reference = `TN-${insertResult.insertedId.toString()}`;
    await db.collection("orders").updateOne({ _id: insertResult.insertedId }, { $set: { reference } });

    const result = await startPaystack(secretKey, origin, body.buyerEmail.trim(), amount, reference, {
      itemName,
      buyerName: body.buyerName.trim(),
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 502 });
    return NextResponse.json({ authorizationUrl: result.authorizationUrl, reference });
  } catch {
    return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 500 });
  }
}
