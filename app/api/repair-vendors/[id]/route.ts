import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  try {
    const mongo = await clientPromise;
    const collection = mongo.db().collection("repairVendors");
    const doc = await collection.findOne({ _id: objectId });
    if (!doc) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    if (doc.userId !== user.id) {
      return NextResponse.json({ error: "This isn't your listing." }, { status: 403 });
    }
    await collection.deleteOne({ _id: objectId });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not remove listing." }, { status: 500 });
  }
}
