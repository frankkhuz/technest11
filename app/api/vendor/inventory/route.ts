import { NextResponse } from "next/server";

// ✅ GET INVENTORY
export async function GET() {
  try {
    // temporary mock (we'll connect Mongo next)
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching inventory" },
      { status: 500 }
    );
  }
}

// ✅ ADD ITEM TO INVENTORY
export async function POST(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json({
      success: true,
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error creating item" },
      { status: 500 }
    );
  }
}
