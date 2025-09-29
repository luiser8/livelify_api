import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { USER_CONTEXT_REPOSITORY } from 'src/application/ports/contexts';
import type { UserContextRepositoryInterface } from 'src/domain/repositories/user/user-context.repository.interface';
import { GtdAction } from 'generated/prisma/wasm';

export interface GetContextByUserIdRequest {
  userId: string;
}

export interface GetContextByUserIdResponse {
  id: string;
  userId: UserId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  actions?: GtdAction[];
}

@Injectable()
export class GetContextByUserIdUseCase {
  constructor(
    @Inject(USER_CONTEXT_REPOSITORY)
    private readonly userContextRepository: UserContextRepositoryInterface,
  ) {}

  async execute(
    request: GetContextByUserIdRequest,
  ): Promise<GetContextByUserIdResponse[] | null> {
    // 1. Create value object
    const userId = UserId.fromString(request.userId);

    // 2. Find contexts
    const contexts = await this.userContextRepository.findByUserId(userId);

    // 3. Retornar directamente el array (vacío si no hay)
    return (contexts ?? []).map((c) => ({
      id: c.id.getValue(),
      userId: c.userId,
      name: c.name,
      //actions: c.actions.map((a) => a.toPlainObject()),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }
}
