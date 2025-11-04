import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { LifeWheelRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel.repository.interface';
import { LIFEWHEEL_REPOSITORY_TOKEN } from '../../ports/lifewheel';

export interface MarkLifeWheelAsAnsweredRequest {
  userId: string;
}

export interface MarkLifeWheelAsAnsweredResponse {
  id: string;
  userId: string;
  isAnswered: boolean;
  globalScore: number;
  updatedAt: Date;
}

@Injectable()
export class MarkLifeWheelAsAnsweredUseCase {
  constructor(
    @Inject(LIFEWHEEL_REPOSITORY_TOKEN)
    private readonly lifeWheelRepository: LifeWheelRepositoryInterface,
  ) {}

  async execute(
    request: MarkLifeWheelAsAnsweredRequest,
  ): Promise<MarkLifeWheelAsAnsweredResponse> {
    // 1. Validar que existe el usuario
    const userId = UserId.fromString(request.userId);

    // 2. Buscar el LifeWheel del usuario
    const lifeWheels = await this.lifeWheelRepository.findByUserId(userId);

    if (lifeWheels.length === 0) {
      throw new NotFoundException(
        `LifeWheel not found for user ${request.userId}`,
      );
    }

    // 3. Obtener el primer (y único) LifeWheel del usuario
    const lifeWheel = lifeWheels[0];

    // 4. Marcar como respondido
    lifeWheel.markAsAnswered();

    // 5. Actualizar en la base de datos
    const updatedLifeWheel = await this.lifeWheelRepository.update(lifeWheel);

    // 6. Retornar respuesta
    return {
      id: updatedLifeWheel.id.getValue(),
      userId: updatedLifeWheel.userId.getValue(),
      isAnswered: updatedLifeWheel.isAnswered,
      globalScore: updatedLifeWheel.globalScore,
      updatedAt: updatedLifeWheel.updatedAt,
    };
  }
}

