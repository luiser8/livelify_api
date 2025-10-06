import { Injectable, Inject } from '@nestjs/common';
import { GoalBudgetId } from '../../../domain/value-objects/goal-budget/goal-budget-id.value-object';
import { GtdProjectId } from '../../../domain/value-objects/project/gtd-project-id.value-object';
import { CurrencyId } from '../../../domain/value-objects/currency/currency-id.value-object';
import { Budget } from '../../../domain/entities/budget/budget.entity';
import type { GoalBudgetRepositoryInterface } from '../../../domain/repositories/goal-budget/goal-budget.repository.interface';
import type { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import { GOAL_BUDGET_REPOSITORY_TOKEN } from '../../ports/goal-budgets';
import { BUDGET_REPOSITORY_TOKEN } from '../../ports/budget';
import { PROJECT_GOAL_REPOSITORY_TOKEN } from '../../ports/goals-actions';
import { GTD_PROJECT_DETAIL_REPOSITORY_TOKEN } from '../../ports/projects';

export interface UpdateGoalBudgetRequest {
  goalBudgetId: string;
  baseCapital?: number;
  multiplier?: number;
}

export interface UpdateGoalBudgetResponse {
  goalBudget: {
    id: string;
    goalId: string;
    baseCapital: number;
    multiplier: number;
    totalCapital: number;
    monthlyBudget: number;
    dailyBudget: number;
    projectMonths: number;
    projectDays: number;
    currencyCode: string;
    currencySymbol: string;
    updatedAt: Date;
  };
}

@Injectable()
export class UpdateGoalBudgetUseCase {
  constructor(
    @Inject(GOAL_BUDGET_REPOSITORY_TOKEN)
    private readonly goalBudgetRepository: GoalBudgetRepositoryInterface,
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: BudgetRepositoryInterface,
    @Inject(PROJECT_GOAL_REPOSITORY_TOKEN)
    private readonly projectGoalRepository: ProjectGoalRepositoryInterface,
    @Inject(GTD_PROJECT_DETAIL_REPOSITORY_TOKEN)
    private readonly projectDetailRepository: GtdProjectDetailRepositoryInterface,
  ) {}

  async execute(
    request: UpdateGoalBudgetRequest,
  ): Promise<UpdateGoalBudgetResponse> {
    // 1. Buscar el presupuesto del goal
    const goalBudgetId = GoalBudgetId.fromString(request.goalBudgetId);
    const goalBudget = await this.goalBudgetRepository.findById(goalBudgetId);

    if (!goalBudget) {
      throw new Error('Goal budget not found');
    }

    // 2. Actualizar el capital base si se proporciona
    if (request.baseCapital !== undefined) {
      goalBudget.updateBaseCapital(request.baseCapital);
    }

    // 3. Actualizar el multiplicador si se proporciona
    if (request.multiplier !== undefined) {
      goalBudget.updateMultiplier(request.multiplier);
    }

    // 4. Guardar los cambios
    const updatedGoalBudget =
      await this.goalBudgetRepository.update(goalBudget);

    // 5. Obtener el goal asociado para obtener el projectId
    const goal = await this.projectGoalRepository.findById(
      updatedGoalBudget.goalId,
    );
    if (goal) {
      const projectDetail = await this.projectDetailRepository.findById(
        goal.detailId,
      );
      if (projectDetail) {
        // 6. Actualizar el Budget del proyecto
        await this.updateProjectBudget(
          projectDetail.projectId,
          updatedGoalBudget.currencyId,
        );
      }
    }

    // 7. Preparar la respuesta
    return {
      goalBudget: {
        id: updatedGoalBudget.id.getValue(),
        goalId: updatedGoalBudget.goalId.getValue(),
        baseCapital: updatedGoalBudget.baseCapital,
        multiplier: updatedGoalBudget.multiplier,
        totalCapital: updatedGoalBudget.totalCapital,
        monthlyBudget: updatedGoalBudget.monthlyBudget,
        dailyBudget: updatedGoalBudget.dailyBudget,
        projectMonths: updatedGoalBudget.projectMonths,
        projectDays: updatedGoalBudget.projectDays,
        currencyCode: updatedGoalBudget.currencyCode,
        currencySymbol: updatedGoalBudget.currencySymbol,
        updatedAt: updatedGoalBudget.updatedAt,
      },
    };
  }

  /**
   * Actualiza el Budget del proyecto sumando todos los GoalBudgets asociados
   */
  private async updateProjectBudget(
    projectId: GtdProjectId,
    currencyId: CurrencyId,
  ): Promise<void> {
    // 1. Obtener todos los GoalBudgets del proyecto
    const goalBudgets = await this.goalBudgetRepository.findByProjectId(
      projectId.getValue(),
    );

    // 2. Calcular la suma de todos los presupuestos de goals con máximo 2 decimales
    const totalMonthlyBudget =
      Math.round(
        goalBudgets.reduce((sum, gb) => sum + gb.monthlyBudget, 0) * 100,
      ) / 100;
    const totalDailyBudget =
      Math.round(
        goalBudgets.reduce((sum, gb) => sum + gb.dailyBudget, 0) * 100,
      ) / 100;

    // 3. Buscar si existe un Budget para este proyecto
    const existingBudget =
      await this.budgetRepository.findByProjectId(projectId);

    if (existingBudget) {
      // 4. Actualizar el Budget existente
      existingBudget.updateBothTargets(totalMonthlyBudget, totalDailyBudget);
      await this.budgetRepository.update(existingBudget);
    } else if (goalBudgets.length > 0) {
      // 5. Crear un nuevo Budget si hay GoalBudgets y no existe Budget
      // Usar la primera moneda de los GoalBudgets
      const firstGoalBudget = goalBudgets[0];
      const newBudget = Budget.create(
        projectId,
        currencyId,
        totalMonthlyBudget,
        totalDailyBudget,
        firstGoalBudget.currency,
      );
      await this.budgetRepository.save(newBudget);
    }
  }
}
