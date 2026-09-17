import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
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

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Checkout is not configured yet. Add PAYSTACK_SECRET_KEY to .env to enable payments." },
      { status: 503 }
    );
  }

  let body: {
    itemId: string;
    itemType: ItemType;
    condition: PhoneCondition;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    deliveryAddress: string;
  };
  try {
    body = await req.json();
    if (
      !body.itemId ||
      !body.itemType ||
      !body.condition ||
      !body.buyerName?.trim() ||
      !body.buyerEmail?.trim() ||
      !body.buyerPhone?.trim() ||
      !body.deliveryAddress?.trim()
    ) {
      throw new Error("missing fields");
    }
  } catch {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }

  if (!isValidNigerianPhone(body.buyerPhone)) {
    return NextResponse.json({ error: "Enter a valid Nigerian phone number." }, { status: 400 });
  }

  const item = lookupItem(body.itemId, body.itemType);
  if (!item) {
    return NextResponse.json({ error: "That item could not be found." }, { status: 404 });
  }

  const amount = body.condition === "uk-used" ? item.priceUkUsed : item.priceBrandNew;

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const now = new Date();
    const orderDoc = {
      reference: "", // filled in below once we have the Mongo _id
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

    const origin = req.nextUrl.origin;
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.buyerEmail.trim(),
        amount: Math.round(amount * 100), // kobo
        reference,
        callback_url: `${origin}/checkout/callback`,
        metadata: {
          itemName: item.name,
          condition: body.condition,
          buyerName: body.buyerName.trim(),
        },
      }),
    });
    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || "Could not start checkout. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference,
    });
  } catch {
    return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 500 });
  }
}
