import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/server/geocode";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address")?.trim();
    if (!address) {
      return NextResponse.json({ error: "Address is required." }, { status: 400 });
    }

    const coords = await geocodeAddress(address);
    return NextResponse.json({ success: true, ...coords });
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json({ error: "Unable to geocode address." }, { status: 500 });
  }
}
