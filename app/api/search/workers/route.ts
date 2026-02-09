import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sqltag as sql, raw } from "@prisma/client/runtime/library";

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

    const point = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
    const workerPoint = sql`${raw('ST_SetSRID(ST_MakePoint(a."longitude", a."latitude"), 4326)::geography')}`;

    const distanceMeters = sql`ST_Distance(${workerPoint}, ${point})`;

    const withinRadius = radiusKm
      ? sql`ST_DWithin(${workerPoint}, ${point}, ${radiusKm * 1000})`
      : sql`TRUE`;

    const withinWorkerRadius = sql`ST_DWithin(${workerPoint}, ${point}, ${raw('(w."serviceRadiusKm" * 1000)')})`;

    const skillConditions = services.map((svc) => sql`s ILIKE ${`%${svc}%`}`);
    const skillPredicate =
      skillConditions.length === 1
        ? skillConditions[0]
        : skillConditions.reduce((acc, cond) => sql`${acc} OR ${cond}`);

    const serviceFilter = sql`EXISTS (
      SELECT 1 FROM unnest(w."skills") s
      WHERE ${skillPredicate}
    )`;

    type WorkerRow = {
      id: string;
      name: string;
      skills: string[];
      rating: number;
      serviceRadiusKm: number;
      city: string;
      area: string;
      distanceMeters: number;
    };

    const rows = await prisma.$queryRaw<WorkerRow[]>`
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
      data: rows.map((row: WorkerRow) => ({
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
