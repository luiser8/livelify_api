-- CreateTable
CREATE TABLE "GoalBudget" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "baseCapital" DOUBLE PRECISION NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.3,
    "totalCapital" DOUBLE PRECISION NOT NULL,
    "monthlyBudget" DOUBLE PRECISION NOT NULL,
    "dailyBudget" DOUBLE PRECISION NOT NULL,
    "projectMonths" INTEGER NOT NULL,
    "projectDays" INTEGER NOT NULL,
    "currencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalBudget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoalBudget_goalId_key" ON "GoalBudget"("goalId");

-- AddForeignKey
ALTER TABLE "GoalBudget" ADD CONSTRAINT "GoalBudget_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "ProjectGoal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalBudget" ADD CONSTRAINT "GoalBudget_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
