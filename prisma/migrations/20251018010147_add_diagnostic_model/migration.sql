-- CreateTable
CREATE TABLE "Diagnostic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "personal" INTEGER NOT NULL,
    "professional" INTEGER NOT NULL,
    "health" INTEGER NOT NULL,
    "finances" INTEGER NOT NULL,
    "family" INTEGER NOT NULL,
    "love" INTEGER NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diagnostic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Diagnostic_email_idx" ON "Diagnostic"("email");

-- CreateIndex
CREATE INDEX "Diagnostic_createdAt_idx" ON "Diagnostic"("createdAt");
