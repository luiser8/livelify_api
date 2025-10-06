import { Injectable, Inject } from '@nestjs/common';
import {
  ProjectGoal,
  GoalType,
} from '../../../domain/entities/goal/project-goal.entity';
import { GtdProjectDetailId } from '../../../domain/value-objects/project/gtd-project-detail-id.value-object';
import { GtdProjectId } from '../../../domain/value-objects/project/gtd-project-id.value-object';
import { CurrencyId } from '../../../domain/value-objects/currency/currency-id.value-object';
import { GoalBudget } from '../../../domain/entities/goal-budget/goal-budget.entity';
import { Budget } from '../../../domain/entities/budget/budget.entity';
import { Currency } from '../../../domain/entities/currency/currency.entity';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import type { GoalBudgetRepositoryInterface } from '../../../domain/repositories/goal-budget/goal-budget.repository.interface';
import type { CurrencyRepositoryInterface } from '../../../domain/repositories/currency/currency.repository.interface';
import type { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import { PROJECT_GOAL_REPOSITORY_TOKEN } from '../../ports/goals-actions';
import { GTD_PROJECT_DETAIL_REPOSITORY_TOKEN } from '../../ports/projects';
import { GOAL_BUDGET_REPOSITORY_TOKEN } from '../../ports/goal-budgets';
import {
  CURRENCY_REPOSITORY_TOKEN,
  BUDGET_REPOSITORY_TOKEN,
} from '../../ports/budget';

export interface CreateProjectGoalRequest {
  userId: string;
  projectDetailId: string;
  goalType: 'BE' | 'DO' | 'HAVE';
  content: string;
  // Campos para crear presupuesto del goal
  baseCapital?: number;
  currencyCode?: string;
}

export interface CreateProjectGoalResponse {
  goal: {
    id: string;
    projectDetailId: string;
    goalType: GoalType;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  };
  budget?: {
    id: string;
    baseCapital: number;
    multiplier: number;
    totalCapital: number;
    monthlyBudget: number;
    dailyBudget: number;
    projectMonths: number;
    projectDays: number;
    currencyCode: string;
    currencySymbol: string;
  };
}

@Injectable()
export class CreateProjectGoalUseCase {
  constructor(
    @Inject(PROJECT_GOAL_REPOSITORY_TOKEN)
    private readonly projectGoalRepository: ProjectGoalRepositoryInterface,
    @Inject(GTD_PROJECT_DETAIL_REPOSITORY_TOKEN)
    private readonly gtdProjectDetailRepository: GtdProjectDetailRepositoryInterface,
    @Inject(GOAL_BUDGET_REPOSITORY_TOKEN)
    private readonly goalBudgetRepository: GoalBudgetRepositoryInterface,
    @Inject(CURRENCY_REPOSITORY_TOKEN)
    private readonly currencyRepository: CurrencyRepositoryInterface,
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: BudgetRepositoryInterface,
  ) {}

  async execute(
    request: CreateProjectGoalRequest,
  ): Promise<CreateProjectGoalResponse> {
    // 1. Validar que el project detail existe y pertenece al usuario
    const projectDetailId = GtdProjectDetailId.fromString(
      request.projectDetailId,
    );
    const projectDetail =
      await this.gtdProjectDetailRepository.findById(projectDetailId);

    if (!projectDetail) {
      throw new Error('Project detail not found');
    }

    // 2. Validar el tipo de goal
    const goalType = request.goalType as GoalType;
    if (!Object.values(GoalType).includes(goalType)) {
      throw new Error('Invalid goal type. Must be BE, DO, or HAVE');
    }

    // 3. Crear el goal
    const goal = ProjectGoal.create(projectDetailId, goalType, request.content);

    // 4. Guardar el goal
    const savedGoal = await this.projectGoalRepository.save(goal);

    // 5. Crear presupuesto del goal si se proporcionan los datos
    let goalBudget: GoalBudget | null = null;
    if (request.baseCapital !== undefined && request.currencyCode) {
      // Validar que la moneda existe
      const currency = await this.currencyRepository.findByCode(
        request.currencyCode,
      );
      if (!currency) {
        throw new Error(`Currency with code ${request.currencyCode} not found`);
      }

      // Validar que el capital base sea positivo
      if (request.baseCapital < 0) {
        throw new Error('Base capital cannot be negative');
      }

      // Crear el presupuesto del goal con cálculos automáticos
      // IMO = totalCapital / meses del proyecto
      // IDO = totalCapital / días del proyecto
      // Multiplier es constante: 1.3
      goalBudget = GoalBudget.create(
        savedGoal.id,
        currency.id,
        {
          baseCapital: request.baseCapital,
          projectStartDate: projectDetail.startDate,
          projectEndDate: projectDetail.endDate,
        },
        currency,
      );

      // Guardar el presupuesto del goal
      goalBudget = await this.goalBudgetRepository.save(goalBudget);

      // Actualizar el Budget del proyecto sumando todos los GoalBudgets
      await this.updateProjectBudget(
        projectDetail.projectId,
        currency.id,
        currency,
      );
    }

    // 6. Preparar la respuesta
    const response: CreateProjectGoalResponse = {
      goal: {
        id: savedGoal.id.getValue(),
        projectDetailId: savedGoal.detailId.getValue(),
        goalType: savedGoal.goalType,
        content: savedGoal.content,
        createdAt: savedGoal.createdAt,
        updatedAt: savedGoal.updatedAt,
      },
    };

    // Agregar información del presupuesto si fue creado
    if (goalBudget) {
      response.budget = {
        id: goalBudget.id.getValue(),
        baseCapital: goalBudget.baseCapital,
        multiplier: goalBudget.multiplier,
        totalCapital: goalBudget.totalCapital,
        monthlyBudget: goalBudget.monthlyBudget,
        dailyBudget: goalBudget.dailyBudget,
        projectMonths: goalBudget.projectMonths,
        projectDays: goalBudget.projectDays,
        currencyCode: goalBudget.currencyCode,
        currencySymbol: goalBudget.currencySymbol,
      };
    }

    return response;
  }

  /**
   * Actualiza el Budget del proyecto sumando todos los GoalBudgets asociados
   */
  private async updateProjectBudget(
    projectId: GtdProjectId,
    currencyId: CurrencyId,
    currency: Currency,
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
      // 4a. Actualizar el Budget existente
      existingBudget.updateBothTargets(totalMonthlyBudget, totalDailyBudget);
      await this.budgetRepository.update(existingBudget);
    } else {
      // 4b. Crear un nuevo Budget para el proyecto
      const newBudget = Budget.create(
        projectId,
        currencyId,
        totalMonthlyBudget,
        totalDailyBudget,
        currency,
      );
      await this.budgetRepository.save(newBudget);
    }
  }
}
