import { Injectable, Inject } from '@nestjs/common';
import {
  GtdAction,
  EnergyLevel,
} from '../../../domain/entities/action/gtd-action.entity';
import { ProjectGoalId } from '../../../domain/value-objects/goal/project-goal-id.value-object';
import { ContextId } from '../../../domain/value-objects/context/context-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { ContextRepositoryInterface } from '../../../domain/repositories/context/context.repository.interface';
import {
  GTD_ACTION_REPOSITORY_TOKEN,
  PROJECT_GOAL_REPOSITORY_TOKEN,
  CONTEXT_REPOSITORY_TOKEN,
} from '../../ports/goals-actions';

export interface CreateGtdActionRequest {
  userId: string;
  goalId: string;
  title: string;
  description?: string;
  energy: 'HIGH' | 'MEDIUM' | 'LOW';
  timeEstimate?: number;
  dueDate?: string;
  contextId?: string;
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

    // 7. Preparar la respuesta
    return {
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
  }
}
