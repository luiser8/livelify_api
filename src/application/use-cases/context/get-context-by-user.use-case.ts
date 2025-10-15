import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { USER_CONTEXT_REPOSITORY } from 'src/application/ports/contexts';
import type { UserContextRepositoryInterface } from 'src/domain/repositories/user/user-context.repository.interface';

export interface GetContextByUserIdRequest {
  userId: string;
}

export interface GetContextByUserIdResponse {
  id: string;
  userId: UserId;
  name: string;
  canDelete: boolean;
  actionsCount: number;
  createdAt: Date;
  updatedAt: Date;
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

    // 3. For each context, count actions and determine if can be deleted
    const contextsWithDeleteInfo = await Promise.all(
      (contexts ?? []).map(async (c) => {
        const actionsCount = await this.userContextRepository.countActions(c.id);
        return {
          id: c.id.getValue(),
          userId: c.userId,
          name: c.name,
          canDelete: actionsCount === 0,
          actionsCount,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        };
      }),
    );

    return contextsWithDeleteInfo;
  }
}
