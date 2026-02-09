import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function GET() {
  try {
    const services = await prisma.serviceType.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error("Fetch services error:", error);
    return NextResponse.json({ error: "Failed to fetch services." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const isActive = body?.isActive === false ? false : true;
    const sortOrder = Number.isFinite(body?.sortOrder) ? Number(body.sortOrder) : 0;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const slug = typeof body?.slug === "string" && body.slug.trim()
      ? body.slug.trim()
      : slugify(name);

    const service = await prisma.serviceType.upsert({
      where: { slug },
      update: { name, isActive, sortOrder },
      create: { name, slug, isActive, sortOrder },
      select: { id: true, name: true, slug: true, isActive: true, sortOrder: true },
    });

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    console.error("Create service error:", error);
    return NextResponse.json({ error: "Failed to create service." }, { status: 500 });
  }
}
