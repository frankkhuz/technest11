import { NextResponse } from "next/server";

// Nigerian bank list rarely changes — cache it in memory for the life of
// the server instance instead of hitting Paystack on every dropdown open.
let cachedBanks: { id: number; name: string; code: string }[] | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function GET() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payouts are not configured yet. Add PAYSTACK_SECRET_KEY to .env." },
      { status: 503 }
    );
  }

  if (cachedBanks && Date.now() - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({ banks: cachedBanks });
  }

  try {
    const res = await fetch("https://api.paystack.co/bank?country=nigeria&currency=NGN", {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      return NextResponse.json({ error: "Could not load bank list." }, { status: 502 });
    }
    cachedBanks = (data.data as { id: number; name: string; code: string }[]).map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
    }));
    cachedAt = Date.now();
    return NextResponse.json({ banks: cachedBanks });
  } catch {
    return NextResponse.json({ error: "Could not load bank list." }, { status: 500 });
  }
}
