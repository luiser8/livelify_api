/*
  Warnings:

  - You are about to drop the column `lifeArea` on the `GtdProjectDetail` table. All the data in the column will be lost.
  - You are about to drop the column `area` on the `LifeWheelArea` table. All the data in the column will be lost.
  - You are about to drop the column `answer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `lifeWheelAreaId` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lifeWheelId,areaId]` on the table `LifeWheelArea` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lifeAreaId` to the `GtdProjectDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `areaId` to the `LifeWheelArea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `areaId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_lifeWheelAreaId_fkey";

-- DropIndex
DROP INDEX "public"."LifeWheelArea_lifeWheelId_area_key";

-- AlterTable
ALTER TABLE "public"."GtdProjectDetail" DROP COLUMN "lifeArea",
ADD COLUMN     "lifeAreaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."LifeWheelArea" DROP COLUMN "area",
ADD COLUMN     "areaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Question" DROP COLUMN "answer",
DROP COLUMN "lifeWheelAreaId",
ADD COLUMN     "areaId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."LifeArea";

-- CreateTable
CREATE TABLE "public"."Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Answer" (
    "id" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "lifeWheelAreaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "public"."Area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_userId_questionId_lifeWheelAreaId_key" ON "public"."Answer"("userId", "questionId", "lifeWheelAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "LifeWheelArea_lifeWheelId_areaId_key" ON "public"."LifeWheelArea"("lifeWheelId", "areaId");

-- AddForeignKey
ALTER TABLE "public"."LifeWheelArea" ADD CONSTRAINT "LifeWheelArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Answer" ADD CONSTRAINT "Answer_lifeWheelAreaId_fkey" FOREIGN KEY ("lifeWheelAreaId") REFERENCES "public"."LifeWheelArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GtdProjectDetail" ADD CONSTRAINT "GtdProjectDetail_lifeAreaId_fkey" FOREIGN KEY ("lifeAreaId") REFERENCES "public"."Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
