import { Area } from 'src/domain/entities/area/area.entity';

export interface AreaRepositoryInterface {
  findAll(): Promise<Area[] | null>;
}
