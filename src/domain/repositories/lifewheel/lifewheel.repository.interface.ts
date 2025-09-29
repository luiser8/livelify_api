import { LifeWheel } from '../../entities/lifewheel/lifewheel.entity';
import { LifeWheelId } from '../../value-objects/lifewheel/lifewheel-id.value-object';
import { UserId } from '../../value-objects/user/user-id.value-object';

export interface LifeWheelRepositoryInterface {
  save(lifeWheel: LifeWheel): Promise<LifeWheel>;
  findById(id: LifeWheelId): Promise<LifeWheel | null>;
  findByUserId(userId: UserId): Promise<LifeWheel[]>;
  update(lifeWheel: LifeWheel): Promise<LifeWheel>;
  delete(id: LifeWheelId): Promise<void>;
}
