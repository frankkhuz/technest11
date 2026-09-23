import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongo";
import { getCurrentUser } from "@/app/lib/currentUser";
import { computeListingCheckout } from "@/app/lib/paystackFees";
import type { PayoutAccount } from "@/app/lib/payout";

type BackendListing = {
  _id: string;
  deviceName: string;
  storage?: string;
  estimatedMax: number;
  owner?: { _id: string; name: string };
};

export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "Missing listingId." }, { status: 400 });

  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Sign in to buy from the marketplace." }, { status: 401 });

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl || !/^https?:\/\//.test(backendUrl)) {
    return NextResponse.json({ error: "Marketplace is not configured yet." }, { status: 503 });
  }

  try {
    const listingRes = await fetch(`${backendUrl}/api/listings/${listingId}`, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!listingRes.ok) {
      return NextResponse.json({ error: "That listing could not be found." }, { status: 404 });
    }
    const listingBody = await listingRes.json();
    const listing = (listingBody?.data?.listing ?? listingBody?.data ?? listingBody?.listing) as
      | BackendListing
      | undefined;
    if (!listing || !listing.owner?._id) {
      return NextResponse.json({ error: "That listing could not be found." }, { status: 404 });
    }
    if (listing.owner._id === user.id) {
      return NextResponse.json({ error: "You can't buy your own listing." }, { status: 400 });
    }

    const mongo = await clientPromise;
    const payoutAccount = await mongo
      .db()
      .collection<PayoutAccount>("payoutAccounts")
      .findOne({ userId: listing.owner._id });
    if (!payoutAccount) {
      return NextResponse.json(
        { error: "This seller hasn't set up payouts yet — try reaching them on WhatsApp instead." },
        { status: 409 }
      );
    }

    const { sellerPrice, platformFee, totalCharge } = computeListingCheckout(listing.estimatedMax);
    return NextResponse.json({
      preview: {
        listingId,
        deviceName: listing.deviceName,
        sellerPrice,
        platformFee,
        totalCharge,
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not load this listing." }, { status: 500 });
  }
}
