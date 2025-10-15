/*
  Warnings:

  - A unique constraint covering the columns `[currencyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currencyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_currencyId_key" ON "User"("currencyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
