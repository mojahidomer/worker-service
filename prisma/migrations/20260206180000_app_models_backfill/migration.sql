-- Add new enums
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');
CREATE TYPE "PayerType" AS ENUM ('USER', 'WORKER');
ALTER TYPE "WorkerStatus" ADD VALUE 'EXPIRED';

-- Users: add createdAt, updatedAt (with defaults so existing rows get a value)
ALTER TABLE "users" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
-- Backfill null name/phone (phone must stay unique: use 'user-' || id for nulls)
UPDATE "users" SET "name" = COALESCE("name", 'Unknown'), "phone" = COALESCE("phone", 'user-' || "id") WHERE "name" IS NULL OR "phone" IS NULL;
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;

-- Create Address table
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- Create one Address per existing worker (from old address/lat/long)
INSERT INTO "addresses" ("id", "line1", "area", "city", "state", "country", "pincode", "latitude", "longitude")
SELECT 
    gen_random_uuid()::text,
    COALESCE(w."address", ''),
    COALESCE(w."address", ''),
    '',
    '',
    '',
    '',
    w."latitude",
    w."longitude"
FROM "workers" w;

-- Workers: add new columns as nullable first
ALTER TABLE "workers" ADD COLUMN "name" TEXT;
ALTER TABLE "workers" ADD COLUMN "phone" TEXT;
ALTER TABLE "workers" ADD COLUMN "email" TEXT;
ALTER TABLE "workers" ADD COLUMN "experienceYears" INTEGER;
ALTER TABLE "workers" ADD COLUMN "pricePerService" DOUBLE PRECISION;
ALTER TABLE "workers" ADD COLUMN "serviceRadiusKm" INTEGER;
ALTER TABLE "workers" ADD COLUMN "rating" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "workers" ADD COLUMN "totalReviews" INTEGER DEFAULT 0;
ALTER TABLE "workers" ADD COLUMN "profileVisible" BOOLEAN DEFAULT false;
ALTER TABLE "workers" ADD COLUMN "address_id" TEXT;
ALTER TABLE "workers" ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Backfill workers from users (name, phone, email, experienceYears, pricePerService, serviceRadiusKm, updatedAt)
UPDATE "workers" w SET
    "name" = u."name",
    "phone" = u."phone",
    "email" = u."email",
    "experienceYears" = 1,
    "pricePerService" = 0,
    "serviceRadiusKm" = w."service_radius",
    "updatedAt" = CURRENT_TIMESTAMP
FROM "users" u
WHERE w."user_id" = u.id;

-- Assign each worker the corresponding address (addresses inserted in same order as workers)
WITH ord AS (
    SELECT w.id AS worker_id, ROW_NUMBER() OVER (ORDER BY w.id) AS rn
    FROM workers w
),
addr_ord AS (
    SELECT id AS address_id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn
    FROM addresses
)
UPDATE workers w SET address_id = a.address_id
FROM ord o
JOIN addr_ord a ON a.rn = o.rn
WHERE w.id = o.worker_id;

-- Set any remaining nulls from users (in case first update missed)
UPDATE "workers" w SET
    "name" = COALESCE(w."name", u."name"),
    "phone" = COALESCE(w."phone", u."phone"),
    "email" = u."email",
    "experienceYears" = COALESCE(w."experienceYears", 1),
    "pricePerService" = COALESCE(w."pricePerService", 0),
    "serviceRadiusKm" = COALESCE(w."serviceRadiusKm", 5),
    "updatedAt" = CURRENT_TIMESTAMP
FROM "users" u
WHERE w."user_id" = u.id AND (w."name" IS NULL OR w."phone" IS NULL OR w."experienceYears" IS NULL OR w."pricePerService" IS NULL OR w."serviceRadiusKm" IS NULL OR w."updatedAt" IS NULL);

-- Convert skills TEXT to TEXT[] (Prisma String[]) - add new column, copy, drop old, rename
ALTER TABLE "workers" ADD COLUMN "skills_new" TEXT[] DEFAULT '{}';
UPDATE "workers" SET "skills_new" = CASE WHEN "skills" IS NULL OR "skills" = '' THEN '{}' ELSE ARRAY["skills"] END;
ALTER TABLE "workers" DROP COLUMN "skills";
ALTER TABLE "workers" RENAME COLUMN "skills_new" TO "skills";

-- Drop old worker columns
ALTER TABLE "workers" DROP COLUMN "experience";
ALTER TABLE "workers" DROP COLUMN "address";
ALTER TABLE "workers" DROP COLUMN "latitude";
ALTER TABLE "workers" DROP COLUMN "longitude";
ALTER TABLE "workers" DROP COLUMN "service_radius";

-- Make required columns NOT NULL
ALTER TABLE "workers" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "workers" ALTER COLUMN "phone" SET NOT NULL;
ALTER TABLE "workers" ALTER COLUMN "experienceYears" SET NOT NULL;
ALTER TABLE "workers" ALTER COLUMN "pricePerService" SET NOT NULL;
ALTER TABLE "workers" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "workers" ALTER COLUMN "address_id" SET NOT NULL;

-- Add unique constraints on workers (phone; email unique where not null via partial index)
CREATE UNIQUE INDEX "workers_phone_key" ON "workers"("phone");
CREATE UNIQUE INDEX "workers_email_key" ON "workers"("email");

-- Add FK workers -> addresses
ALTER TABLE "workers" ADD CONSTRAINT "workers_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- User addressId (optional)
ALTER TABLE "users" ADD COLUMN "addressId" TEXT;
ALTER TABLE "users" ADD COLUMN "isPaidUser" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD CONSTRAINT "users_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SubscriptionPlan
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationInDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- WorkerSubscription
CREATE TABLE "worker_subscriptions" (
    "id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_subscriptions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "worker_subscriptions" ADD CONSTRAINT "worker_subscriptions_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "worker_subscriptions" ADD CONSTRAINT "worker_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Payment
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "payer_type" "PayerType" NOT NULL,
    "payer_id" TEXT NOT NULL,
    "worker_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "method" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "reference_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "payments" ADD CONSTRAINT "payments_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ServiceCategory
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- Booking
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "service_category_id" TEXT NOT NULL,
    "service_address_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_category_id_fkey" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_address_id_fkey" FOREIGN KEY ("service_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Address updatedAt (we created with default, but ensure it exists)
-- Already have updatedAt in addresses

-- Add addresses.updatedAt if not present (we had it in CREATE TABLE)
-- Done

-- Rename workers table for Prisma @@map if needed: schema says @@map("workers") so table name stays "workers"
