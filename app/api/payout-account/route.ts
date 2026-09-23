import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import { PLATFORM_FEE_PERCENT } from "@/app/lib/paystackFees";
import type { PayoutAccount } from "@/app/lib/payout";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  try {
    const mongo = await clientPromise;
    const account = await mongo
      .db()
      .collection<PayoutAccount>("payoutAccounts")
      .findOne({ userId: user.id });

    if (!account) return NextResponse.json({ account: null });

    return NextResponse.json({
      account: {
        bankName: account.bankName,
        accountName: account.accountName,
        accountNumberMasked: `••••${account.accountNumber.slice(-4)}`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not load payout details." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payouts are not configured yet. Add PAYSTACK_SECRET_KEY to .env." },
      { status: 503 }
    );
  }

  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: { bankCode?: string; bankName?: string; accountNumber?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const bankCode = body.bankCode?.trim();
  const bankName = body.bankName?.trim();
  const accountNumber = body.accountNumber?.trim();
  if (!bankCode || !bankName || !accountNumber || !/^\d{10}$/.test(accountNumber)) {
    return NextResponse.json(
      { error: "Select a bank and enter a valid 10-digit account number." },
      { status: 400 }
    );
  }

  try {
    // Resolve the account name from the bank first — this is also how we
    // confirm the account number is real before creating anything.
    const resolveRes = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const resolveData = await resolveRes.json();
    if (!resolveRes.ok || !resolveData.status) {
      return NextResponse.json(
        { error: resolveData.message || "Could not verify that account number." },
        { status: 400 }
      );
    }
    const accountName = resolveData.data.account_name as string;

    const subaccountRes = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name: user.name || accountName,
        settlement_bank: bankCode,
        account_number: accountNumber,
        // Fallback split if a transaction is ever created without an
        // explicit transaction_charge override — real checkouts always pass
        // an exact flat amount instead, so this rarely applies in practice.
        percentage_charge: PLATFORM_FEE_PERCENT,
      }),
    });
    const subaccountData = await subaccountRes.json();
    if (!subaccountRes.ok || !subaccountData.status) {
      return NextResponse.json(
        { error: subaccountData.message || "Could not set up your payout account." },
        { status: 502 }
      );
    }
    const subaccountCode = subaccountData.data.subaccount_code as string;

    const now = new Date().toISOString();
    const mongo = await clientPromise;
    await mongo
      .db()
      .collection<PayoutAccount>("payoutAccounts")
      .updateOne(
        { userId: user.id },
        {
          $set: {
            userId: user.id,
            bankCode,
            bankName,
            accountNumber,
            accountName,
            subaccountCode,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );

    return NextResponse.json({ accountName, bankName });
  } catch {
    return NextResponse.json({ error: "Could not set up your payout account." }, { status: 500 });
  }
}
