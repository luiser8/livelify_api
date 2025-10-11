import { Injectable, Inject } from '@nestjs/common';
import { GtdActionId } from '../../../domain/value-objects/action/gtd-action-id.value-object';
import type { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import {
  GTD_ACTION_REPOSITORY_TOKEN,
  PROJECT_GOAL_REPOSITORY_TOKEN,
} from '../../ports/goals-actions';
import { GTD_PROJECT_DETAIL_REPOSITORY_TOKEN } from '../../ports/projects';

export interface CompleteActionRequest {
  userId: string;
  actionId: string;
}

export interface CompleteActionResponse {
  action: {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class CompleteActionUseCase {
  constructor(
    @Inject(GTD_ACTION_REPOSITORY_TOKEN)
    private readonly gtdActionRepository: GtdActionRepositoryInterface,
    @Inject(PROJECT_GOAL_REPOSITORY_TOKEN)
    private readonly projectGoalRepository: ProjectGoalRepositoryInterface,
    @Inject(GTD_PROJECT_DETAIL_REPOSITORY_TOKEN)
    private readonly projectDetailRepository: GtdProjectDetailRepositoryInterface,
  ) {}

  async execute(
    request: CompleteActionRequest,
  ): Promise<CompleteActionResponse> {
    // 1. Buscar la acción
    const actionId = GtdActionId.fromString(request.actionId);
    const action = await this.gtdActionRepository.findById(actionId);

    if (!action) {
      throw new Error('Action not found');
    }

    // 2. Marcar como completada
    action.markAsCompleted();

    // 3. Guardar los cambios
    const updatedAction = await this.gtdActionRepository.update(action);

    // 4. Obtener el goal asociado para actualizar el progreso del proyecto
    const goal = await this.projectGoalRepository.findById(action.goalId);
    if (goal) {
      await this.updateProjectProgress(goal.detailId);
    }

    // 5. Preparar la respuesta
    return {
      action: {
        id: updatedAction.id.getValue(),
        title: updatedAction.title,
        completed: updatedAction.completed,
        completedAt: updatedAction.completedAt,
        updatedAt: updatedAction.updatedAt,
      },
    };
  }

  /**
   * Actualiza el progreso del proyecto (completedActions, totalActions, progressPercentage)
   */
  private async updateProjectProgress(projectDetailId: any): Promise<void> {
    // 1. Obtener el project detail
    const projectDetail =
      await this.projectDetailRepository.findById(projectDetailId);
    if (!projectDetail) {
      return;
    }

    // 2. Obtener todas las acciones del proyecto
    const allActions = await this.gtdActionRepository.findByProjectId(
      projectDetail.projectId.getValue(),
    );

    // 3. Calcular estadísticas
    const totalActions = allActions.length;
    const completedActions = allActions.filter((a) => a.completed).length;
    const progressPercentage =
      totalActions > 0
        ? Math.round((completedActions / totalActions) * 100 * 100) / 100
        : 0;

    // 4. Actualizar el project detail
    projectDetail.updateProgress(
      totalActions,
      completedActions,
      progressPercentage,
    );
    await this.projectDetailRepository.update(projectDetail);
  }
}
