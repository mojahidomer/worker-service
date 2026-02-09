import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const registerWorkerStep1Schema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required").max(50),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  skills: z.array(z.string()).min(1, "Skills are required").max(50),
  experienceYears: z.number().int().min(0, "Experience must be 0 or more").max(100, "Max 100 years"),
  workDescription: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerWorkerStep1Schema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const message = Object.values(errors).flat().join("; ") || "Validation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { fullName, email, phone, password, skills, experienceYears } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
      select: { email: true, phone: true },
    });
    if (existingUser) {
      const field = existingUser.email === email ? "email" : "phone";
      return NextResponse.json({ error: `A user with this ${field} already exists.` }, { status: 409 });
    }

    const existingWorker = await prisma.worker.findFirst({
      where: { OR: [{ email }, { phone }] },
      select: { email: true, phone: true },
    });
    if (existingWorker) {
      const field = existingWorker.email === email ? "email" : "phone";
      return NextResponse.json({ error: `A worker with this ${field} already exists.` }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);

    const { user, worker } = await prisma.$transaction(async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
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
          line1: "—",
          line2: null,
          area: "—",
          city: "—",
          state: "—",
          country: "US",
          pincode: "—",
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
          serviceRadiusKm: 5,
          addressId: addressRecord.id,
          status: "INACTIVE",
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { addressId: addressRecord.id },
      });

      return { user, worker };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Step 1 completed",
        userId: user.id,
        workerId: worker.id,
      },
      { status: 201 }
    );
  } catch (error) {
    const prismaError = error as PrismaClientKnownRequestError & { code?: string; meta?: { target?: string[] } };
    if (prismaError?.code === "P2002") {
      const target = prismaError.meta?.target?.[0];
      const field = target === "email" ? "email" : target === "phone" ? "phone" : "field";
      return NextResponse.json({ error: `A user with this ${field} already exists.` }, { status: 409 });
    }
    console.error("Worker registration step-1 error:", error);
    return NextResponse.json({ error: "Worker registration failed. Please try again." }, { status: 500 });
  }
}
