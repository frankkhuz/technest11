import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const conversations = await db
      .collection("gadgetConversations")
      .find({ userId: user.id })
      .project({ title: 1, updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .limit(30)
      .toArray();

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        updatedAt: c.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json({ conversations: [] });
  }
}
