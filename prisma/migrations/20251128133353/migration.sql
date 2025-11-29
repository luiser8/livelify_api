-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "TypeCreation" AS ENUM ('APPLICATION', 'EXTERNAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "typeCreation" "TypeCreation" DEFAULT 'APPLICATION';

-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "type" "SubscriptionType" DEFAULT 'FREE';
