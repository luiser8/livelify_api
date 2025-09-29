import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import { BUDGET_REPOSITORY_TOKEN } from '../../ports/budget';

export interface GetUserBudgetsRequest {
  userId: string;
}

export interface BudgetWithProjectResponse {
  id: string;
  projectId: string;
  projectTitle: string;
  projectDescription?: string;
  areaName: string;
  monthlyIncomeTarget?: number;
  dailyIncomeTarget?: number;
  currencyCode: string;
  currencySymbol: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUserBudgetsResponse {
  budgets: BudgetWithProjectResponse[];
  totalBudgets: number;
  totalMonthlyTarget: number;
  totalDailyTarget: number;
  currenciesUsed: string[];
}

@Injectable()
export class GetUserBudgetsUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: BudgetRepositoryInterface,
  ) {}

  async execute(
    request: GetUserBudgetsRequest,
  ): Promise<GetUserBudgetsResponse> {
    // 1. Obtener todos los presupuestos del usuario
    const userId = UserId.fromString(request.userId);
    const budgets = await this.budgetRepository.findByUserId(userId);

    // 2. Mapear los presupuestos con información del proyecto
    const budgetsWithProjects: BudgetWithProjectResponse[] = budgets.map(
      (budget) => ({
        id: budget.id.getValue(),
        projectId: budget.projectId.getValue(),
        projectTitle: 'Project Title', // TODO: Get from project entity
        projectDescription: undefined, // TODO: Get from project entity
        areaName: 'Area Name', // TODO: Get from area entity
        monthlyIncomeTarget: budget.monthlyIncomeTarget,
        dailyIncomeTarget: budget.dailyIncomeTarget,
        currencyCode: budget.currencyCode,
        currencySymbol: budget.currencySymbol,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      }),
    );

    // 3. Calcular estadísticas
    const totalBudgets = budgets.length;

    // Agrupar por moneda para calcular totales
    const currencyTotals = new Map<
      string,
      { monthly: number; daily: number }
    >();
    const currenciesUsed = new Set<string>();

    budgets.forEach((budget) => {
      const currencyCode = budget.currencyCode;
      currenciesUsed.add(currencyCode);

      if (!currencyTotals.has(currencyCode)) {
        currencyTotals.set(currencyCode, { monthly: 0, daily: 0 });
      }

      const totals = currencyTotals.get(currencyCode)!;
      if (budget.monthlyIncomeTarget) {
        totals.monthly += budget.monthlyIncomeTarget;
      }
      if (budget.dailyIncomeTarget) {
        totals.daily += budget.dailyIncomeTarget;
      }
    });

    // Para simplificar, asumimos que la mayoría usa la misma moneda
    // En una implementación real, podrías convertir a una moneda base
    const totalMonthlyTarget = Array.from(currencyTotals.values()).reduce(
      (sum, totals) => sum + totals.monthly,
      0,
    );
    const totalDailyTarget = Array.from(currencyTotals.values()).reduce(
      (sum, totals) => sum + totals.daily,
      0,
    );

    return {
      budgets: budgetsWithProjects,
      totalBudgets,
      totalMonthlyTarget,
      totalDailyTarget,
      currenciesUsed: Array.from(currenciesUsed),
    };
  }
}
