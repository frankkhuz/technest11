import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import type { Transaction, TransactionType, SwapDetails } from "@/app/lib/transactions";

function serialize(doc: Record<string, unknown>): Transaction {
  return {
    id: String(doc._id),
    type: doc.type as TransactionType,
    listingId: doc.listingId as string,
    listingDeviceName: doc.listingDeviceName as string,
    listingStorage: doc.listingStorage as string | undefined,
    sellerId: doc.sellerId as string,
    sellerName: doc.sellerName as string,
    buyerId: doc.buyerId as string,
    buyerName: doc.buyerName as string,
    buyerPhone: doc.buyerPhone as string | undefined,
    status: doc.status as Transaction["status"],
    swapDetails: doc.swapDetails as SwapDetails | undefined,
    createdAt: (doc.createdAt as Date).toISOString(),
    updatedAt: (doc.updatedAt as Date).toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const role = req.nextUrl.searchParams.get("role"); // "buyer" | "seller" | undefined (both)
  const status = req.nextUrl.searchParams.get("status");

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const filter: Record<string, unknown> =
      role === "buyer"
        ? { buyerId: user.id }
        : role === "seller"
        ? { sellerId: user.id }
        : { $or: [{ buyerId: user.id }, { sellerId: user.id }] };
    if (status) filter.status = status;

    const docs = await db
      .collection("transactions")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ transactions: docs.map(serialize) });
  } catch {
    return NextResponse.json({ transactions: [] });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: {
    type: TransactionType;
    listingId: string;
    listingDeviceName: string;
    listingStorage?: string;
    sellerId: string;
    sellerName: string;
    swapDetails?: SwapDetails;
  };
  try {
    body = await req.json();
    if (!body.type || !body.listingId || !body.sellerId) throw new Error("missing fields");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.sellerId === user.id) {
    return NextResponse.json(
      { error: "You can't open a transaction on your own listing." },
      { status: 400 }
    );
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const now = new Date();
    const doc = {
      type: body.type,
      listingId: body.listingId,
      listingDeviceName: body.listingDeviceName,
      listingStorage: body.listingStorage,
      sellerId: body.sellerId,
      sellerName: body.sellerName,
      buyerId: user.id,
      buyerName: user.name ?? "Buyer",
      buyerPhone: user.email, // best-effort contact reference; real phone comes from the listing/user record
      status: "pending" as const,
      swapDetails: body.swapDetails,
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("transactions").insertOne(doc);
    return NextResponse.json({ transaction: serialize({ ...doc, _id: result.insertedId }) });
  } catch {
    return NextResponse.json(
      { error: "Could not create the transaction. Try again." },
      { status: 500 }
    );
  }
}
