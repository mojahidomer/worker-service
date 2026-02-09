import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/server/geocode";
import type { PrismaClient } from "@prisma/client";

const registerWorkerStep2Schema = z.object({
  userId: z.string().min(1, "User id is required"),
  street: z.string().min(1, "Street address is required").max(200),
  unit: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  zip: z.string().min(3, "ZIP is required").max(20),
  serviceRadiusMiles: z.number().int().min(1).max(100),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerWorkerStep2Schema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const message = Object.values(errors).flat().join("; ") || "Validation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { userId, street, unit, city, state, zip, serviceRadiusMiles, latitude, longitude } = parsed.data;

    const worker = await prisma.worker.findUnique({
      where: { userId },
      select: { id: true, addressId: true },
    });
    if (!worker) {
      return NextResponse.json({ error: "Worker not found for this user." }, { status: 404 });
    }

    const serviceRadiusKm = Math.max(1, Math.round(serviceRadiusMiles * 1.60934));
    let resolvedLatitude = latitude ?? null;
    let resolvedLongitude = longitude ?? null;

    if (resolvedLatitude == null || resolvedLongitude == null) {
      const addressText = [street, unit, city, state, zip, "USA"].filter(Boolean).join(", ");
      const coords = await geocodeAddress(addressText);
      resolvedLatitude = coords.latitude;
      resolvedLongitude = coords.longitude;
    }

    await prisma.$transaction(async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
      await tx.address.update({
        where: { id: worker.addressId },
        data: {
          line1: street,
          line2: unit,
          area: city,
          city,
          state,
          country: "US",
          pincode: zip,
          latitude: resolvedLatitude ?? 0,
          longitude: resolvedLongitude ?? 0,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { addressId: worker.addressId },
      });

      await tx.worker.update({
        where: { id: worker.id },
        data: {
          serviceRadiusKm,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Step 2 completed",
        workerId: worker.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Worker registration step-2 error:", error);
    return NextResponse.json({ error: "Worker registration failed. Please try again." }, { status: 500 });
  }
}
