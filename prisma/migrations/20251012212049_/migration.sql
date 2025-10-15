-- AlterTable
ALTER TABLE "UserRecovery" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "securityCode" TEXT;
