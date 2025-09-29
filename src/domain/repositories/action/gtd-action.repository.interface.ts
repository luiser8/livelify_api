import { GtdAction } from '../../entities/action/gtd-action.entity';
import { GtdActionId } from '../../value-objects/action/gtd-action-id.value-object';
import { ProjectGoalId } from '../../value-objects/goal/project-goal-id.value-object';
import { ContextId } from '../../value-objects/context/context-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface GtdActionRepositoryInterface {
  save(action: GtdAction): Promise<GtdAction>;
  findById(id: GtdActionId): Promise<GtdAction | null>;
  findByGoalId(goalId: ProjectGoalId): Promise<GtdAction[]>;
  findByContextId(contextId: ContextId): Promise<GtdAction[]>;
  findByUserId(userId: UserId): Promise<GtdAction[]>;
  findPendingByUserId(userId: UserId): Promise<GtdAction[]>;
  findOverdueByUserId(userId: UserId): Promise<GtdAction[]>;
  findByUserIdAndContext(
    userId: UserId,
    contextId: ContextId,
  ): Promise<GtdAction[]>;
  update(action: GtdAction): Promise<GtdAction>;
  delete(id: GtdActionId): Promise<void>;
  countCompletedByGoalId(goalId: ProjectGoalId): Promise<number>;
  countTotalByGoalId(goalId: ProjectGoalId): Promise<number>;
}
