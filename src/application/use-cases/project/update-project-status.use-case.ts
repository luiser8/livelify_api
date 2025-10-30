import { Injectable, Inject } from '@nestjs/common';
import { GtdProjectId } from '../../../domain/value-objects/project/gtd-project-id.value-object';
import { LifeWheelAreaId } from '../../../domain/value-objects/lifewheel/lifewheel-area-id.value-object';
import { ProjectStatus } from '../../../domain/entities/project/gtd-project.entity';
import type { GtdProjectRepositoryInterface } from '../../../domain/repositories/project/gtd-project.repository.interface';
import type { LifeWheelAreaRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel-area.repository.interface';
import type { LifeWheelRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel.repository.interface';
import { GTD_PROJECT_REPOSITORY_TOKEN } from '../../ports/projects';
import {
  LIFEWHEEL_AREA_REPOSITORY_TOKEN,
  LIFEWHEEL_REPOSITORY_TOKEN,
} from '../../ports/lifewheel';
import { USER_AREAS_SELECTED_REPOSITORY } from '../../ports/tokens';
import type { UserAreasSelectedRepositoryInterface } from 'src/domain/repositories/user/user-areas-selected-repository.interface';

export interface UpdateProjectStatusRequest {
  userId: string;
  projectId: string;
  status: 'ACTIVE' | 'SOMEDAY' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateProjectStatusResponse {
  project: {
    id: string;
    title: string;
    status: string;
    updatedAt: Date;
  };
}

@Injectable()
export class UpdateProjectStatusUseCase {
  constructor(
    @Inject(GTD_PROJECT_REPOSITORY_TOKEN)
    private readonly gtdProjectRepository: GtdProjectRepositoryInterface,
    @Inject(LIFEWHEEL_AREA_REPOSITORY_TOKEN)
    private readonly lifeWheelAreaRepository: LifeWheelAreaRepositoryInterface,
    @Inject(LIFEWHEEL_REPOSITORY_TOKEN)
    private readonly lifeWheelRepository: LifeWheelRepositoryInterface,
    @Inject(USER_AREAS_SELECTED_REPOSITORY)
    private readonly userAreasSelectedRepository: UserAreasSelectedRepositoryInterface,
  ) {}

  async execute(
    request: UpdateProjectStatusRequest,
  ): Promise<UpdateProjectStatusResponse> {
    // 1. Buscar el proyecto
    const projectId = GtdProjectId.fromString(request.projectId);
    const project = await this.gtdProjectRepository.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // 2. Validar el nuevo estatus
    const newStatus = request.status as ProjectStatus;
    if (!Object.values(ProjectStatus).includes(newStatus)) {
      throw new Error(
        'Invalid project status. Must be ACTIVE, SOMEDAY, COMPLETED, or CANCELLED',
      );
    }

    // 3. Guardar el estado anterior para determinar si se necesita recalcular
    const previousStatus = project.status;
    const expectedScore = project.expectedScore || 0;

    // 4. Actualizar el estatus
    project.updateStatus(newStatus);

    // 5. Guardar los cambios
    const updatedProject = await this.gtdProjectRepository.update(project);

    // 6. Si el estado cambió de o hacia COMPLETED, actualizar los scores del área y global
    const statusChangedFromOrToCompleted =
      (previousStatus === ProjectStatus.COMPLETED &&
        newStatus !== ProjectStatus.COMPLETED) ||
      (previousStatus !== ProjectStatus.COMPLETED &&
        newStatus === ProjectStatus.COMPLETED);

    if (statusChangedFromOrToCompleted) {
      // Determinar si se debe sumar o restar el expectedScore
      const shouldAdd = newStatus === ProjectStatus.COMPLETED;
      await this.updateLifeWheelScores(
        project.lifeWheelAreaId,
        expectedScore,
        shouldAdd,
      );
    }

    // 7. Preparar la respuesta
    return {
      project: {
        id: updatedProject.id.getValue(),
        title: updatedProject.title,
        status: updatedProject.status,
        updatedAt: updatedProject.updatedAt,
      },
    };
  }

  /**
   * Actualiza los scores del LifeWheelArea y del LifeWheel global
   * Lógica: Suma o resta el expectedScore del proyecto al score actual del área (máximo 10)
   * El score global es el promedio de todas las áreas (máximo 10)
   */
  private async updateLifeWheelScores(
    lifeWheelAreaId: LifeWheelAreaId,
    projectExpectedScore: number,
    shouldAdd: boolean,
  ): Promise<void> {
    // 1. Obtener el LifeWheelArea
    const lifeWheelArea =
      await this.lifeWheelAreaRepository.findById(lifeWheelAreaId);

    if (!lifeWheelArea) {
      throw new Error('LifeWheelArea not found');
    }

    // 2. Obtener el score actual del área
    let areaScore = lifeWheelArea.score;

    // 3. Sumar o restar el expectedScore del proyecto
    if (shouldAdd) {
      areaScore += projectExpectedScore;
    } else {
      areaScore -= projectExpectedScore;
      // Asegurar que no sea negativo
      areaScore = Math.max(areaScore, 0);
    }

    // 4. Limitar el score del área a un máximo de 10
    areaScore = Math.min(areaScore, 10);

    // 5. Redondear a 2 decimales
    areaScore = Math.round(areaScore * 100) / 100;

    // 6. Actualizar el score del LifeWheelArea
    lifeWheelArea.updateScore(areaScore);
    await this.lifeWheelAreaRepository.update(lifeWheelArea);

    // 7. Actualizar el globalScore del LifeWheel
    const lifeWheel = await this.lifeWheelRepository.findById(
      lifeWheelArea.lifeWheelId,
    );

    if (!lifeWheel) {
      throw new Error('LifeWheel not found');
    }

    // 8. Obtener todas las áreas del LifeWheel para recalcular el globalScore
    const allAreas = await this.lifeWheelAreaRepository.findByLifeWheelId(
      lifeWheelArea.lifeWheelId,
    );

    // 9. Calcular el promedio de scores de todas las áreas (máximo 10)
    if (allAreas.length > 0) {
      const totalScore = allAreas.reduce((sum, area) => sum + area.score, 0);
      let globalScore = totalScore / allAreas.length;

      // Limitar el score global a un máximo de 10
      globalScore = Math.min(globalScore, 10);

      const roundedGlobalScore = Math.round(globalScore * 100) / 100;

      lifeWheel.updateGlobalScore(roundedGlobalScore);
      await this.lifeWheelRepository.update(lifeWheel);
    }

    // 10. Verificar si ya existen selecciones para este usuario y lifeWheel
    const existingSelections =
      await this.userAreasSelectedRepository.findByLifeWheelId(lifeWheel.id);

    if (existingSelections.length > 0) {
      for (const selection of existingSelections) {
        selection.updateScore(lifeWheel.globalScore);
        await this.userAreasSelectedRepository.update(selection);
      }
    }
  }
}
