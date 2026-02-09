import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceRaw = searchParams.get("service")?.trim() || "";
    const latRaw = searchParams.get("lat");
    const lngRaw = searchParams.get("lng");
    const radiusRaw = searchParams.get("radius");

    const services = serviceRaw
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item !== "All Services");

    if (!services.length) {
      return NextResponse.json({ error: "service is required" }, { status: 400 });
    }

    if (latRaw == null || lngRaw == null) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "lat and lng must be numbers" }, { status: 400 });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "lat or lng out of range" }, { status: 400 });
    }

    const radiusKm = radiusRaw ? Number(radiusRaw) : 25;
    if (radiusRaw && (!Number.isFinite(radiusKm) || radiusKm <= 0)) {
      return NextResponse.json({ error: "radius must be a positive number" }, { status: 400 });
    }

    const point = Prisma.sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
    const workerPoint = Prisma.sql`ST_SetSRID(ST_MakePoint(a."longitude", a."latitude"), 4326)::geography`;

    const distanceMeters = Prisma.sql`ST_Distance(${workerPoint}, ${point})`;

    const withinRadius = radiusKm
      ? Prisma.sql`ST_DWithin(${workerPoint}, ${point}, ${radiusKm * 1000})`
      : Prisma.sql`TRUE`;

    const withinWorkerRadius = Prisma.sql`ST_DWithin(${workerPoint}, ${point}, (w."serviceRadiusKm" * 1000))`;

    let skillPredicate = Prisma.sql``;
    services.forEach((svc, index) => {
      if (index === 0) {
        skillPredicate = Prisma.sql`s ILIKE ${`%${svc}%`}`;
      } else {
        skillPredicate = Prisma.sql`${skillPredicate} OR s ILIKE ${`%${svc}%`}`;
      }
    });

    const serviceFilter = Prisma.sql`EXISTS (
      SELECT 1 FROM unnest(w."skills") s
      WHERE ${skillPredicate}
    )`;

    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        skills: string[];
        rating: number;
        serviceRadiusKm: number;
        city: string;
        area: string;
        distanceMeters: number;
      }>
    >`
      SELECT
        w."id",
        w."name",
        w."skills",
        w."rating",
        w."serviceRadiusKm",
        a."city",
        a."area",
        ${distanceMeters} AS "distanceMeters"
      FROM "workers" w
      JOIN "Address" a ON a."id" = w."address_id"
      WHERE w."status" = 'ACTIVE'
        AND w."profileVisible" = true
        AND a."latitude" IS NOT NULL
        AND a."longitude" IS NOT NULL
        AND ${serviceFilter}
        AND ${withinRadius}
        AND ${withinWorkerRadius}
      ORDER BY ${distanceMeters} ASC
      LIMIT 50
    `;

    return NextResponse.json({
      success: true,
      count: rows.length,
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        skills: row.skills,
        rating: row.rating,
        serviceRadiusKm: row.serviceRadiusKm,
        city: row.city,
        area: row.area,
        distanceKm: Number(row.distanceMeters) / 1000,
      })),
    });
  } catch (error) {
    console.error("Search workers error:", error);
    return NextResponse.json({ error: "Failed to search workers." }, { status: 500 });
  }
}
