import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerWorkerStep3Schema = z.object({
  userId: z.string().min(1, "User id is required"),
  idFront: z.boolean().optional(),
  idBack: z.boolean().optional(),
  license: z.boolean().optional(),
  consent: z.boolean().refine((val) => val, "Consent is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerWorkerStep3Schema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const message = Object.values(errors).flat().join("; ") || "Validation failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { userId } = parsed.data;

    const worker = await prisma.worker.findUnique({ where: { userId }, select: { id: true } });
    if (!worker) {
      return NextResponse.json({ error: "Worker not found for this user." }, { status: 404 });
    }

    // Keep status INACTIVE until payment is completed.
    await prisma.worker.update({
      where: { id: worker.id },
      data: {
        status: "INACTIVE",
        profileVisible: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Step 3 completed. Verification submitted for review.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Worker registration step-3 error:", error);
    return NextResponse.json({ error: "Worker registration failed. Please try again." }, { status: 500 });
  }
}
