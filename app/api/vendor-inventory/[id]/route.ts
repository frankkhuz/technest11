import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user || user.userType !== "vendor" || !user.vendorVerified) {
    return NextResponse.json({ error: "Verified vendors only" }, { status: 403 });
  }

  const { id } = await params;
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const collection = db.collection("vendorInventory");
    const doc = await collection.findOne({ _id: objectId });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.vendorId !== user.id) {
      return NextResponse.json({ error: "Not your inventory item" }, { status: 403 });
    }
    await collection.deleteOne({ _id: objectId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not remove item. Try again." }, { status: 500 });
  }
}
