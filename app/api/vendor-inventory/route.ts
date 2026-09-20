import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import type { VendorInventoryItem, InventoryCondition } from "@/app/lib/transactions";

function serialize(doc: Record<string, unknown>): VendorInventoryItem {
  return {
    id: String(doc._id),
    vendorId: doc.vendorId as string,
    vendorName: doc.vendorName as string,
    vendorPhone: doc.vendorPhone as string | undefined,
    deviceName: doc.deviceName as string,
    condition: doc.condition as InventoryCondition,
    price: doc.price as number,
    quantity: doc.quantity as number,
    notes: doc.notes as string | undefined,
    createdAt: (doc.createdAt as Date).toISOString(),
  };
}

async function requireVerifiedVendor(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || user.userType !== "vendor" || !user.vendorVerified) return null;
  return user;
}

// GET /api/vendor-inventory        -> every verified vendor's inventory (B2B matching pool)
// GET /api/vendor-inventory?mine=1 -> just the current vendor's own items
export async function GET(req: NextRequest) {
  const user = await requireVerifiedVendor(req);
  if (!user) {
    return NextResponse.json({ error: "Verified vendors only" }, { status: 403 });
  }

  const mine = req.nextUrl.searchParams.get("mine") === "1";

  try {
    const mongo = await clientPromise;
    const db = mongo.db();
    const docs = await db
      .collection("vendorInventory")
      .find(mine ? { vendorId: user.id } : {})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
    return NextResponse.json({ items: docs.map(serialize) });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireVerifiedVendor(req);
  if (!user) {
    return NextResponse.json({ error: "Verified vendors only" }, { status: 403 });
  }

  let body: {
    deviceName: string;
    condition: InventoryCondition;
    price: number;
    quantity?: number;
    notes?: string;
    vendorPhone?: string;
  };
  try {
    body = await req.json();
    if (
      !body.deviceName?.trim() ||
      !body.condition ||
      !Number.isFinite(body.price) ||
      body.price <= 0
    ) {
      throw new Error("missing fields");
    }
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
      condition: body.condition,
      price: body.price,
      quantity: Number.isFinite(body.quantity) && body.quantity! > 0 ? body.quantity : 1,
      notes: body.notes?.trim(),
      createdAt: now,
    };
    const result = await db.collection("vendorInventory").insertOne(doc);
    return NextResponse.json({ item: serialize({ ...doc, _id: result.insertedId }) });
  } catch {
    return NextResponse.json(
      { error: "Could not add to inventory. Try again." },
      { status: 500 }
    );
  }
}
