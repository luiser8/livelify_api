import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { USER_SUBSCRIPTION_REPOSITORY } from '../../ports/subscriptions';
import type { UserSubscriptionPlanRepositoryInterface } from 'src/domain/repositories/user/user-subscription-plan.repository.interface';
import { UserSubscription } from 'src/domain/entities/user/user-subscription-plan.entity';
import type { UserRepositoryInterface } from 'src/domain/repositories/user/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from 'src/application/ports/tokens';
import { SubscriptionPlanId } from 'src/domain/value-objects/subscription/subscription-plan-id.value-object';
import { PaymentMethod, PaymentProvider } from '@prisma/client';

export interface CreateUserWithSubscriptionRequest {
  userId: string;
  planId: string;
  currencyId?: string;
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  paymentProvider?: PaymentProvider;
}

export interface CreateUserWithSubscriptionResponse {
  id: string;
  subscription: {
    id: string;
    planId: string;
    currencyId: string;
    status: string;
    startedAt: Date;
    expiresAt?: Date;
    endDate: Date;
    autoRenew: boolean;
    amountPaid?: number;
    paymentMethod?: PaymentMethod;
    paymentProvider?: PaymentProvider;
  };
  createdAt: Date;
}

@Injectable()
export class CreateUserSubscriptionUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_SUBSCRIPTION_REPOSITORY)
    private readonly userSubscriptionRepository: UserSubscriptionPlanRepositoryInterface,
  ) {}

  async execute(
    request: CreateUserWithSubscriptionRequest,
  ): Promise<CreateUserWithSubscriptionResponse> {
    // 1. Validate business rules
    const userId = new UserId(request.userId);

    // Check if user already exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User with this Id does not exist');
    }

    // 2. Calculate end date based on billing cycle (default to 1 month)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Default 1 month, should be based on plan

    const renewalDate = new Date(endDate);
    renewalDate.setDate(renewalDate.getDate() + 1); // Next day after end date

    // 3. Create subscription
    const subscription = UserSubscription.create({
      userId: existingUser.id,
      planId: new SubscriptionPlanId(request.planId),
      currencyId: request.currencyId || 'default-currency-id', // Should get default currency from config
      endDate,
      renewalDate,
      amountPaid: request.amountPaid,
      paymentMethod: request.paymentMethod,
      paymentProvider: request.paymentProvider,
    });

    // 4. Persist subscription
    const savedUserSubscription =
      await this.userSubscriptionRepository.save(subscription);

    // 5. Return response
    return {
      id: savedUserSubscription.id.getValue(),
      subscription: {
        id: savedUserSubscription.id.getValue(),
        planId: savedUserSubscription.planId.getValue(),
        currencyId: savedUserSubscription.currencyId,
        status: savedUserSubscription.active ? 'active' : 'inactive',
        startedAt: savedUserSubscription.startDate,
        expiresAt: savedUserSubscription.renewalDate,
        endDate: savedUserSubscription.endDate,
        autoRenew: savedUserSubscription.autoRenew,
        amountPaid: savedUserSubscription.amountPaid,
        paymentMethod: savedUserSubscription.paymentMethod,
        paymentProvider: savedUserSubscription.paymentProvider,
      },
      createdAt: savedUserSubscription.createdAt,
    };
  }
}
