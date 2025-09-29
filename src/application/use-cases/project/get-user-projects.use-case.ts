import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { GtdProjectRepositoryInterface } from '../../../domain/repositories/project/gtd-project.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import {
  GTD_PROJECT_REPOSITORY_TOKEN,
  GTD_PROJECT_DETAIL_REPOSITORY_TOKEN,
} from '../../ports/projects';

export interface GetUserProjectsRequest {
  userId: string;
}

export interface ProjectWithDetailResponse {
  id: string;
  lifeWheelAreaId: string;
  title: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  detail?: {
    id: string;
    lifeAreaId: string;
    status: string;
    startDate: Date;
    endDate: Date;
    completedActions: number;
    totalActions: number;
    progressPercentage: number;
  };
}

export interface GetUserProjectsResponse {
  projects: ProjectWithDetailResponse[];
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

@Injectable()
export class GetUserProjectsUseCase {
  constructor(
    @Inject(GTD_PROJECT_REPOSITORY_TOKEN)
    private readonly gtdProjectRepository: GtdProjectRepositoryInterface,
    @Inject(GTD_PROJECT_DETAIL_REPOSITORY_TOKEN)
    private readonly gtdProjectDetailRepository: GtdProjectDetailRepositoryInterface,
  ) {}

  async execute(
    request: GetUserProjectsRequest,
  ): Promise<GetUserProjectsResponse> {
    const userId = UserId.fromString(request.userId);

    // 1. Obtener todos los proyectos del usuario
    const projects = await this.gtdProjectRepository.findByUserId(userId);

    // 2. Para cada proyecto, obtener su detalle
    const projectsWithDetails: ProjectWithDetailResponse[] = [];

    for (const project of projects) {
      const detail = await this.gtdProjectDetailRepository.findByProjectId(
        project.id,
      );

      projectsWithDetails.push({
        id: project.id.getValue(),
        lifeWheelAreaId: project.lifeWheelAreaId.getValue(),
        title: project.title,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        detail: detail
          ? {
              id: detail.id.getValue(),
              lifeAreaId: detail.lifeAreaId.getValue(),
              status: detail.status,
              startDate: detail.startDate,
              endDate: detail.endDate,
              completedActions: detail.completedActions,
              totalActions: detail.totalActions,
              progressPercentage: detail.progressPercentage,
            }
          : undefined,
      });
    }

    // 3. Calcular estadísticas
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
    const completedProjects = projects.filter(
      (p) => p.status === 'COMPLETED',
    ).length;

    return {
      projects: projectsWithDetails,
      totalProjects,
      activeProjects,
      completedProjects,
    };
  }
}
