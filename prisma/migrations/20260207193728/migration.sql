/*
  Warnings:

  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_plans` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `serviceRadiusKm` on table `workers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `workers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalReviews` on table `workers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profileVisible` on table `workers` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_service_address_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_addressId_fkey";

-- DropForeignKey
ALTER TABLE "worker_subscriptions" DROP CONSTRAINT "worker_subscriptions_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "workers" DROP CONSTRAINT "workers_address_id_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "workers" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "serviceRadiusKm" SET NOT NULL,
ALTER COLUMN "serviceRadiusKm" SET DEFAULT 5,
ALTER COLUMN "rating" SET NOT NULL,
ALTER COLUMN "totalReviews" SET NOT NULL,
ALTER COLUMN "profileVisible" SET NOT NULL,
ALTER COLUMN "skills" DROP DEFAULT;

-- DropTable
DROP TABLE "addresses";

-- DropTable
DROP TABLE "subscription_plans";

-- CreateTable
CREATE TABLE "Address" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationInDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_subscriptions" ADD CONSTRAINT "worker_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_address_id_fkey" FOREIGN KEY ("service_address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
