import { Injectable, Inject } from '@nestjs/common';
import { Context } from '../../../domain/entities/context/context.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { ContextRepositoryInterface } from '../../../domain/repositories/context/context.repository.interface';
import { CONTEXT_REPOSITORY_TOKEN } from '../../ports/goals-actions';

export interface CreateUserContextRequest {
  userId: string;
  name: string;
}

export interface CreateUserContextResponse {
  context: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class CreateUserContextUseCase {
  constructor(
    @Inject(CONTEXT_REPOSITORY_TOKEN)
    private readonly contextRepository: ContextRepositoryInterface,
  ) {}

  async execute(
    request: CreateUserContextRequest,
  ): Promise<CreateUserContextResponse> {
    // 1. Validar que el contexto no existe ya para este usuario
    const userId = UserId.fromString(request.userId);
    const existingContext = await this.contextRepository.findByUserIdAndName(
      userId,
      request.name,
    );

    if (existingContext) {
      throw new Error('Context with this name already exists for user');
    }

    // 2. Crear el contexto
    const context = Context.create(userId, request.name);

    // 3. Guardar el contexto
    const savedContext = await this.contextRepository.save(context);

    // 4. Preparar la respuesta
    return {
      context: {
        id: savedContext.id.getValue(),
        name: savedContext.name,
        createdAt: savedContext.createdAt,
        updatedAt: savedContext.updatedAt,
      },
    };
  }
}
