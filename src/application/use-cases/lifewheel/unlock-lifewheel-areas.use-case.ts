import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { LifeWheelAreaId } from '../../../domain/value-objects/lifewheel/lifewheel-area-id.value-object';
import type { LifeWheelAreaRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel-area.repository.interface';
import type { LifeWheelRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel.repository.interface';
import {
  LIFEWHEEL_AREA_REPOSITORY_TOKEN,
  LIFEWHEEL_REPOSITORY_TOKEN,
} from '../../ports/lifewheel';

export interface UnlockLifeWheelAreasRequest {
  lifeWheelAreaIds: string[];
  userId: string;
}

export interface UnlockLifeWheelAreasResponse {
  unlockedCount: number;
  unlockedAreaIds: string[];
  message: string;
}

@Injectable()
export class UnlockLifeWheelAreasUseCase {
  constructor(
    @Inject(LIFEWHEEL_REPOSITORY_TOKEN)
    private readonly lifeWheelRepository: LifeWheelRepositoryInterface,
    @Inject(LIFEWHEEL_AREA_REPOSITORY_TOKEN)
    private readonly lifeWheelAreaRepository: LifeWheelAreaRepositoryInterface,
  ) {}

  async execute(
    request: UnlockLifeWheelAreasRequest,
  ): Promise<UnlockLifeWheelAreasResponse> {
    // 1. Validar que se recibieron al menos 1 área
    if (request.lifeWheelAreaIds.length === 0) {
      throw new BadRequestException('You must select areas to unlock');
    }

    const userId = UserId.fromString(request.userId);

    // 2. Obtener el LifeWheel del usuario
    const lifeWheels = await this.lifeWheelRepository.findByUserId(userId);
    if (!lifeWheels || lifeWheels.length === 0) {
      throw new NotFoundException('LifeWheel not found for this user');
    }

    const lifeWheel = lifeWheels[0]; // El usuario solo tiene un LifeWheel

    // 3. Convertir los IDs a value objects
    const lifeWheelAreaIds = request.lifeWheelAreaIds.map((id) =>
      LifeWheelAreaId.fromString(id),
    );

    // 5. Verificar que todas las áreas existan y pertenezcan al LifeWheel del usuario
    const areas = await Promise.all(
      lifeWheelAreaIds.map((id) => this.lifeWheelAreaRepository.findById(id)),
    );

    // Validar que todas las áreas existan
    const notFoundAreas = areas
      .map((area, index) =>
        area === null ? request.lifeWheelAreaIds[index] : null,
      )
      .filter((id) => id !== null);

    if (notFoundAreas.length > 0) {
      throw new NotFoundException(
        `LifeWheelAreas not found: ${notFoundAreas.join(', ')}`,
      );
    }

    // Validar que todas las áreas pertenezcan al LifeWheel del usuario (seguridad)
    const invalidAreas = areas.filter(
      (area) => area && area.lifeWheelId.getValue() !== lifeWheel.id.getValue(),
    );

    if (invalidAreas.length > 0) {
      throw new ForbiddenException(
        'One or more areas do not belong to your LifeWheel',
      );
    }

    // 6. Desbloquear las áreas (isBlocked = false)
    const unlockedCount =
      await this.lifeWheelAreaRepository.unlockAreas(lifeWheelAreaIds);

    // 7. Marcar el LifeWheel como respondido (isAnswered = true)
    lifeWheel.markAsAnswered();
    await this.lifeWheelRepository.update(lifeWheel);

    return {
      unlockedCount,
      unlockedAreaIds: request.lifeWheelAreaIds,
      message: `Successfully unlocked ${unlockedCount} areas for project creation`,
    };
  }
}
