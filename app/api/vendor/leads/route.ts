import { NextResponse } from "next/server";

// ✅ GET ALL LEADS (users selling or requesting swap)
export async function GET() {
  try {
    // 🔥 TEMP DATA (we connect Mongo next)
    const leads = [
      {
        id: "1",
        name: "John",
        device: "iPhone 13 Pro Max 128GB",
        action: "swap",
        target: "iPhone 15 Pro Max 1TB",
        price: 650000,
      },
    ];

    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// ✅ CREATE NEW LEAD (user posts device)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json({
      success: true,
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create lead" },
      { status: 500 }
    );
  }
}
