import { GtdProject } from '../../entities/project/gtd-project.entity';
import { GtdProjectId } from '../../value-objects/project/gtd-project-id.value-object';
import { LifeWheelAreaId } from '../../value-objects/lifewheel/lifewheel-area-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface GtdProjectRepositoryInterface {
  save(project: GtdProject): Promise<GtdProject>;
  findById(id: GtdProjectId): Promise<GtdProject | null>;
  findByLifeWheelAreaId(
    lifeWheelAreaId: LifeWheelAreaId,
  ): Promise<GtdProject[]>;
  findByUserId(userId: UserId): Promise<GtdProject[]>;
  update(project: GtdProject): Promise<GtdProject>;
  delete(id: GtdProjectId): Promise<void>;
}
