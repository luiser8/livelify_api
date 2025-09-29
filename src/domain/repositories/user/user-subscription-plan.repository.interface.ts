import { UserSubscription } from '../../entities/user/user-subscription-plan.entity';
import { UserId } from '../../value-objects/user';

export interface UserSubscriptionPlanRepositoryInterface {
  save(subscription: UserSubscription): Promise<UserSubscription>;
  findByUserId(userId: UserId): Promise<UserSubscription | null>;
  updateSubscription(
    id: string,
    user: UserSubscription,
  ): Promise<UserSubscription>;
}
