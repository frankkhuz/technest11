import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
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
    const conversation = await db
      .collection("gadgetConversations")
      .findOne({ _id: objectId, userId: user.id });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: conversation._id.toString(),
      title: conversation.title,
      messages: conversation.messages,
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
