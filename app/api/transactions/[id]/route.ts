import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import type { TransactionStatus } from "@/app/lib/transactions";

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let nextStatus: TransactionStatus;
  try {
    const body = await req.json();
    nextStatus = body.status;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const collection = db.collection("transactions");
    const doc = await collection.findOne({ _id: objectId });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParty = doc.sellerId === user.id || doc.buyerId === user.id;
    if (!isParty) return NextResponse.json({ error: "Not your transaction" }, { status: 403 });

    // Only the seller decides whether to accept or reject a pending request —
    // they're the one being asked to commit to the deal. Once accepted,
    // either side can mark it completed or cancel it.
    if (doc.status === "pending" && doc.sellerId !== user.id) {
      return NextResponse.json(
        { error: "Only the seller can respond to a pending request." },
        { status: 403 }
      );
    }

    const allowed = VALID_TRANSITIONS[doc.status as TransactionStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json(
        { error: `Can't move from ${doc.status} to ${nextStatus}.` },
        { status: 400 }
      );
    }

    await collection.updateOne(
      { _id: objectId },
      { $set: { status: nextStatus, updatedAt: new Date() } }
    );

    return NextResponse.json({ status: nextStatus });
  } catch {
    return NextResponse.json({ error: "Could not update. Try again." }, { status: 500 });
  }
}
