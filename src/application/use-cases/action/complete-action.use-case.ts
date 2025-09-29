import { Injectable, Inject } from '@nestjs/common';
import { GtdActionId } from '../../../domain/value-objects/action/gtd-action-id.value-object';
import type { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import { GTD_ACTION_REPOSITORY_TOKEN } from '../../ports/goals-actions';

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

    // 4. Preparar la respuesta
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
}
