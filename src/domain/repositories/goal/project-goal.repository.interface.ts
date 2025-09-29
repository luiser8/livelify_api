import { ProjectGoal } from '../../entities/goal/project-goal.entity';
import { ProjectGoalId } from '../../value-objects/goal/project-goal-id.value-object';
import { GtdProjectDetailId } from '../../value-objects/project/gtd-project-detail-id.value-object';
import { GtdProjectId } from '../../value-objects/project/gtd-project-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface ProjectGoalRepositoryInterface {
  save(goal: ProjectGoal): Promise<ProjectGoal>;
  findById(id: ProjectGoalId): Promise<ProjectGoal | null>;
  findByDetailId(detailId: GtdProjectDetailId): Promise<ProjectGoal[]>;
  findByProjectId(projectId: GtdProjectId): Promise<ProjectGoal[]>;
  findByUserId(userId: UserId): Promise<ProjectGoal[]>;
  update(goal: ProjectGoal): Promise<ProjectGoal>;
  delete(id: ProjectGoalId): Promise<void>;
}
