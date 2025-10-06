import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoalBudgetRepositoryInterface } from '../../../domain/repositories/goal-budget/goal-budget.repository.interface';
import { GoalBudget } from '../../../domain/entities/goal-budget/goal-budget.entity';
import { Currency } from '../../../domain/entities/currency/currency.entity';
import { GoalBudgetId } from '../../../domain/value-objects/goal-budget/goal-budget-id.value-object';
import { ProjectGoalId } from '../../../domain/value-objects/goal/project-goal-id.value-object';
import { CurrencyId } from '../../../domain/value-objects/currency/currency-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';

@Injectable()
export class GoalBudgetRepository implements GoalBudgetRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(goalBudget: GoalBudget): Promise<GoalBudget> {
    const data = {
      id: goalBudget.id.getValue(),
      goalId: goalBudget.goalId.getValue(),
      baseCapital: goalBudget.baseCapital,
      multiplier: goalBudget.multiplier,
      totalCapital: goalBudget.totalCapital,
      monthlyBudget: goalBudget.monthlyBudget,
      dailyBudget: goalBudget.dailyBudget,
      projectMonths: goalBudget.projectMonths,
      projectDays: goalBudget.projectDays,
      currencyId: goalBudget.currencyId.getValue(),
      createdAt: goalBudget.createdAt,
      updatedAt: goalBudget.updatedAt,
    };

    const savedGoalBudget = await this.prisma.goalBudget.create({
      data,
      include: {
        currency: true,
      },
    });

    return this.toDomainEntity(savedGoalBudget);
  }

  async findById(id: GoalBudgetId): Promise<GoalBudget | null> {
    const goalBudget = await this.prisma.goalBudget.findUnique({
      where: { id: id.getValue() },
      include: {
        currency: true,
      },
    });

    return goalBudget ? this.toDomainEntity(goalBudget) : null;
  }

  async findByGoalId(goalId: ProjectGoalId): Promise<GoalBudget | null> {
    const goalBudget = await this.prisma.goalBudget.findUnique({
      where: { goalId: goalId.getValue() },
      include: {
        currency: true,
      },
    });

    return goalBudget ? this.toDomainEntity(goalBudget) : null;
  }

  async findByUserId(userId: UserId): Promise<GoalBudget[]> {
    const goalBudgets = await this.prisma.goalBudget.findMany({
      where: {
        goal: {
          detail: {
            project: {
              lifeWheelArea: {
                lifeWheel: {
                  userId: userId.getValue(),
                },
              },
            },
          },
        },
      },
      include: {
        currency: true,
        goal: {
          include: {
            detail: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    return goalBudgets.map((goalBudget) => this.toDomainEntity(goalBudget));
  }

  async findByProjectId(projectId: string): Promise<GoalBudget[]> {
    const goalBudgets = await this.prisma.goalBudget.findMany({
      where: {
        goal: {
          detail: {
            projectId: projectId,
          },
        },
      },
      include: {
        currency: true,
        goal: {
          include: {
            detail: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    return goalBudgets.map((goalBudget) => this.toDomainEntity(goalBudget));
  }

  async update(goalBudget: GoalBudget): Promise<GoalBudget> {
    const data = {
      baseCapital: goalBudget.baseCapital,
      multiplier: goalBudget.multiplier,
      totalCapital: goalBudget.totalCapital,
      monthlyBudget: goalBudget.monthlyBudget,
      dailyBudget: goalBudget.dailyBudget,
      projectMonths: goalBudget.projectMonths,
      projectDays: goalBudget.projectDays,
      currencyId: goalBudget.currencyId.getValue(),
      updatedAt: goalBudget.updatedAt,
    };

    const updatedGoalBudget = await this.prisma.goalBudget.update({
      where: { id: goalBudget.id.getValue() },
      data,
      include: {
        currency: true,
      },
    });

    return this.toDomainEntity(updatedGoalBudget);
  }

  async delete(id: GoalBudgetId): Promise<void> {
    await this.prisma.goalBudget.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomainEntity(value: any): GoalBudget {
    let currency: Currency | undefined = undefined;
    if (value.currency) {
      currency = Currency.reconstitute({
        id: CurrencyId.fromString(value.currency.id),
        code: value.currency.code,
        name: value.currency.name,
        symbol: value.currency.symbol,
        createdAt: value.currency.createdAt,
        updatedAt: value.currency.updatedAt,
      });
    }

    return GoalBudget.reconstitute({
      id: GoalBudgetId.fromString(value.id),
      goalId: ProjectGoalId.fromString(value.goalId),
      baseCapital: value.baseCapital,
      multiplier: value.multiplier,
      totalCapital: value.totalCapital,
      monthlyBudget: value.monthlyBudget,
      dailyBudget: value.dailyBudget,
      projectMonths: value.projectMonths,
      projectDays: value.projectDays,
      currencyId: CurrencyId.fromString(value.currencyId),
      currency: currency,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
