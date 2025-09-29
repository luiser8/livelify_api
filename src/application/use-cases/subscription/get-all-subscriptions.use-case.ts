import { Injectable, Inject } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY } from 'src/application/ports/subscriptions';
import { SubscriptionPlan } from 'src/domain/entities/subscription/subscription-plan.entity';
import type { SubscriptionPlanRepositoryInterface } from 'src/domain/repositories/subscription/subscription-plan.repository.interface';

@Injectable()
export class GetAllSubscriptionsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionPlanRepositoryInterface,
  ) {}

  async execute(): Promise<SubscriptionPlan[]> {
    const subscriptions = await this.subscriptionRepository.findAll();
    if (!subscriptions) {
      throw new Error('Subscriptions not found');
    }

    return subscriptions;
  }
}
