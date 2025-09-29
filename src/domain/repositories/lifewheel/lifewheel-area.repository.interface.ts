import { LifeWheelArea } from '../../entities/lifewheel/lifewheel-area.entity';
import { LifeWheelAreaId } from '../../value-objects/lifewheel/lifewheel-area-id.value-object';
import { LifeWheelId } from '../../value-objects/lifewheel/lifewheel-id.value-object';

export interface LifeWheelAreaRepositoryInterface {
  save(lifeWheelArea: LifeWheelArea): Promise<LifeWheelArea>;
  findById(id: LifeWheelAreaId): Promise<LifeWheelArea | null>;
  findByLifeWheelId(lifeWheelId: LifeWheelId): Promise<LifeWheelArea[]>;
  update(lifeWheelArea: LifeWheelArea): Promise<LifeWheelArea>;
  delete(id: LifeWheelAreaId): Promise<void>;
}
