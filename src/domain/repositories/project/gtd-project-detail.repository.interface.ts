import { GtdProjectDetail } from '../../entities/project/gtd-project-detail.entity';
import { GtdProjectDetailId } from '../../value-objects/project/gtd-project-detail-id.value-object';
import { GtdProjectId } from '../../value-objects/project/gtd-project-id.value-object';
import { AreaId } from '../../value-objects/area/area-id.value-object';

export interface GtdProjectDetailRepositoryInterface {
  save(projectDetail: GtdProjectDetail): Promise<GtdProjectDetail>;
  findById(id: GtdProjectDetailId): Promise<GtdProjectDetail | null>;
  findByProjectId(projectId: GtdProjectId): Promise<GtdProjectDetail | null>;
  findByLifeAreaId(lifeAreaId: AreaId): Promise<GtdProjectDetail[]>;
  update(projectDetail: GtdProjectDetail): Promise<GtdProjectDetail>;
  delete(id: GtdProjectDetailId): Promise<void>;
}
