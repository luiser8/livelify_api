import { ActionBudget } from '../../entities/action-budget/action-budget.entity';
import { ActionBudgetId } from '../../value-objects/action-budget/action-budget-id.value-object';
import { GtdActionId } from '../../value-objects/action/gtd-action-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface ActionBudgetRepositoryInterface {
  save(actionBudget: ActionBudget): Promise<ActionBudget>;
  findById(id: ActionBudgetId): Promise<ActionBudget | null>;
  findByActionId(actionId: GtdActionId): Promise<ActionBudget | null>;
  findByUserId(userId: UserId): Promise<ActionBudget[]>;
  findByProjectId(projectId: string): Promise<ActionBudget[]>;
  update(actionBudget: ActionBudget): Promise<ActionBudget>;
  delete(id: ActionBudgetId): Promise<void>;
}
