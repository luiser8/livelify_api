import { Injectable, Inject } from '@nestjs/common';
import { GtdProjectId } from '../../../domain/value-objects/project/gtd-project-id.value-object';
import { ProjectStatus } from '../../../domain/entities/project/gtd-project.entity';
import type { GtdProjectRepositoryInterface } from '../../../domain/repositories/project/gtd-project.repository.interface';
import { GTD_PROJECT_REPOSITORY_TOKEN } from '../../ports/projects';

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

    // 3. Actualizar el estatus
    project.updateStatus(newStatus);

    // 4. Guardar los cambios
    const updatedProject = await this.gtdProjectRepository.update(project);

    // 5. Preparar la respuesta
    return {
      project: {
        id: updatedProject.id.getValue(),
        title: updatedProject.title,
        status: updatedProject.status,
        updatedAt: updatedProject.updatedAt,
      },
    };
  }
}

