import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import { isValidNigerianPhone } from "@/app/lib/validation";
import { REPAIR_SPECIALTIES, type RepairSpecialty } from "@/app/lib/repairVendors";

function serialize(doc: Record<string, unknown>) {
  return {
    id: String(doc._id),
    userId: doc.userId as string,
    businessName: doc.businessName as string,
    phone: doc.phone as string,
    specialties: doc.specialties as RepairSpecialty[],
    area: doc.area as string | undefined,
    createdAt: (doc.createdAt as Date).toISOString(),
  };
}

export async function GET() {
  try {
    const mongo = await clientPromise;
    const docs = await mongo
      .db()
      .collection("repairVendors")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ vendors: docs.map(serialize) });
  } catch {
    return NextResponse.json({ vendors: [] });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Sign in to list your repair business." }, { status: 401 });

  let body: { businessName?: string; phone?: string; specialties?: string[]; area?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const businessName = body.businessName?.trim();
  const phone = body.phone?.trim();
  const specialties = (body.specialties ?? []).filter((s): s is RepairSpecialty =>
    (REPAIR_SPECIALTIES as readonly string[]).includes(s)
  );
  const area = body.area?.trim() || undefined;

  if (!businessName || businessName.length < 2) {
    return NextResponse.json({ error: "Enter your business or technician name." }, { status: 400 });
  }
  if (!phone || !isValidNigerianPhone(phone)) {
    return NextResponse.json({ error: "Enter a valid Nigerian phone number." }, { status: 400 });
  }
  if (specialties.length === 0) {
    return NextResponse.json({ error: "Pick at least one specialty." }, { status: 400 });
  }

  try {
    const mongo = await clientPromise;
    const doc = {
      userId: user.id,
      businessName,
      phone,
      specialties,
      area,
      createdAt: new Date(),
    };
    const result = await mongo.db().collection("repairVendors").insertOne(doc);
    return NextResponse.json({ vendor: serialize({ ...doc, _id: result.insertedId }) });
  } catch {
    return NextResponse.json({ error: "Could not list your business. Try again." }, { status: 500 });
  }
}
