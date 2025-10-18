import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { LifeWheelRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel.repository.interface';
import type { LifeWheelAreaRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel-area.repository.interface';
import {
  LIFEWHEEL_REPOSITORY_TOKEN,
  LIFEWHEEL_AREA_REPOSITORY_TOKEN,
} from '../../ports/lifewheel';
import { USER_AREAS_SELECTED_REPOSITORY } from 'src/application/ports/tokens';
import type { UserAreasSelectedRepositoryInterface } from 'src/domain/repositories/user/user-areas-selected-repository.interface';

export interface GetUserLifeWheelRequest {
  userId: string;
}

export interface GetUserLifeWheelResponse {
  id: string;
  userId: string;
  globalScore: number;
  lifeAreas: {
    id: string;
    areaId: string;
    areaName: string;
    score: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
  lifeAreasSelected:
    | {
        id: string;
        areaId: string;
        score: number;
      }[]
    | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetUserLifeWheelUseCase {
  constructor(
    @Inject(LIFEWHEEL_REPOSITORY_TOKEN)
    private readonly lifeWheelRepository: LifeWheelRepositoryInterface,
    @Inject(LIFEWHEEL_AREA_REPOSITORY_TOKEN)
    private readonly lifeWheelAreaRepository: LifeWheelAreaRepositoryInterface,
    @Inject(USER_AREAS_SELECTED_REPOSITORY)
    private readonly lifeWheelAreaSelectedRepository: UserAreasSelectedRepositoryInterface,
  ) {}

  async execute(
    request: GetUserLifeWheelRequest,
  ): Promise<GetUserLifeWheelResponse> {
    const userId = UserId.fromString(request.userId);

    // 1. Obtener el LifeWheel del usuario
    const lifeWheels = await this.lifeWheelRepository.findByUserId(userId);
    if (!lifeWheels || lifeWheels.length === 0) {
      throw new Error('No LifeWheel found for this user');
    }

    // Tomar el primer LifeWheel (podría ser el más reciente)
    const lifeWheel = lifeWheels[0];

    // 2. Obtener todas las áreas del LifeWheel
    const lifeWheelAreas = await this.lifeWheelAreaRepository.findByLifeWheelId(
      lifeWheel.id,
    );

    // 2.1 Obtener las áreas seleccionadas por el usuario para este LifeWheel
    const lifeWheelAreasSelected =
      await this.lifeWheelAreaSelectedRepository.findByUserAndLifeWheel(
        userId,
        lifeWheel.id,
      );

    // 3. Preparar la respuesta
    return {
      id: lifeWheel.id.getValue(),
      userId: lifeWheel.userId.getValue(),
      globalScore: lifeWheel.globalScore,
      lifeAreas: lifeWheelAreas.map((lwa) => ({
        id: lwa.id.getValue(),
        areaId: lwa.areaId.getValue(),
        areaName: lwa.area?.description || lwa.area?.name || 'Unknown',
        score: lwa.score,
        createdAt: lwa.createdAt,
        updatedAt: lwa.updatedAt,
      })),
      lifeAreasSelected: lifeWheelAreasSelected.length
        ? lifeWheelAreasSelected.map((lwa) => ({
            id: lwa.id,
            areaId: lwa.areaId.getValue(),
            score: lwa.score,
          }))
        : null,
      createdAt: lifeWheel.createdAt,
      updatedAt: lifeWheel.updatedAt,
    };
  }
}
