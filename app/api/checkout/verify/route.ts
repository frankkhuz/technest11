import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import type { Order } from "@/app/lib/orders";

function serialize(doc: Record<string, unknown>): Order {
  return {
    id: String(doc._id),
    reference: doc.reference as string,
    itemId: doc.itemId as string,
    itemType: doc.itemType as Order["itemType"],
    itemName: doc.itemName as string,
    itemSpec: doc.itemSpec as string | undefined,
    condition: doc.condition as Order["condition"],
    amount: doc.amount as number,
    buyerName: doc.buyerName as string,
    buyerEmail: doc.buyerEmail as string,
    buyerPhone: doc.buyerPhone as string,
    deliveryAddress: doc.deliveryAddress as string,
    status: doc.status as Order["status"],
    createdAt: (doc.createdAt as Date).toISOString(),
    updatedAt: (doc.updatedAt as Date).toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 503 });
  }

  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const collection = db.collection("orders");
    const doc = await collection.findOne({ reference });
    if (!doc) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Already verified (e.g. the callback page re-mounted) — return the
    // stored result instead of re-hitting Paystack.
    if (doc.status === "paid" || doc.status === "failed") {
      return NextResponse.json({ order: serialize(doc) });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const paystackData = await paystackRes.json();

    const success = paystackRes.ok && paystackData.status && paystackData.data?.status === "success";
    const nextStatus = success ? "paid" : "failed";

    await collection.updateOne(
      { reference },
      { $set: { status: nextStatus, updatedAt: new Date() } }
    );

    return NextResponse.json({ order: serialize({ ...doc, status: nextStatus }) });
  } catch {
    return NextResponse.json({ error: "Could not verify payment. Try again." }, { status: 500 });
  }
}
