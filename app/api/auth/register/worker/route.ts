import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
const registerWorkerSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required").max(50),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  skills: z.array(z.string()).min(1, "Skills are required").max(50),
  experience: z.string().min(1, "Experience is required").max(500),
  street: z.string().min(1, "Street address is required").max(200),
  unit: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  zip: z.string().min(3, "ZIP is required").max(20),
  serviceRadiusMiles: z.number().int().min(1, "Service radius must be at least 1 mile").max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerWorkerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const message = Object.values(errors).flat().join("; ") || "Validation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const {
      fullName,
      email,
      phone,
      password,
      skills,
      experience,
      street,
      unit,
      city,
      state,
      zip,
      serviceRadiusMiles,
    } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
      select: { email: true, phone: true },
    });
    if (existingUser) {
      const field = existingUser.email === email ? "email" : "phone";
      return NextResponse.json(
        { error: `A user with this ${field} already exists.` },
        { status: 409 }
      );
    }

    const existingWorker = await prisma.worker.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
      select: { email: true, phone: true },
    });
    if (existingWorker) {
      const field = existingWorker.email === email ? "email" : "phone";
      return NextResponse.json(
        { error: `A worker with this ${field} already exists.` },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 10);

    const experienceMatch = experience.match(/\d+/);
    const experienceYears = experienceMatch ? parseInt(experienceMatch[0], 10) : 0;
    const serviceRadiusKm = Math.max(1, Math.round(serviceRadiusMiles * 1.60934));

    const { worker } = await prisma.$transaction(async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
      const user = await tx.user.create({
        data: {
          name: fullName,
          email,
          phone,
          passwordHash,
          role: "WORKER",
        },
      });

      const addressRecord = await tx.address.create({
        data: {
          line1: street,
          line2: unit,
          area: city,
          city,
          state,
          country: "US",
          pincode: zip,
          latitude: 0,
          longitude: 0,
        },
      });

      const worker = await tx.worker.create({
        data: {
          userId: user.id,
          name: fullName,
          phone,
          email,
          skills,
          experienceYears,
          pricePerService: 0,
          serviceRadiusKm,
          addressId: addressRecord.id,
          status: "INACTIVE",
        },
      });

      return { user, worker };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Worker registration successful",
        workerId: worker.id,
      },
      { status: 201 }
    );
  } catch (error) {
    const prismaError = error as PrismaClientKnownRequestError & { code?: string; meta?: { target?: string[] } };
    if (prismaError?.code === "P2002") {
      const target = prismaError.meta?.target?.[0];
      const field = target === "email" ? "email" : target === "phone" ? "phone" : "field";
      return NextResponse.json(
        { error: `A user with this ${field} already exists.` },
        { status: 409 }
      );
    }
    console.error("Worker registration error:", error);
    return NextResponse.json(
      { error: "Worker registration failed. Please try again." },
      { status: 500 }
    );
  }
}
