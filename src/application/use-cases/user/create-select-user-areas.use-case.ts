/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { LifeWheelId } from '../../../domain/value-objects/lifewheel/lifewheel-id.value-object';
import { AreaId } from '../../../domain/value-objects/area/area-id.value-object';
import { UserAreasSelected } from '../../../domain/entities/user/user-selected-areas.entity';
import { USER_AREAS_SELECTED_REPOSITORY } from '../../ports/tokens';
import type { UserAreasSelectedRepositoryInterface } from '../../../domain/repositories/user/user-areas-selected-repository.interface';

export interface AreaSelection {
  areaId: string;
  score: number;
}

export interface CreateUserSelectedAreasRequest {
  userId: string;
  lifeWheelId: string;
  areasIds: AreaSelection[];
}

export interface CreateUserSelectedAreasResponse {
  success: boolean;
  selectedAreas: Array<{
    id: string;
    userId: string;
    lifeWheelId: string;
    areaId: string;
    score: number;
    createdAt: Date;
  }>;
}

@Injectable()
export class CreateUserSelectedAreasUseCase {
  constructor(
    @Inject(USER_AREAS_SELECTED_REPOSITORY)
    private readonly userAreasSelectedRepository: UserAreasSelectedRepositoryInterface,
  ) {}

  async execute(
    request: CreateUserSelectedAreasRequest,
  ): Promise<CreateUserSelectedAreasResponse> {
    try {
      // 1. Validar datos de entrada
      this.validateRequest(request);

      // 2. Crear value objects
      const userId = UserId.fromString(request.userId);
      const lifeWheelId = LifeWheelId.fromString(request.lifeWheelId);

      // 3. Verificar si ya existen selecciones para este usuario y lifeWheel
      const existingSelections =
        await this.userAreasSelectedRepository.findByUserAndLifeWheel(
          userId,
          lifeWheelId,
        );

      if (existingSelections.length > 0) {
        throw new Error('User already has selected areas for this life wheel');
      }

      // 4. Crear entidades de dominio
      const userAreasSelected = UserAreasSelected.createMultiple(
        userId,
        lifeWheelId,
        request.areasIds.map((area) => ({
          areaId: AreaId.fromString(area.areaId),
          score: area.score,
        })),
      );

      // 5. Validar todas las entidades antes de persistir
      const invalidAreas = userAreasSelected.filter((area) => !area.isValid());
      if (invalidAreas.length > 0) {
        throw new Error(`Invalid scores found in ${invalidAreas.length} areas`);
      }

      // 6. Persistir las selecciones
      const savedAreas =
        await this.userAreasSelectedRepository.saveMultiple(userAreasSelected);

      // 7. Retornar respuesta
      return {
        success: true,
        selectedAreas: savedAreas.map((area) => ({
          id: area.id,
          userId: area.userId.getValue(),
          lifeWheelId: area.lifeWheelId.getValue(),
          areaId: area.areaId.getValue(),
          score: area.score,
          createdAt: area.createdAt,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to create user selected areas: ${error.message}`);
    }
  }

  private validateRequest(request: CreateUserSelectedAreasRequest): void {
    if (!request.userId || request.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!request.lifeWheelId || request.lifeWheelId.trim() === '') {
      throw new Error('Life Wheel ID is required');
    }

    if (
      !request.areasIds ||
      !Array.isArray(request.areasIds) ||
      request.areasIds.length === 0
    ) {
      throw new Error('At least one area must be selected');
    }

    // Validar que no haya más de 3 áreas seleccionadas (si es un requisito de negocio)
    if (request.areasIds.length > 3) {
      throw new Error('Cannot select more than 3 areas');
    }

    // Validar scores
    for (const area of request.areasIds) {
      if (area.score < 0 || area.score > 10) {
        throw new Error(
          `Score for area ${area.areaId} must be between 0 and 10`,
        );
      }

      if (!area.areaId || area.areaId.trim() === '') {
        throw new Error('Area ID is required for all selections');
      }
    }

    // Validar duplicados
    const areaIds = request.areasIds.map((area) => area.areaId);
    const uniqueAreaIds = new Set(areaIds);
    if (uniqueAreaIds.size !== areaIds.length) {
      throw new Error('Duplicate area IDs are not allowed');
    }
  }
}
