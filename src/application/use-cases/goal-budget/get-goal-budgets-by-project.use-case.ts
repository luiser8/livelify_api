import { Injectable, Inject } from '@nestjs/common';
import type { GoalBudgetRepositoryInterface } from '../../../domain/repositories/goal-budget/goal-budget.repository.interface';
import { GOAL_BUDGET_REPOSITORY_TOKEN } from '../../ports/goal-budgets';

export interface GetGoalBudgetsByProjectRequest {
  projectId: string;
}

export interface GoalBudgetSummary {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface GetGoalBudgetsByProjectResponse {
  goalBudgets: GoalBudgetSummary[];
  totalBaseCapital: number;
  totalCapital: number;
  totalMonthlyBudget: number;
  totalDailyBudget: number;
}

@Injectable()
export class GetGoalBudgetsByProjectUseCase {
  constructor(
    @Inject(GOAL_BUDGET_REPOSITORY_TOKEN)
    private readonly goalBudgetRepository: GoalBudgetRepositoryInterface,
  ) {}

  async execute(
    request: GetGoalBudgetsByProjectRequest,
  ): Promise<GetGoalBudgetsByProjectResponse> {
    // 1. Obtener todos los presupuestos de goals del proyecto
    const goalBudgets = await this.goalBudgetRepository.findByProjectId(
      request.projectId,
    );

    // 2. Calcular totales
    let totalBaseCapital = 0;
    let totalCapital = 0;
    let totalMonthlyBudget = 0;
    let totalDailyBudget = 0;

    const goalBudgetSummaries: GoalBudgetSummary[] = goalBudgets.map(
      (goalBudget) => {
        totalBaseCapital += goalBudget.baseCapital;
        totalCapital += goalBudget.totalCapital;
        totalMonthlyBudget += goalBudget.monthlyBudget;
        totalDailyBudget += goalBudget.dailyBudget;

        return {
          id: goalBudget.id.getValue(),
          goalId: goalBudget.goalId.getValue(),
          baseCapital: goalBudget.baseCapital,
          multiplier: goalBudget.multiplier,
          totalCapital: goalBudget.totalCapital,
          monthlyBudget: goalBudget.monthlyBudget,
          dailyBudget: goalBudget.dailyBudget,
          projectMonths: goalBudget.projectMonths,
          projectDays: goalBudget.projectDays,
          currencyCode: goalBudget.currencyCode,
          currencySymbol: goalBudget.currencySymbol,
          createdAt: goalBudget.createdAt,
          updatedAt: goalBudget.updatedAt,
        };
      },
    );

    // 3. Preparar la respuesta
    return {
      goalBudgets: goalBudgetSummaries,
      totalBaseCapital,
      totalCapital,
      totalMonthlyBudget,
      totalDailyBudget,
    };
  }
}
