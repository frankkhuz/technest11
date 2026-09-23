import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";

export async function PATCH(
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

  let status: "fulfilled" | "closed";
  try {
    const body = await req.json();
    status = body.status;
    if (!["fulfilled", "closed"].includes(status)) throw new Error("invalid status");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const collection = db.collection("vendorRequests");
    const doc = await collection.findOne({ _id: objectId });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.vendorId !== user.id) {
      return NextResponse.json({ error: "Not your request" }, { status: 403 });
    }
    await collection.updateOne({ _id: objectId }, { $set: { status } });
    return NextResponse.json({ status });
  } catch {
    return NextResponse.json({ error: "Could not update. Try again." }, { status: 500 });
  }
}
