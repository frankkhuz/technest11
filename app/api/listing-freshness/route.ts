import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import type { ListingFreshness } from "@/app/lib/transactions";

function serialize(doc: Record<string, unknown>): ListingFreshness {
  return {
    listingId: doc.listingId as string,
    lastCheckedAt: doc.lastCheckedAt ? (doc.lastCheckedAt as Date).toISOString() : null,
    markedUnavailable: Boolean(doc.markedUnavailable),
  };
}

// Bulk read: /api/listing-freshness?ids=a,b,c — used by the marketplace grid
// to join freshness badges onto listings fetched from the external backend.
export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ freshness: [] });
  const ids = idsParam.split(",").filter(Boolean).slice(0, 200);

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const docs = await db
      .collection("listingFreshness")
      .find({ listingId: { $in: ids } })
      .toArray();
    return NextResponse.json({ freshness: docs.map(serialize) });
  } catch {
    return NextResponse.json({ freshness: [] });
  }
}

// A seller confirming their own listing is still available, or marking it
// unavailable. Anyone signed in can call this today (there's no local
// record of who owns which external listing id to check against) — the
// action only writes a timestamp, not the listing itself, so the worst
// case is a wrong "checked" badge, not a data-integrity problem.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: { listingId: string; markedUnavailable?: boolean };
  try {
    body = await req.json();
    if (!body.listingId) throw new Error("missing listingId");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const now = new Date();
    await db.collection("listingFreshness").updateOne(
      { listingId: body.listingId },
      {
        $set: {
          listingId: body.listingId,
          lastCheckedAt: now,
          markedUnavailable: Boolean(body.markedUnavailable),
          updatedBy: user.id,
        },
      },
      { upsert: true }
    );
    return NextResponse.json({
      freshness: {
        listingId: body.listingId,
        lastCheckedAt: now.toISOString(),
        markedUnavailable: Boolean(body.markedUnavailable),
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not update. Try again." }, { status: 500 });
  }
}
