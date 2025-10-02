/*
  Warnings:

  - Added the required column `description` to the `Area` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProjectGoal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProjectGoal" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
