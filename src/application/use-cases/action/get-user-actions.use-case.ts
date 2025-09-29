import { Injectable, Inject } from '@nestjs/common';
import { EnergyLevel } from '../../../domain/entities/action/gtd-action.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import { GTD_ACTION_REPOSITORY_TOKEN } from '../../ports/goals-actions';

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

    // 3. Mapear a la respuesta
    const actionResponses: ActionResponse[] = actions.map((action) => ({
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
    }));

    return {
      actions: actionResponses,
      totalActions: allActions.length,
      completedActions,
      pendingActions,
      overdueActions,
    };
  }
}
