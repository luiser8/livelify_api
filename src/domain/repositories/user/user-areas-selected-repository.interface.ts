import { UserAreasSelected } from '../../../domain/entities/user/user-selected-areas.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { LifeWheelId } from '../../../domain/value-objects/lifewheel/lifewheel-id.value-object';
import { AreaId } from '../../../domain/value-objects/area/area-id.value-object';

export interface UserAreasSelectedRepositoryInterface {
  save(userAreasSelected: UserAreasSelected): Promise<UserAreasSelected>;
  saveMultiple(
    userAreasSelected: UserAreasSelected[],
  ): Promise<UserAreasSelected[]>;
  findById(id: string): Promise<UserAreasSelected | null>;
  findByUserAndLifeWheel(
    userId: UserId,
    lifeWheelId: LifeWheelId,
  ): Promise<UserAreasSelected[]>;
  findByUserId(userId: UserId): Promise<UserAreasSelected[]>;
  findByLifeWheelId(lifeWheelId: LifeWheelId): Promise<UserAreasSelected[]>;
  findByAreaId(areaId: AreaId): Promise<UserAreasSelected[]>;
  update(userAreasSelected: UserAreasSelected): Promise<UserAreasSelected>;
  delete(id: string): Promise<void>;
  deleteByUserAndLifeWheel(
    userId: UserId,
    lifeWheelId: LifeWheelId,
  ): Promise<void>;
}
