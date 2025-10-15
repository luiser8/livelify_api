/*
  Warnings:

  - You are about to drop the column `recoveryEmail` on the `UserRecovery` table. All the data in the column will be lost.
  - You are about to drop the column `securityAnswer` on the `UserRecovery` table. All the data in the column will be lost.
  - You are about to drop the column `securityQuestion` on the `UserRecovery` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RecoveryType" AS ENUM ('REGISTER', 'RECOVER_PASSWORD', 'RECOVER_EMAIL');

-- DropIndex
DROP INDEX "public"."UserRecovery_userId_key";

-- AlterTable
ALTER TABLE "UserRecovery" DROP COLUMN "recoveryEmail",
DROP COLUMN "securityAnswer",
DROP COLUMN "securityQuestion",
ADD COLUMN     "type" "RecoveryType" DEFAULT 'REGISTER';
