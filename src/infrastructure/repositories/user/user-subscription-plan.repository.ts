import { Injectable } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { PrismaService } from '../../database/prisma.service';
import { UserSubscriptionPlanRepositoryInterface } from 'src/domain/repositories/user/user-subscription-plan.repository.interface';
import { UserSubscription } from 'src/domain/entities/user/user-subscription-plan.entity';
import { SubscriptionPlanId } from 'src/domain/value-objects/subscription/subscription-plan-id.value-object';
import { UserSubscriptionId } from 'src/domain/value-objects/subscription/user-subscription-id.value-object';

@Injectable()
export class UserSubscriptionPlanRepository
  implements UserSubscriptionPlanRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}
  async save(subscription: UserSubscription): Promise<UserSubscription> {
    const subscriptionData = subscription.toPlainObject();

    const savedSubscription = await this.prisma.userSubscription.upsert({
      where: { id: subscriptionData.id },
      create: {
        id: subscriptionData.id,
        userId: subscriptionData.userId,
        planId: subscriptionData.planId,
        renewalDate: subscriptionData.renewalDate,
        active: subscriptionData.active,
        createdAt: subscriptionData.createdAt,
        updatedAt: subscriptionData.updatedAt,
      },
      update: {
        planId: subscriptionData.planId,
        userId: subscriptionData.userId,
        updatedAt: subscriptionData.updatedAt,
      },
    });

    return this.toDomainEntity(savedSubscription);
  }

  async findByUserId(userId: UserId): Promise<UserSubscription | null> {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId: userId.getValue() },
    });

    return subscription ? this.toDomainEntity(subscription) : null;
  }

  async updateSubscription(
    id: string,
    user: UserSubscription,
  ): Promise<UserSubscription> {
    const userData = user.toPlainObject();

    const existing = await this.prisma.userSubscription.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error(`No subscription found with id ${userData.id}`);
    }

    const updatedUser = await this.prisma.userSubscription.update({
      where: { id },
      data: {
        userId: userData.userId,
        renewalDate: userData.renewalDate,
        planId: user.planId.getValue(),
        updatedAt: new Date(),
      },
    });

    return this.toDomainEntity(updatedUser);
  }

  private toDomainEntity(prismaSubscription: {
    renewalDate: Date;
    id: string;
    userId: string;
    planId: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserSubscription {
    return UserSubscription.reconstitute({
      id: UserSubscriptionId.fromString(prismaSubscription.id),
      userId: UserId.fromString(prismaSubscription.userId),
      planId: SubscriptionPlanId.fromString(prismaSubscription.planId),
      createdAt: prismaSubscription.createdAt,
      updatedAt: prismaSubscription.updatedAt,
      renewalDate: prismaSubscription.renewalDate,
    });
  }
}
