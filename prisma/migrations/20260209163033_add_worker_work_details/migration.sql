-- CreateEnum
CREATE TYPE "PayType" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "workers" ADD COLUMN     "pay_type" "PayType" NOT NULL DEFAULT 'HOURLY',
ADD COLUMN     "work_description" TEXT;
