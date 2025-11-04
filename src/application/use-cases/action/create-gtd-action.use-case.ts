/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Inject } from '@nestjs/common';
import {
  GtdAction,
  EnergyLevel,
} from '../../../domain/entities/action/gtd-action.entity';
import { ActionBudget } from '../../../domain/entities/action-budget/action-budget.entity';
import { Budget } from '../../../domain/entities/budget/budget.entity';
import { ProjectGoalId } from '../../../domain/value-objects/goal/project-goal-id.value-object';
import { ContextId } from '../../../domain/value-objects/context/context-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import type { ActionBudgetRepositoryInterface } from '../../../domain/repositories/action-budget/action-budget.repository.interface';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { ContextRepositoryInterface } from '../../../domain/repositories/context/context.repository.interface';
import type { CurrencyRepositoryInterface } from '../../../domain/repositories/currency/currency.repository.interface';
import type { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import {
  GTD_ACTION_REPOSITORY_TOKEN,
  PROJECT_GOAL_REPOSITORY_TOKEN,
  CONTEXT_REPOSITORY_TOKEN,
} from '../../ports/goals-actions';
import { GTD_PROJECT_DETAIL_REPOSITORY_TOKEN } from '../../ports/projects';
import { ACTION_BUDGET_REPOSITORY_TOKEN } from '../../ports/action-budgets';
import {
  CURRENCY_REPOSITORY_TOKEN,
  BUDGET_REPOSITORY_TOKEN,
} from '../../ports/budget';

export interface CreateGtdActionRequest {
  userId: string;
  goalId: string;
  title: string;
  description?: string;
  energy: 'HIGH' | 'MEDIUM' | 'LOW';
  timeEstimate?: number;
  dueDate?: string;
  contextId?: string;
  baseCapital?: number;
  currencyCode?: string;
}

export interface CreateGtdActionResponse {
  action: {
    id: string;
    goalId: string;
    contextId?: string;
    contextName: string;
    title: string;
    description?: string;
    energy: EnergyLevel;
    timeEstimate?: number;
    dueDate?: Date;
    completed: boolean;
    completedAt?: Date;
    isOverdue: boolean;
    daysUntilDue?: number;
    createdAt: Date;
    updatedAt: Date;
  };
  budget?: {
    id: string;
    baseCapital: number;
    multiplier: number;
    totalCapital: number;
    monthlyBudget: number | null;
    dailyBudget: number | null;
    projectMonths: number;
    projectDays: number;
    currencyCode: string;
    currencySymbol: string;
  };
}

@Injectable()
export class CreateGtdActionUseCase {
  constructor(
    @Inject(GTD_ACTION_REPOSITORY_TOKEN)
    private readonly gtdActionRepository: GtdActionRepositoryInterface,
    @Inject(PROJECT_GOAL_REPOSITORY_TOKEN)
    private readonly projectGoalRepository: ProjectGoalRepositoryInterface,
    @Inject(CONTEXT_REPOSITORY_TOKEN)
    private readonly contextRepository: ContextRepositoryInterface,
    @Inject(GTD_PROJECT_DETAIL_REPOSITORY_TOKEN)
    private readonly projectDetailRepository: GtdProjectDetailRepositoryInterface,
    @Inject(ACTION_BUDGET_REPOSITORY_TOKEN)
    private readonly actionBudgetRepository: ActionBudgetRepositoryInterface,
    @Inject(CURRENCY_REPOSITORY_TOKEN)
    private readonly currencyRepository: CurrencyRepositoryInterface,
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: BudgetRepositoryInterface,
  ) {}

  async execute(
    request: CreateGtdActionRequest,
  ): Promise<CreateGtdActionResponse> {
    // 1. Validar que el goal existe y pertenece al usuario
    const goalId = ProjectGoalId.fromString(request.goalId);
    const goal = await this.projectGoalRepository.findById(goalId);

    if (!goal) {
      throw new Error('Project goal not found');
    }

    // 2. Validar el nivel de energía
    const energy = request.energy as EnergyLevel;
    if (!Object.values(EnergyLevel).includes(energy)) {
      throw new Error('Invalid energy level. Must be HIGH, MEDIUM, or LOW');
    }

    // 3. Validar y obtener el contexto si se proporciona
    let contextId: ContextId | undefined = undefined;
    let context: any = undefined;
    if (request.contextId) {
      contextId = ContextId.fromString(request.contextId);
      const foundContext = await this.contextRepository.findById(contextId);

      if (!foundContext) {
        throw new Error('Context not found');
      }

      // Verificar que el contexto pertenece al usuario
      const userId = UserId.fromString(request.userId);
      if (!foundContext.userId.equals(userId)) {
        throw new Error('Context does not belong to user');
      }

      context = foundContext;
    }

    // 4. Parsear la fecha de vencimiento si se proporciona
    let dueDate: Date | undefined = undefined;
    if (request.dueDate) {
      dueDate = new Date(request.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date format');
      }
    }

    // 5. Crear la acción
    const action = GtdAction.create(
      goalId,
      request.title,
      energy,
      contextId,
      context,
      request.description,
      request.timeEstimate,
      dueDate,
    );

    // 6. Guardar la acción
    const savedAction = await this.gtdActionRepository.save(action);

    // 7. Crear el presupuesto de la acción si se proporcionan baseCapital y currencyCode
    let actionBudget: ActionBudget | null = null;
    if (request.baseCapital !== undefined && request.currencyCode) {
      // 7.1. Validar que la moneda existe
      const currency = await this.currencyRepository.findByCode(
        request.currencyCode,
      );
      if (!currency) {
        throw new Error(`Currency with code ${request.currencyCode} not found`);
      }

      // 7.2. Obtener el detalle del proyecto para las fechas
      const projectDetail = await this.projectDetailRepository.findById(
        goal.detailId,
      );
      if (!projectDetail) {
        throw new Error('Project detail not found');
      }

      // 7.3. Crear el presupuesto de la acción con cálculos automáticos
      actionBudget = ActionBudget.create(
        savedAction.id,
        currency.id,
        {
          baseCapital: request.baseCapital,
          multiplier: 1.3, // Multiplicador por defecto
          projectStartDate: projectDetail.startDate,
          projectEndDate: projectDetail.endDate,
        },
        currency,
      );

      // 7.4. Guardar el presupuesto de la acción
      await this.actionBudgetRepository.save(actionBudget);

      // 7.5. Actualizar el Budget del proyecto sumando todos los ActionBudgets
      await this.updateProjectBudget(
        projectDetail.projectId,
        currency.id,
        currency,
      );
    }

    // 8. Actualizar el progreso del proyecto
    await this.updateProjectProgress(goal.detailId);

    // 9. Preparar la respuesta
    const response: CreateGtdActionResponse = {
      action: {
        id: savedAction.id.getValue(),
        goalId: savedAction.goalId.getValue(),
        contextId: savedAction.contextId?.getValue(),
        contextName: savedAction.contextName,
        title: savedAction.title,
        description: savedAction.description,
        energy: savedAction.energy,
        timeEstimate: savedAction.timeEstimate,
        dueDate: savedAction.dueDate,
        completed: savedAction.completed,
        completedAt: savedAction.completedAt,
        isOverdue: savedAction.isOverdue(),
        daysUntilDue: savedAction.getDaysUntilDue() ?? undefined,
        createdAt: savedAction.createdAt,
        updatedAt: savedAction.updatedAt,
      },
    };

    // Agregar información del presupuesto si se creó
    if (actionBudget) {
      response.budget = {
        id: actionBudget.id.getValue(),
        baseCapital: actionBudget.baseCapital,
        multiplier: actionBudget.multiplier,
        totalCapital: actionBudget.totalCapital,
        monthlyBudget: actionBudget.monthlyBudget,
        dailyBudget: actionBudget.dailyBudget,
        projectMonths: actionBudget.projectMonths,
        projectDays: actionBudget.projectDays,
        currencyCode: actionBudget.currencyCode,
        currencySymbol: actionBudget.currencySymbol,
      };
    }

    return response;
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
  private async updateProjectBudget(
    projectId: any,
    currencyId: any,
    currency: any,
  ): Promise<void> {
    // 1. Obtener todos los ActionBudgets del proyecto
    const actionBudgets = await this.actionBudgetRepository.findByProjectId(
      projectId.getValue(),
    );

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
      // 4a. Actualizar el Budget existente
      existingBudget.updateBothTargets(totalMonthlyBudget, totalDailyBudget);
      await this.budgetRepository.update(existingBudget);
    } else if (actionBudgets.length > 0) {
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
