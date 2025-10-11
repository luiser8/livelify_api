import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ContextId } from '../../../domain/value-objects/context/context-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { UserContextRepositoryInterface } from 'src/domain/repositories/user/user-context.repository.interface';
import { USER_CONTEXT_REPOSITORY } from 'src/application/ports/contexts';

export interface DeleteUserContextRequest {
  contextId: string;
  userId: string; // Usuario que solicita la eliminación
}

export interface DeleteUserContextResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class DeleteUserContextUseCase {
  constructor(
    @Inject(USER_CONTEXT_REPOSITORY)
    private readonly userContextRepository: UserContextRepositoryInterface,
  ) {}

  async execute(
    request: DeleteUserContextRequest,
  ): Promise<DeleteUserContextResponse> {
    // 1. Validate IDs
    const contextId = ContextId.fromString(request.contextId);
    const userId = new UserId(request.userId);

    // 2. Check if context exists
    const existingContext =
      await this.userContextRepository.findById(contextId);
    if (!existingContext) {
      throw new NotFoundException(
        `Context with ID ${request.contextId} not found`,
      );
    }

    // 3. Verify ownership - user can only delete their own contexts
    if (existingContext.userId.getValue() !== userId.getValue()) {
      throw new ForbiddenException('You can only delete your own contexts');
    }

    // 4. Check if context has associated actions
    const actionsCount =
      await this.userContextRepository.countActions(contextId);
    if (actionsCount > 0) {
      throw new BadRequestException(
        `Cannot delete context. It has ${actionsCount} action(s) associated. Please delete or reassign the actions first.`,
      );
    }

    // 5. Delete context
    await this.userContextRepository.delete(contextId);

    // 6. Return success response
    return {
      success: true,
      message: 'Context deleted successfully',
    };
  }
}
