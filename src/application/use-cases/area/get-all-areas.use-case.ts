import { Injectable, Inject } from '@nestjs/common';
import { AREAS_REPOSITORY } from 'src/application/ports/areas';
import { Area } from 'src/domain/entities/area/area.entity';
import type { AreaRepositoryInterface } from 'src/domain/repositories/area/area.repository.interface';

@Injectable()
export class GetAllAreasUseCase {
  constructor(
    @Inject(AREAS_REPOSITORY)
    private readonly areaRepository: AreaRepositoryInterface,
  ) {}

  async execute(): Promise<Area[]> {
    const areas = await this.areaRepository.findAll();
    if (!areas) {
      throw new Error('Areas not found');
    }

    return areas;
  }
}
