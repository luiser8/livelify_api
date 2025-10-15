/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionPlanRepositoryInterface } from 'src/domain/repositories/subscription/subscription-plan.repository.interface';
import { SubscriptionPlan } from 'src/domain/entities/subscription/subscription-plan.entity';
import { SubscriptionPlanId } from 'src/domain/value-objects/subscription/subscription-plan-id.value-object';
import { PlanType } from '@prisma/client';

@Injectable()
export class SubscriptionPlanRepository
  implements SubscriptionPlanRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SubscriptionPlan[]> {
    const subscriptions = await this.prisma.subscriptionPlan.findMany();

    return subscriptions.map((s) =>
      this.toDomainEntity({
        ...s,
        features:
          typeof s.features === 'object' && s.features !== null
            ? (s.features as Record<string, any>)
            : {},
      }),
    );
  }

  private toDomainEntity(value: {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    pricePerMonth: number;
    savings: number | null;
    discount: number | null;
    billingCycle: number;
    bestFor: string;
    features: Record<string, any> | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): SubscriptionPlan {
    return SubscriptionPlan.reconstitute({
      id: SubscriptionPlanId.fromString(value.id),
      name: value.name as PlanType,
      description: value.description ?? '',
      basePrice: value.basePrice,
      pricePerMonth: value.pricePerMonth,
      savings: value.savings ?? undefined,
      discount: value.discount ?? undefined,
      billingCycle: value.billingCycle,
      bestFor: value.bestFor,
      features: value.features ?? {},
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
