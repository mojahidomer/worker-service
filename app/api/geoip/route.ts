import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const url = ip ? `https://ipapi.co/${ip}/json/` : "https://ipapi.co/json/";
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      return NextResponse.json({ error: "Geo IP lookup failed." }, { status: 502 });
    }

    const data = await res.json();
    const latitude = typeof data.latitude === "number" ? data.latitude : Number(data.latitude);
    const longitude = typeof data.longitude === "number" ? data.longitude : Number(data.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "Geo IP location unavailable." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      latitude,
      longitude,
      city: data.city ?? "",
      region: data.region ?? "",
      country: data.country_name ?? data.country ?? "",
    });
  } catch (error) {
    console.error("Geo IP error:", error);
    return NextResponse.json({ error: "Geo IP lookup failed." }, { status: 500 });
  }
}
