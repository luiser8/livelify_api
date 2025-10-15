/*
  Warnings:

  - You are about to drop the column `acceptTermsAndConditions` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "acceptTermsAndConditions",
ADD COLUMN     "acceptTermsAndPolicies" BOOLEAN NOT NULL DEFAULT false;
