import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { USER_REPOSITORY_TOKEN } from '../../ports/tokens';
import type { UserRepositoryInterface } from 'src/domain/repositories/user/user.repository.interface';
import { UserSubscriptionResponseDto } from 'src/presentation/dtos/subscription/user-subscription.dto';

export interface GetSubscriptionByUserIdRequest {
  userId: string;
}

@Injectable()
export class GetSubscriptionByUserIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(
    request: GetSubscriptionByUserIdRequest,
  ): Promise<UserSubscriptionResponseDto> {
    // 1. Create value object
    const userId = UserId.fromString(request.userId);

    // 2. Find user
    const user = await this.userRepository.findSubscriptionById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 3. Return response
    return user;
  }
}
