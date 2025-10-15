import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { USER_SUBSCRIPTION_REPOSITORY } from '../../ports/subscriptions';
import type { UserSubscriptionPlanRepositoryInterface } from 'src/domain/repositories/user/user-subscription-plan.repository.interface';
import { UserSubscription } from 'src/domain/entities/user/user-subscription-plan.entity';
import type { UserRepositoryInterface } from 'src/domain/repositories/user/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from 'src/application/ports/tokens';
import { SubscriptionPlanId } from 'src/domain/value-objects/subscription/subscription-plan-id.value-object';
import { PaymentMethod, PaymentProvider } from '@prisma/client';

export interface UpdateUserWithSubscriptionRequest {
  id: string;
  userId: string;
  planId?: string;
  currencyId?: string;
  autoRenew?: boolean;
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  paymentProvider?: PaymentProvider;
}

export interface UpdateUserWithSubscriptionResponse {
  id: string;
  subscription: {
    plan: undefined;
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

    // 2. Get existing subscription to preserve fields not being updated
    const existingSubscription =
      await this.userSubscriptionRepository.findByUserId(userId);
    if (!existingSubscription) {
      throw new Error('User subscription not found');
    }

    // 3. Calculate new end date if plan is changing
    let endDate = existingSubscription.endDate;
    let renewalDate = existingSubscription.renewalDate;
    
    if (request.planId && request.planId !== existingSubscription.planId.getValue()) {
      // Recalculate dates when changing plan
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Default 1 month, should be based on new plan
      renewalDate = new Date(endDate);
      renewalDate.setDate(renewalDate.getDate() + 1);
    }

    // 4. Create updated subscription with new and preserved values
    const updatedSubscription = UserSubscription.reconstitute({
      id: existingSubscription.id,
      userId: existingUser.id,
      planId: request.planId 
        ? new SubscriptionPlanId(request.planId) 
        : existingSubscription.planId,
      currencyId: request.currencyId || existingSubscription.currencyId,
      endDate,
      renewalDate,
      amountPaid: request.amountPaid !== undefined 
        ? request.amountPaid 
        : existingSubscription.amountPaid,
      paymentMethod: request.paymentMethod || existingSubscription.paymentMethod,
      paymentProvider: request.paymentProvider || existingSubscription.paymentProvider,
      active: existingSubscription.active,
      autoRenew: request.autoRenew !== undefined 
        ? request.autoRenew 
        : existingSubscription.autoRenew,
      startDate: existingSubscription.startDate,
      createdAt: existingSubscription.createdAt,
    });

    // 5. Persist subscription
    const savedUserSubscription =
      await this.userSubscriptionRepository.updateSubscription(
        request.id,
        updatedSubscription,
      );

    // 6. Return response
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
        plan: undefined,
      },
      createdAt: savedUserSubscription.createdAt,
    };
  }
}
