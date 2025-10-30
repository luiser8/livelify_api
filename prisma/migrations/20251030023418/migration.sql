-- AlterTable
ALTER TABLE "LifeWheel" ADD COLUMN     "isAnswered" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LifeWheelArea" ALTER COLUMN "isBlocked" SET DEFAULT true;
