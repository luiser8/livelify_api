-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'HOTMART';

-- CreateTable
CREATE TABLE "UserAreasSelected" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lifeWheelId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAreasSelected_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAreasSelected" ADD CONSTRAINT "UserAreasSelected_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAreasSelected" ADD CONSTRAINT "UserAreasSelected_lifeWheelId_fkey" FOREIGN KEY ("lifeWheelId") REFERENCES "LifeWheel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAreasSelected" ADD CONSTRAINT "UserAreasSelected_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
