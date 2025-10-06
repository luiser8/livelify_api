import { Injectable, Inject } from '@nestjs/common';
import { GoalBudget } from '../../../domain/entities/goal-budget/goal-budget.entity';
import { ProjectGoalId } from '../../../domain/value-objects/goal/project-goal-id.value-object';
import type { GoalBudgetRepositoryInterface } from '../../../domain/repositories/goal-budget/goal-budget.repository.interface';
import type { CurrencyRepositoryInterface } from '../../../domain/repositories/currency/currency.repository.interface';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import { GOAL_BUDGET_REPOSITORY_TOKEN } from '../../ports/goal-budgets';
import { CURRENCY_REPOSITORY_TOKEN } from '../../ports/budget';
import { PROJECT_GOAL_REPOSITORY_TOKEN } from '../../ports/goals-actions';
import { GTD_PROJECT_DETAIL_REPOSITORY_TOKEN } from '../../ports/projects';

export interface CreateGoalBudgetRequest {
  goalId: string;
  baseCapital: number;
  multiplier?: number; // Default: 1.3
  currencyCode: string;
}

export interface CreateGoalBudgetResponse {
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
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class CreateGoalBudgetUseCase {
  constructor(
    @Inject(GOAL_BUDGET_REPOSITORY_TOKEN)
    private readonly goalBudgetRepository: GoalBudgetRepositoryInterface,
    @Inject(CURRENCY_REPOSITORY_TOKEN)
    private readonly currencyRepository: CurrencyRepositoryInterface,
    @Inject(PROJECT_GOAL_REPOSITORY_TOKEN)
    private readonly projectGoalRepository: ProjectGoalRepositoryInterface,
    @Inject(GTD_PROJECT_DETAIL_REPOSITORY_TOKEN)
    private readonly projectDetailRepository: GtdProjectDetailRepositoryInterface,
  ) {}

  async execute(
    request: CreateGoalBudgetRequest,
  ): Promise<CreateGoalBudgetResponse> {
    // 1. Validar que el goal existe
    const goalId = ProjectGoalId.fromString(request.goalId);
    const goal = await this.projectGoalRepository.findById(goalId);

    if (!goal) {
      throw new Error('Goal not found');
    }

    // 2. Verificar que el goal no tenga ya un presupuesto
    const existingBudget = await this.goalBudgetRepository.findByGoalId(goalId);
    if (existingBudget) {
      throw new Error('Goal already has a budget');
    }

    // 3. Obtener el detalle del proyecto para las fechas
    const projectDetail = await this.projectDetailRepository.findById(
      goal.detailId,
    );
    if (!projectDetail) {
      throw new Error('Project detail not found');
    }

    // 4. Validar que la moneda existe
    const currency = await this.currencyRepository.findByCode(
      request.currencyCode,
    );
    if (!currency) {
      throw new Error(`Currency with code ${request.currencyCode} not found`);
    }

    // 5. Validar el capital base
    if (request.baseCapital < 0) {
      throw new Error('Base capital cannot be negative');
    }

    // 6. Crear el presupuesto del goal con cálculos automáticos
    const goalBudget = GoalBudget.create(
      goalId,
      currency.id,
      {
        baseCapital: request.baseCapital,
        multiplier: request.multiplier,
        projectStartDate: projectDetail.startDate,
        projectEndDate: projectDetail.endDate,
      },
      currency,
    );

    // 7. Guardar el presupuesto del goal
    const savedGoalBudget = await this.goalBudgetRepository.save(goalBudget);

    // 8. Preparar la respuesta
    return {
      goalBudget: {
        id: savedGoalBudget.id.getValue(),
        goalId: savedGoalBudget.goalId.getValue(),
        baseCapital: savedGoalBudget.baseCapital,
        multiplier: savedGoalBudget.multiplier,
        totalCapital: savedGoalBudget.totalCapital,
        monthlyBudget: savedGoalBudget.monthlyBudget,
        dailyBudget: savedGoalBudget.dailyBudget,
        projectMonths: savedGoalBudget.projectMonths,
        projectDays: savedGoalBudget.projectDays,
        currencyCode: savedGoalBudget.currencyCode,
        currencySymbol: savedGoalBudget.currencySymbol,
        createdAt: savedGoalBudget.createdAt,
        updatedAt: savedGoalBudget.updatedAt,
      },
    };
  }
}
