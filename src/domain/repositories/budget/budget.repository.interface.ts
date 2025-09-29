import { Budget } from '../../entities/budget/budget.entity';
import { BudgetId } from '../../value-objects/budget/budget-id.value-object';
import { GtdProjectId } from '../../value-objects/project/gtd-project-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface BudgetRepositoryInterface {
  save(budget: Budget): Promise<Budget>;
  findById(id: BudgetId): Promise<Budget | null>;
  findByProjectId(projectId: GtdProjectId): Promise<Budget | null>;
  findByUserId(userId: UserId): Promise<Budget[]>;
  update(budget: Budget): Promise<Budget>;
  delete(id: BudgetId): Promise<void>;
}
