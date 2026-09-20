import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import { phones, gadgets } from "@/app/data/gadget";
import { isValidNigerianPhone } from "@/app/lib/validation";
import type { ItemType, PhoneCondition } from "@/app/lib/orders";

// Re-derive the item and its price server-side from the catalog — never
// trust a client-supplied amount, or anyone could pay ₦1 for a MacBook Pro
// by editing the request body.
function lookupItem(itemId: string, itemType: ItemType) {
  if (itemType === "phone") {
    const phone = phones.find((p) => p.id === itemId);
    if (!phone) return null;
    return { name: phone.name, spec: phone.storage?.[0], priceUkUsed: phone.priceUkUsed, priceBrandNew: phone.priceBrandNew };
  }
  const gadget = gadgets.find((g) => g.id === itemId);
  if (!gadget) return null;
  return { name: gadget.name, spec: gadget.spec, priceUkUsed: gadget.priceUkUsed, priceBrandNew: gadget.priceBrandNew };
}

async function startPaystack(
  secretKey: string,
  origin: string,
  email: string,
  amount: number,
  reference: string,
  metadata: Record<string, unknown>
) {
  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // kobo
      reference,
      callback_url: `${origin}/checkout/callback`,
      metadata,
    }),
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
    itemId?: string;
    itemType?: ItemType;
    condition?: PhoneCondition;
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
      (!body.swapTransactionId && (!body.itemId || !body.itemType || !body.condition))
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
        return NextResponse.json(
          { error: "No payment is needed for this swap." },
          { status: 400 }
        );
      }

      const orderDoc = {
        reference: "",
        itemId: body.swapTransactionId,
        itemType: "swap" as const,
        itemName: `Swap top-up: ${txn.swapDetails?.offeredDeviceName ?? "your device"} → ${txn.listingDeviceName}`,
        itemSpec: undefined,
        condition: "uk-used" as const,
        amount: diff,
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

    // ── Catalog purchase ─────────────────────────────────────────────────
    const item = lookupItem(body.itemId!, body.itemType!);
    if (!item) {
      return NextResponse.json({ error: "That item could not be found." }, { status: 404 });
    }
    const amount = body.condition === "uk-used" ? item.priceUkUsed : item.priceBrandNew;

    const orderDoc = {
      reference: "",
      itemId: body.itemId,
      itemType: body.itemType,
      itemName: item.name,
      itemSpec: item.spec,
      condition: body.condition,
      amount,
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
      itemName: item.name,
      condition: body.condition,
      buyerName: body.buyerName.trim(),
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 502 });
    return NextResponse.json({ authorizationUrl: result.authorizationUrl, reference });
  } catch {
    return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 500 });
  }
}
