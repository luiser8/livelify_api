import { Injectable, Inject } from '@nestjs/common';
import { LifeWheel } from '../../../domain/entities/lifewheel/lifewheel.entity';
import { LifeWheelArea } from '../../../domain/entities/lifewheel/lifewheel-area.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { LifeWheelRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel.repository.interface';
import type { LifeWheelAreaRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel-area.repository.interface';
import type { AreaRepositoryInterface } from '../../../domain/repositories/area/area.repository.interface';
import {
  LIFEWHEEL_REPOSITORY_TOKEN,
  LIFEWHEEL_AREA_REPOSITORY_TOKEN,
} from '../../ports/lifewheel';
import { AREAS_REPOSITORY } from '../../ports/areas';

export interface CreateLifeWheelWithAreasRequest {
  userId: string;
}

export interface CreateLifeWheelWithAreasResponse {
  id: string;
  userId: string;
  globalScore: number;
  lifeAreas: {
    id: string;
    areaId: string;
    areaName: string;
    score: number;
  }[];
  createdAt: Date;
}

@Injectable()
export class CreateLifeWheelWithAreasUseCase {
  constructor(
    @Inject(LIFEWHEEL_REPOSITORY_TOKEN)
    private readonly lifeWheelRepository: LifeWheelRepositoryInterface,
    @Inject(LIFEWHEEL_AREA_REPOSITORY_TOKEN)
    private readonly lifeWheelAreaRepository: LifeWheelAreaRepositoryInterface,
    @Inject(AREAS_REPOSITORY)
    private readonly areaRepository: AreaRepositoryInterface,
  ) {}

  async execute(
    request: CreateLifeWheelWithAreasRequest,
  ): Promise<CreateLifeWheelWithAreasResponse> {
    // 1. Crear el LifeWheel
    const userId = UserId.fromString(request.userId);
    const lifeWheel = LifeWheel.create(userId);

    // 2. Guardar el LifeWheel
    const savedLifeWheel = await this.lifeWheelRepository.save(lifeWheel);

    // 3. Obtener todas las áreas predefinidas
    const areas = await this.areaRepository.findAll();
    if (!areas || areas.length === 0) {
      throw new Error('No areas found in the system');
    }

    // 4. Crear LifeWheelArea para cada área predefinida
    const lifeWheelAreas: LifeWheelArea[] = [];
    for (const area of areas) {
      const lifeWheelArea = LifeWheelArea.create(
        savedLifeWheel.id,
        area.id,
        area,
        0, // Score inicial de 0
      );

      const savedLifeWheelArea =
        await this.lifeWheelAreaRepository.save(lifeWheelArea);
      lifeWheelAreas.push(savedLifeWheelArea);
    }

    // 5. Actualizar el LifeWheel con las áreas creadas
    for (const lifeWheelArea of lifeWheelAreas) {
      savedLifeWheel.addLifeArea(lifeWheelArea);
    }

    // 6. Actualizar el LifeWheel en la base de datos
    const updatedLifeWheel =
      await this.lifeWheelRepository.update(savedLifeWheel);

    // 7. Preparar la respuesta
    return {
      id: updatedLifeWheel.id.getValue(),
      userId: updatedLifeWheel.userId.getValue(),
      globalScore: updatedLifeWheel.globalScore,
      lifeAreas: lifeWheelAreas.map((lwa) => ({
        id: lwa.id.getValue(),
        areaId: lwa.areaId.getValue(),
        areaName: lwa.area?.name || 'Unknown',
        score: lwa.score,
      })),
      createdAt: updatedLifeWheel.createdAt,
    };
  }
}
