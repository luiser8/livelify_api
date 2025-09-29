import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { ContextRepositoryInterface } from '../../../domain/repositories/context/context.repository.interface';
import { CONTEXT_REPOSITORY_TOKEN } from '../../ports/goals-actions';

export interface GetUserContextsRequest {
  userId: string;
}

export interface ContextResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUserContextsResponse {
  contexts: ContextResponse[];
  totalContexts: number;
}

@Injectable()
export class GetUserContextsUseCase {
  constructor(
    @Inject(CONTEXT_REPOSITORY_TOKEN)
    private readonly contextRepository: ContextRepositoryInterface,
  ) {}

  async execute(
    request: GetUserContextsRequest,
  ): Promise<GetUserContextsResponse> {
    // 1. Obtener todos los contextos del usuario
    const userId = UserId.fromString(request.userId);
    const contexts = await this.contextRepository.findByUserId(userId);

    // 2. Mapear a la respuesta
    const contextResponses: ContextResponse[] = contexts.map((context) => ({
      id: context.id.getValue(),
      name: context.name,
      createdAt: context.createdAt,
      updatedAt: context.updatedAt,
    }));

    return {
      contexts: contextResponses,
      totalContexts: contexts.length,
    };
  }
}
