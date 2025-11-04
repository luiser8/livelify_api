/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Inject } from '@nestjs/common';
import { GtdActionId } from '../../../domain/value-objects/action/gtd-action-id.value-object';
import type { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import type { ActionBudgetRepositoryInterface } from '../../../domain/repositories/action-budget/action-budget.repository.interface';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import {
  GTD_ACTION_REPOSITORY_TOKEN,
  PROJECT_GOAL_REPOSITORY_TOKEN,
} from '../../ports/goals-actions';
import { GTD_PROJECT_DETAIL_REPOSITORY_TOKEN } from '../../ports/projects';
import { ACTION_BUDGET_REPOSITORY_TOKEN } from '../../ports/action-budgets';
import { BUDGET_REPOSITORY_TOKEN } from '../../ports/budget';

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
    @Inject(ACTION_BUDGET_REPOSITORY_TOKEN)
    private readonly actionBudgetRepository: ActionBudgetRepositoryInterface,
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: BudgetRepositoryInterface,
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

      // Obtener el project detail para recalcular el Budget
      const projectDetail = await this.projectDetailRepository.findById(
        goal.detailId,
      );
      if (projectDetail) {
        // Recalcular el Budget del proyecto sumando todos los ActionBudgets
        await this.updateProjectBudget(projectDetail.projectId);
      }
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

  /**
   * Actualiza el Budget del proyecto sumando todos los ActionBudgets asociados
   */
  private async updateProjectBudget(projectId: any): Promise<void> {
    // 1. Obtener todos los ActionBudgets del proyecto
    const actionBudgets = await this.actionBudgetRepository.findByProjectId(
      projectId.getValue(),
    );

    if (actionBudgets.length === 0) {
      return; // No hay presupuestos, no hacemos nada
    }

    // 2. Calcular la suma de todos los presupuestos de actions con máximo 2 decimales
    // Filtrar budgets que tienen valores no null
    const totalMonthlyBudget =
      Math.round(
        actionBudgets.reduce((sum, ab) => sum + (ab.monthlyBudget ?? 0), 0) *
          100,
      ) / 100;
    const totalDailyBudget =
      Math.round(
        actionBudgets.reduce((sum, ab) => sum + (ab.dailyBudget ?? 0), 0) * 100,
      ) / 100;

    // 3. Buscar si existe un Budget para este proyecto
    const existingBudget =
      await this.budgetRepository.findByProjectId(projectId);

    if (existingBudget) {
      // 4. Actualizar el Budget existente
      existingBudget.updateBothTargets(totalMonthlyBudget, totalDailyBudget);
      await this.budgetRepository.update(existingBudget);
    }
  }
}
