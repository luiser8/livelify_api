import { Injectable, Inject } from '@nestjs/common';
import { GtdProject } from '../../../domain/entities/project/gtd-project.entity';
import { GtdProjectDetail } from '../../../domain/entities/project/gtd-project-detail.entity';
import { LifeWheelAreaId } from '../../../domain/value-objects/lifewheel/lifewheel-area-id.value-object';
import type { GtdProjectRepositoryInterface } from '../../../domain/repositories/project/gtd-project.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import type { LifeWheelAreaRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel-area.repository.interface';
import {
  GTD_PROJECT_REPOSITORY_TOKEN,
  GTD_PROJECT_DETAIL_REPOSITORY_TOKEN,
} from '../../ports/projects';
import { LIFEWHEEL_AREA_REPOSITORY_TOKEN } from '../../ports/lifewheel';

export interface CreateProjectFromLifeWheelAreaRequest {
  userId: string;
  lifeWheelAreaId: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface CreateProjectFromLifeWheelAreaResponse {
  project: {
    id: string;
    lifeWheelAreaId: string;
    title: string;
    description?: string;
    status: string;
    createdAt: Date;
  };
  detail: {
    id: string;
    projectId: string;
    lifeAreaId: string;
    status: string;
    startDate: Date;
    endDate: Date;
    completedActions: number;
    totalActions: number;
    progressPercentage: number;
    createdAt: Date;
  };
}

@Injectable()
export class CreateProjectFromLifeWheelAreaUseCase {
  constructor(
    @Inject(GTD_PROJECT_REPOSITORY_TOKEN)
    private readonly gtdProjectRepository: GtdProjectRepositoryInterface,
    @Inject(GTD_PROJECT_DETAIL_REPOSITORY_TOKEN)
    private readonly gtdProjectDetailRepository: GtdProjectDetailRepositoryInterface,
    @Inject(LIFEWHEEL_AREA_REPOSITORY_TOKEN)
    private readonly lifeWheelAreaRepository: LifeWheelAreaRepositoryInterface,
  ) {}

  async execute(
    request: CreateProjectFromLifeWheelAreaRequest,
  ): Promise<CreateProjectFromLifeWheelAreaResponse> {
    // 1. Validar que el LifeWheelArea existe y pertenece al usuario
    const lifeWheelAreaId = LifeWheelAreaId.fromString(request.lifeWheelAreaId);
    const lifeWheelArea =
      await this.lifeWheelAreaRepository.findById(lifeWheelAreaId);

    if (!lifeWheelArea) {
      throw new Error('LifeWheelArea not found');
    }

    // 2. Validar fechas
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    // 3. Crear el proyecto GTD
    const gtdProject = GtdProject.create(
      lifeWheelAreaId,
      request.title,
      request.description,
    );

    // 4. Guardar el proyecto
    const savedProject = await this.gtdProjectRepository.save(gtdProject);

    // 5. Crear el detalle del proyecto
    const gtdProjectDetail = GtdProjectDetail.create(
      savedProject.id,
      lifeWheelArea.areaId, // Usar el areaId del LifeWheelArea
      startDate,
      endDate,
    );

    // 6. Guardar el detalle del proyecto
    const savedProjectDetail =
      await this.gtdProjectDetailRepository.save(gtdProjectDetail);

    // 7. Preparar la respuesta
    return {
      project: {
        id: savedProject.id.getValue(),
        lifeWheelAreaId: savedProject.lifeWheelAreaId.getValue(),
        title: savedProject.title,
        description: savedProject.description,
        status: savedProject.status,
        createdAt: savedProject.createdAt,
      },
      detail: {
        id: savedProjectDetail.id.getValue(),
        projectId: savedProjectDetail.projectId.getValue(),
        lifeAreaId: savedProjectDetail.lifeAreaId.getValue(),
        status: savedProjectDetail.status,
        startDate: savedProjectDetail.startDate,
        endDate: savedProjectDetail.endDate,
        completedActions: savedProjectDetail.completedActions,
        totalActions: savedProjectDetail.totalActions,
        progressPercentage: savedProjectDetail.progressPercentage,
        createdAt: savedProjectDetail.createdAt,
      },
    };
  }
}
