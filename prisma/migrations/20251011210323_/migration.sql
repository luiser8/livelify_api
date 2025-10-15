/*
  Warnings:

  - The values [BASICO,INTERMEDIO,AVANZADO] on the enum `PlanType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `price` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,active]` on the table `UserSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `basePrice` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bestFor` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingCycle` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerMonth` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyId` to the `UserSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `UserSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'MERCADO_PAGO', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "PlanType_new" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL');
ALTER TABLE "SubscriptionPlan" ALTER COLUMN "name" TYPE "PlanType_new" USING ("name"::text::"PlanType_new");
ALTER TYPE "PlanType" RENAME TO "PlanType_old";
ALTER TYPE "PlanType_new" RENAME TO "PlanType";
DROP TYPE "public"."PlanType_old";
COMMIT;

-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "price",
ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "bestFor" TEXT NOT NULL,
ADD COLUMN     "billingCycle" INTEGER NOT NULL,
ADD COLUMN     "discount" DOUBLE PRECISION,
ADD COLUMN     "pricePerMonth" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "savings" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "amountPaid" DOUBLE PRECISION,
ADD COLUMN     "autoRenew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "currencyId" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paymentMethod" "PaymentMethod" DEFAULT 'CREDIT_CARD',
ADD COLUMN     "paymentProvider" "PaymentProvider" DEFAULT 'OTHER',
ALTER COLUMN "renewalDate" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_active_key" ON "UserSubscription"("userId", "active");

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
