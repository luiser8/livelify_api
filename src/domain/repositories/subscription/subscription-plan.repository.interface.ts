import { SubscriptionPlan } from 'src/domain/entities/subscription/subscription-plan.entity';

export interface SubscriptionPlanRepositoryInterface {
  findAll(): Promise<SubscriptionPlan[] | null>;
}
