import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import { Budget } from '../../../domain/entities/budget/budget.entity';
import { Currency } from '../../../domain/entities/currency/currency.entity';
import { BudgetId } from '../../../domain/value-objects/budget/budget-id.value-object';
import { GtdProjectId } from '../../../domain/value-objects/project/gtd-project-id.value-object';
import { CurrencyId } from '../../../domain/value-objects/currency/currency-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';

@Injectable()
export class BudgetRepository implements BudgetRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(budget: Budget): Promise<Budget> {
    const data = {
      id: budget.id.getValue(),
      projectId: budget.projectId.getValue(),
      monthlyIncomeTarget: budget.monthlyIncomeTarget,
      dailyIncomeTarget: budget.dailyIncomeTarget,
      currencyId: budget.currencyId.getValue(),
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };

    const savedBudget = await this.prisma.budget.create({
      data,
      include: {
        currency: true,
      },
    });

    return this.toDomainEntity(savedBudget);
  }

  async findById(id: BudgetId): Promise<Budget | null> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: id.getValue() },
      include: {
        currency: true,
      },
    });

    return budget ? this.toDomainEntity(budget) : null;
  }

  async findByProjectId(projectId: GtdProjectId): Promise<Budget | null> {
    const budget = await this.prisma.budget.findUnique({
      where: { projectId: projectId.getValue() },
      include: {
        currency: true,
      },
    });

    return budget ? this.toDomainEntity(budget) : null;
  }

  async findByUserId(userId: UserId): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: {
        project: {
          lifeWheelArea: {
            lifeWheel: {
              userId: userId.getValue(),
            },
          },
        },
      },
      include: {
        currency: true,
        project: {
          include: {
            lifeWheelArea: {
              include: {
                area: true,
              },
            },
          },
        },
      },
    });

    return budgets.map((budget) => this.toDomainEntity(budget));
  }

  async update(budget: Budget): Promise<Budget> {
    const data = {
      monthlyIncomeTarget: budget.monthlyIncomeTarget,
      dailyIncomeTarget: budget.dailyIncomeTarget,
      currencyId: budget.currencyId.getValue(),
      updatedAt: budget.updatedAt,
    };

    const updatedBudget = await this.prisma.budget.update({
      where: { id: budget.id.getValue() },
      data,
      include: {
        currency: true,
      },
    });

    return this.toDomainEntity(updatedBudget);
  }

  async delete(id: BudgetId): Promise<void> {
    await this.prisma.budget.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomainEntity(value: any): Budget {
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

    return Budget.reconstitute({
      id: BudgetId.fromString(value.id),
      projectId: GtdProjectId.fromString(value.projectId),
      monthlyIncomeTarget: value.monthlyIncomeTarget,
      dailyIncomeTarget: value.dailyIncomeTarget,
      currencyId: CurrencyId.fromString(value.currencyId),
      currency: currency,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
