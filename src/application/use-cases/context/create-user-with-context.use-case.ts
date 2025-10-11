import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { UserRepositoryInterface } from 'src/domain/repositories/user/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from 'src/application/ports/tokens';
import { Context } from 'src/domain/entities/user/context.entity';
import { USER_CONTEXT_REPOSITORY } from 'src/application/ports/contexts';
import type { UserContextRepositoryInterface } from 'src/domain/repositories/user/user-context.repository.interface';

export interface CreateUserWithContextRequest {
  userId: string;
  name: string;
}

export interface CreateUserWithContextResponse {
  id: string;
  userId: string;
  name: string;
  canDelete: boolean;
  actionsCount: number;
  createdAt: Date;
}

@Injectable()
export class CreateUserWithContextUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_CONTEXT_REPOSITORY)
    private readonly userContextRepository: UserContextRepositoryInterface,
  ) {}

  async execute(
    request: CreateUserWithContextRequest,
  ): Promise<CreateUserWithContextResponse> {
    // 1. Validate business rules
    const userId = new UserId(request.userId);

    // Check if user already exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User with this Id does not exist');
    }

    // 2. Create user profile
    const context = Context.create(existingUser.id, request.name);

    // 3. Persist context
    const savedUserContext = await this.userContextRepository.save(context);

    // 4. Return response (new context always has 0 actions and can be deleted)
    return {
      id: savedUserContext.id.getValue(),
      userId: savedUserContext.userId.getValue(),
      name: savedUserContext.name,
      canDelete: true, // New context has no actions
      actionsCount: 0, // New context has no actions
      createdAt: savedUserContext.createdAt,
    };
  }
}
