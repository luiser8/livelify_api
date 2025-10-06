import { GoalBudget } from '../../entities/goal-budget/goal-budget.entity';
import { GoalBudgetId } from '../../value-objects/goal-budget/goal-budget-id.value-object';
import { ProjectGoalId } from '../../value-objects/goal/project-goal-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface GoalBudgetRepositoryInterface {
  save(goalBudget: GoalBudget): Promise<GoalBudget>;
  findById(id: GoalBudgetId): Promise<GoalBudget | null>;
  findByGoalId(goalId: ProjectGoalId): Promise<GoalBudget | null>;
  findByUserId(userId: UserId): Promise<GoalBudget[]>;
  findByProjectId(projectId: string): Promise<GoalBudget[]>;
  update(goalBudget: GoalBudget): Promise<GoalBudget>;
  delete(id: GoalBudgetId): Promise<void>;
}
