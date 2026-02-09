/**
 * One-off script to create a user for testing credentials login.
 * Run: npx tsx scripts/seed-user.ts
 * Requires: DATABASE_URL and env with email, password, role (optional).
 */
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAIL = process.env.SEED_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.SEED_PASSWORD ?? "admin123";
const ROLE = (process.env.SEED_ROLE ?? "ADMIN") as "USER" | "WORKER" | "ADMIN";
const PHONE = process.env.SEED_PHONE ?? "+91-9999999999";

async function main() {
  const passwordHash = await hash(PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { passwordHash, role: ROLE },
    create: {
      email: EMAIL,
      name: "Test User",
      phone: PHONE,
      passwordHash,
      role: ROLE,
    },
  });
  console.log("Created/updated user:", user.id, user.email, user.role);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
