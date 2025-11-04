import { Injectable, Inject } from '@nestjs/common';
import { EnergyLevel } from '../../../domain/entities/action/gtd-action.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { GtdActionId } from '../../../domain/value-objects/action/gtd-action-id.value-object';
import type { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import type { ActionBudgetRepositoryInterface } from '../../../domain/repositories/action-budget/action-budget.repository.interface';
import { GTD_ACTION_REPOSITORY_TOKEN } from '../../ports/goals-actions';
import { ACTION_BUDGET_REPOSITORY_TOKEN } from '../../ports/action-budgets';

export interface GetUserActionsRequest {
  userId: string;
  filter?: 'all' | 'pending' | 'completed' | 'overdue';
}

export interface ActionResponse {
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

export interface GetUserActionsResponse {
  actions: ActionResponse[];
  totalActions: number;
  completedActions: number;
  pendingActions: number;
  overdueActions: number;
}

@Injectable()
export class GetUserActionsUseCase {
  constructor(
    @Inject(GTD_ACTION_REPOSITORY_TOKEN)
    private readonly gtdActionRepository: GtdActionRepositoryInterface,
    @Inject(ACTION_BUDGET_REPOSITORY_TOKEN)
    private readonly actionBudgetRepository: ActionBudgetRepositoryInterface,
  ) {}

  async execute(
    request: GetUserActionsRequest,
  ): Promise<GetUserActionsResponse> {
    const userId = UserId.fromString(request.userId);

    // 1. Obtener acciones según el filtro
    let actions;
    switch (request.filter) {
      case 'pending':
        actions = await this.gtdActionRepository.findPendingByUserId(userId);
        break;
      case 'overdue':
        actions = await this.gtdActionRepository.findOverdueByUserId(userId);
        break;
      default:
        actions = await this.gtdActionRepository.findByUserId(userId);
        break;
    }

    // 2. Obtener estadísticas
    const allActions = await this.gtdActionRepository.findByUserId(userId);
    const completedActions = allActions.filter(
      (action) => action.completed,
    ).length;
    const pendingActions = allActions.filter(
      (action) => !action.completed,
    ).length;
    const overdueActions = allActions.filter(
      (action) => !action.completed && action.isOverdue(),
    ).length;

    // 3. Mapear a la respuesta con budgets
    const actionResponses: ActionResponse[] = await Promise.all(
      actions.map(async (action) => {
        // Buscar el budget de la acción
        const actionId = GtdActionId.fromString(action.id.getValue());
        const actionBudget =
          await this.actionBudgetRepository.findByActionId(actionId);

        const response: ActionResponse = {
          id: action.id.getValue(),
          goalId: action.goalId.getValue(),
          contextId: action.contextId?.getValue(),
          contextName: action.contextName,
          title: action.title,
          description: action.description,
          energy: action.energy,
          timeEstimate: action.timeEstimate,
          dueDate: action.dueDate,
          completed: action.completed,
          completedAt: action.completedAt,
          isOverdue: action.isOverdue(),
          daysUntilDue: action.getDaysUntilDue() ?? undefined,
          createdAt: action.createdAt,
          updatedAt: action.updatedAt,
        };

        // Agregar budget si existe
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
      }),
    );

    return {
      actions: actionResponses,
      totalActions: allActions.length,
      completedActions,
      pendingActions,
      overdueActions,
    };
  }
}
