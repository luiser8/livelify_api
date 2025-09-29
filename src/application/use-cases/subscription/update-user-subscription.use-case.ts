import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { USER_SUBSCRIPTION_REPOSITORY } from '../../ports/subscriptions';
import type { UserSubscriptionPlanRepositoryInterface } from 'src/domain/repositories/user/user-subscription-plan.repository.interface';
import { UserSubscription } from 'src/domain/entities/user/user-subscription-plan.entity';
import type { UserRepositoryInterface } from 'src/domain/repositories/user/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from 'src/application/ports/tokens';
import { SubscriptionPlanId } from 'src/domain/value-objects/subscription/subscription-plan-id.value-object';

export interface UpdateUserWithSubscriptionRequest {
  id: string;
  userId: string;
  planId: string;
}

export interface UpdateUserWithSubscriptionResponse {
  id: string;
  subscription: {
    id: string;
    planId: string;
    status: string;
    startedAt: Date;
    expiresAt: Date;
  };
  createdAt: Date;
}

@Injectable()
export class UpdateUserSubscriptionUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_SUBSCRIPTION_REPOSITORY)
    private readonly userSubscriptionRepository: UserSubscriptionPlanRepositoryInterface,
  ) {}

  async execute(
    request: UpdateUserWithSubscriptionRequest,
  ): Promise<UpdateUserWithSubscriptionResponse> {
    // 1. Validate business rules
    const userId = new UserId(request.userId);

    // Check if user already exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User with this Id does not exist');
    }

    // 2. Create user profile
    const subscription = UserSubscription.create({
      userId: existingUser.id,
      planId: new SubscriptionPlanId(request.planId),
    });

    // 3. Persist subscription
    const savedUserSubscription =
      await this.userSubscriptionRepository.updateSubscription(
        request.id,
        subscription,
      );

    // 4. Return response
    return {
      id: savedUserSubscription.id.getValue(),
      subscription: {
        id: savedUserSubscription.id.getValue(),
        planId: savedUserSubscription.planId.getValue(),
        status: savedUserSubscription.active ? 'active' : 'inactive',
        startedAt: savedUserSubscription.startDate,
        expiresAt: savedUserSubscription.renewalDate,
      },
      createdAt: savedUserSubscription.createdAt,
    };
  }
}
