-- AlterTable: Rename GoalBudget table to ActionBudget
ALTER TABLE "GoalBudget" RENAME TO "ActionBudget";

-- AlterTable: Rename goalId column to actionId in ActionBudget
ALTER TABLE "ActionBudget" RENAME COLUMN "goalId" TO "actionId";

-- DropIndex: Drop the old unique index on goalId
ALTER TABLE "ActionBudget" DROP CONSTRAINT IF EXISTS "GoalBudget_goalId_key";

-- CreateIndex: Create new unique index on actionId
CREATE UNIQUE INDEX "ActionBudget_actionId_key" ON "ActionBudget"("actionId");

-- DropForeignKey: Drop the old foreign key constraint
ALTER TABLE "ActionBudget" DROP CONSTRAINT IF EXISTS "GoalBudget_goalId_fkey";

-- AddForeignKey: Add new foreign key constraint to GtdAction
ALTER TABLE "ActionBudget" ADD CONSTRAINT "ActionBudget_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "GtdAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey: Drop the old currency foreign key constraint
ALTER TABLE "ActionBudget" DROP CONSTRAINT IF EXISTS "GoalBudget_currencyId_fkey";

-- AddForeignKey: Add new currency foreign key constraint
ALTER TABLE "ActionBudget" ADD CONSTRAINT "ActionBudget_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

