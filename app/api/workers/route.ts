import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { geocodeAddress } from "@/lib/server/geocode";

const DEFAULT_LIMIT = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const skillRaw = searchParams.get("skill")?.trim() ?? "";
    const skillList = skillRaw
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item !== "All Services");
    const maxRate = Number(searchParams.get("maxRate")) || undefined;
    const sort = searchParams.get("sort") ?? "rating_desc";
    const limit = Math.min(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 50);
    const random = searchParams.get("random") === "1";
    const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined;
    const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined;
    const maxDistance = Math.min(Number(searchParams.get("distance")) || 25, 200);
    const locationText = searchParams.get("location")?.trim() ?? "";

    let resolvedLat = lat;
    let resolvedLng = lng;

    if ((resolvedLat == null || resolvedLng == null) && locationText) {
      try {
        const coords = await geocodeAddress(locationText);
        resolvedLat = coords.latitude;
        resolvedLng = coords.longitude;
      } catch {
        resolvedLat = undefined;
        resolvedLng = undefined;
      }
    }

    if (
      typeof resolvedLat === "number" &&
      typeof resolvedLng === "number" &&
      !Number.isNaN(resolvedLat) &&
      !Number.isNaN(resolvedLng)
    ) {
      const filters: Prisma.Sql[] = [
        Prisma.sql`w."status" = 'ACTIVE'`,
        Prisma.sql`w."profileVisible" = true`,
      ];

      if (skillList.length) {
        filters.push(
          Prisma.sql`EXISTS (
            SELECT 1 FROM unnest(w."skills") s
            WHERE ${Prisma.join(
              skillList.map((skill) => Prisma.sql`s = ${skill}`),
              Prisma.sql` OR `
            )}
          )`
        );
      }

      if (q) {
        const like = `%${q}%`;
        filters.push(
          Prisma.sql`(w."name" ILIKE ${like} OR EXISTS (SELECT 1 FROM unnest(w."skills") s WHERE s ILIKE ${like}))`
        );
      }

      if (maxRate) {
        filters.push(Prisma.sql`w."pricePerService" <= ${maxRate}`);
      }

      const distanceMiles = Prisma.sql`(3959 * acos( cos(radians(${resolvedLat})) * cos(radians(a."latitude")) * cos(radians(a."longitude") - radians(${resolvedLng})) + sin(radians(${resolvedLat})) * sin(radians(a."latitude")) ))`;

      const orderBy =
        sort === "price_asc"
          ? Prisma.sql`w."pricePerService" ASC`
          : sort === "price_desc"
            ? Prisma.sql`w."pricePerService" DESC`
            : sort === "experience_desc"
              ? Prisma.sql`w."experienceYears" DESC`
              : Prisma.sql`w."rating" DESC`;

      let whereClause = filters[0];
      for (let i = 1; i < filters.length; i += 1) {
        whereClause = Prisma.sql`${whereClause} AND ${filters[i]}`;
      }

      const rows = await prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          email: string | null;
          phone: string;
          skills: string[];
          experienceYears: number;
          rating: number;
          totalReviews: number;
          pricePerService: number;
          city: string;
          state: string;
          distance: number;
        }>
      >`
        SELECT
          w."id",
          w."name",
          w."email",
          w."phone",
          w."skills",
          w."experienceYears",
          w."rating",
          w."totalReviews",
          w."pricePerService",
          a."city",
          a."state",
          ${distanceMiles} AS distance
        FROM "workers" w
        JOIN "Address" a ON a."id" = w."address_id"
        WHERE ${whereClause}
          AND ${distanceMiles} <= ${maxDistance}
        ORDER BY ${orderBy}
        LIMIT ${limit}
      `;

      return NextResponse.json({
        success: true,
        count: rows.length,
        data: rows.map((row) => ({
          ...row,
          distance: Number(row.distance),
        })),
      });
    }

    if (random) {
      const rows = await prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          email: string | null;
          phone: string;
          skills: string[];
          experienceYears: number;
          rating: number;
          totalReviews: number;
          pricePerService: number;
          city: string;
          state: string;
        }>
      >`
        SELECT
          w."id",
          w."name",
          w."email",
          w."phone",
          w."skills",
          w."experienceYears",
          w."rating",
          w."totalReviews",
          w."pricePerService",
          a."city",
          a."state"
        FROM "workers" w
        JOIN "Address" a ON a."id" = w."address_id"
        WHERE w."status" = 'ACTIVE'
          AND w."profileVisible" = true
        ORDER BY RANDOM()
        LIMIT ${limit}
      `;

      return NextResponse.json({
        success: true,
        count: rows.length,
        data: rows,
      });
    }

    const where = {
      status: "ACTIVE" as const,
      profileVisible: true,
      ...(skillList.length ? { skills: { hasSome: skillList } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { skills: { hasSome: [q] } },
            ],
          }
        : {}),
      ...(maxRate ? { pricePerService: { lte: maxRate } } : {}),
    };

    const orderBy =
      sort === "price_asc"
        ? { pricePerService: "asc" as const }
        : sort === "price_desc"
          ? { pricePerService: "desc" as const }
          : sort === "experience_desc"
            ? { experienceYears: "desc" as const }
            : { rating: "desc" as const };

    const workers = await prisma.worker.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        address: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    console.error("Fetch workers error:", error);
    return NextResponse.json({ error: "Failed to fetch workers." }, { status: 500 });
  }
}
