/*
  Warnings:

  - You are about to drop the column `cost` on the `ProjectGoal` table. All the data in the column will be lost.
  - You are about to drop the column `saved` on the `ProjectGoal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectGoal" DROP COLUMN "cost",
DROP COLUMN "saved";
