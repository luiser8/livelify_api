import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { LifeWheelRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel.repository.interface';
import type { LifeWheelAreaRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel-area.repository.interface';
import type { AnswerRepositoryInterface } from '../../../domain/repositories/answer/answer.repository.interface';
import {
  LIFEWHEEL_REPOSITORY_TOKEN,
  LIFEWHEEL_AREA_REPOSITORY_TOKEN,
  ANSWER_REPOSITORY_TOKEN,
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
    isArchived: boolean;
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
    @Inject(ANSWER_REPOSITORY_TOKEN)
    private readonly answerRepository: AnswerRepositoryInterface,
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

    // 3. Para cada área, verificar si tiene respuestas para determinar isArchived
    const lifeAreasWithArchiveStatus = await Promise.all(
      lifeWheelAreas.map(async (lwa) => {
        const answerCount =
          await this.answerRepository.countAnswersByUserAndLifeWheelArea(
            userId,
            lwa.id,
          );

        // Si el área tiene respuestas, isArchived es true; si no tiene respuestas, isArchived es false
        const isArchived = answerCount > 0;

        return {
          id: lwa.id.getValue(),
          areaId: lwa.areaId.getValue(),
          areaName: lwa.area?.description || lwa.area?.name || 'Unknown',
          score: lwa.score,
          isArchived,
          createdAt: lwa.createdAt,
          updatedAt: lwa.updatedAt,
        };
      }),
    );

    // 4. Preparar la respuesta
    return {
      id: lifeWheel.id.getValue(),
      userId: lifeWheel.userId.getValue(),
      globalScore: lifeWheel.globalScore,
      lifeAreas: lifeAreasWithArchiveStatus,
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
