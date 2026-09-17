import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import type { VendorRequest } from "@/app/lib/transactions";

function serialize(doc: Record<string, unknown>): VendorRequest {
  return {
    id: String(doc._id),
    vendorId: doc.vendorId as string,
    vendorName: doc.vendorName as string,
    vendorPhone: doc.vendorPhone as string | undefined,
    deviceName: doc.deviceName as string,
    notes: doc.notes as string | undefined,
    status: doc.status as VendorRequest["status"],
    createdAt: (doc.createdAt as Date).toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.userType !== "vendor") {
    return NextResponse.json({ error: "Vendors only" }, { status: 403 });
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const docs = await db
      .collection("vendorRequests")
      .find({ status: "open" })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ requests: docs.map(serialize) });
  } catch {
    return NextResponse.json({ requests: [] });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.userType !== "vendor") {
    return NextResponse.json({ error: "Vendors only" }, { status: 403 });
  }

  let body: { deviceName: string; notes?: string; vendorPhone?: string };
  try {
    body = await req.json();
    if (!body.deviceName?.trim()) throw new Error("missing deviceName");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const now = new Date();
    const doc = {
      vendorId: user.id,
      vendorName: user.name ?? "Vendor",
      vendorPhone: body.vendorPhone,
      deviceName: body.deviceName.trim(),
      notes: body.notes?.trim(),
      status: "open" as const,
      createdAt: now,
    };
    const result = await db.collection("vendorRequests").insertOne(doc);
    return NextResponse.json({ request: serialize({ ...doc, _id: result.insertedId }) });
  } catch {
    return NextResponse.json(
      { error: "Could not post the request. Try again." },
      { status: 500 }
    );
  }
}
