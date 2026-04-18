import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/app/lib/mongo";

export async function POST(req: Request) {
  const { email, password, role } = await req.json();

  const client = await clientPromise;
  const db = client.db();

  const existing = await db.collection("users").findOne({ email });

  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.collection("users").insertOne({
    email,
    password: hashed,
    role: role || "user",
    createdAt: new Date(),
  });

  return NextResponse.json({ message: "User created" });
}
