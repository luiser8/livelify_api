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
        currencyId: subscriptionData.currencyId,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
        renewalDate: subscriptionData.renewalDate ?? new Date(),
        active: subscriptionData.active,
        autoRenew: subscriptionData.autoRenew,
        amountPaid: subscriptionData.amountPaid,
        paymentMethod: subscriptionData.paymentMethod,
        paymentProvider: subscriptionData.paymentProvider,
        createdAt: subscriptionData.createdAt,
        updatedAt: subscriptionData.updatedAt,
      },
      update: {
        planId: subscriptionData.planId,
        currencyId: subscriptionData.currencyId,
        endDate: subscriptionData.endDate,
        renewalDate: subscriptionData.renewalDate ?? new Date(),
        autoRenew: subscriptionData.autoRenew,
        amountPaid: subscriptionData.amountPaid,
        paymentMethod: subscriptionData.paymentMethod,
        paymentProvider: subscriptionData.paymentProvider,
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
        planId: user.planId.getValue(),
        currencyId: userData.currencyId,
        endDate: userData.endDate,
        renewalDate: userData.renewalDate ?? new Date(),
        autoRenew: userData.autoRenew,
        amountPaid: userData.amountPaid,
        paymentMethod: userData.paymentMethod,
        paymentProvider: userData.paymentProvider,
        updatedAt: new Date(),
      },
    });

    return this.toDomainEntity(updatedUser);
  }

  private toDomainEntity(prismaSubscription: {
    id: string;
    userId: string;
    planId: string;
    currencyId: string;
    startDate: Date;
    endDate: Date;
    renewalDate: Date | null;
    active: boolean;
    autoRenew: boolean;
    amountPaid: number | null;
    paymentMethod: string | null;
    paymentProvider: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserSubscription {
    return UserSubscription.reconstitute({
      id: UserSubscriptionId.fromString(prismaSubscription.id),
      userId: UserId.fromString(prismaSubscription.userId),
      planId: SubscriptionPlanId.fromString(prismaSubscription.planId),
      currencyId: prismaSubscription.currencyId,
      startDate: prismaSubscription.startDate,
      endDate: prismaSubscription.endDate,
      renewalDate: prismaSubscription.renewalDate ?? undefined,
      active: prismaSubscription.active,
      autoRenew: prismaSubscription.autoRenew,
      amountPaid: prismaSubscription.amountPaid ?? undefined,
      paymentMethod: prismaSubscription.paymentMethod as any,
      paymentProvider: prismaSubscription.paymentProvider as any,
      createdAt: prismaSubscription.createdAt,
      updatedAt: prismaSubscription.updatedAt,
    });
  }
}
