import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ActionBudgetRepositoryInterface } from '../../../domain/repositories/action-budget/action-budget.repository.interface';
import { ActionBudget } from '../../../domain/entities/action-budget/action-budget.entity';
import { Currency } from '../../../domain/entities/currency/currency.entity';
import { ActionBudgetId } from '../../../domain/value-objects/action-budget/action-budget-id.value-object';
import { GtdActionId } from '../../../domain/value-objects/action/gtd-action-id.value-object';
import { CurrencyId } from '../../../domain/value-objects/currency/currency-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';

@Injectable()
export class ActionBudgetRepository implements ActionBudgetRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(actionBudget: ActionBudget): Promise<ActionBudget> {
    const data = {
      id: actionBudget.id.getValue(),
      actionId: actionBudget.actionId.getValue(),
      baseCapital: actionBudget.baseCapital,
      multiplier: actionBudget.multiplier,
      totalCapital: actionBudget.totalCapital,
      monthlyBudget: actionBudget.monthlyBudget,
      dailyBudget: actionBudget.dailyBudget,
      projectMonths: actionBudget.projectMonths,
      projectDays: actionBudget.projectDays,
      currencyId: actionBudget.currencyId.getValue(),
    };

    const created = await this.prisma.actionBudget.create({ data });

    return ActionBudget.reconstitute({
      id: ActionBudgetId.fromString(created.id),
      actionId: GtdActionId.fromString(created.actionId),
      baseCapital: created.baseCapital,
      multiplier: created.multiplier,
      totalCapital: created.totalCapital,
      monthlyBudget: created.monthlyBudget,
      dailyBudget: created.dailyBudget,
      projectMonths: created.projectMonths,
      projectDays: created.projectDays,
      currencyId: CurrencyId.fromString(created.currencyId),
      currency: actionBudget.currency,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async findById(id: ActionBudgetId): Promise<ActionBudget | null> {
    const actionBudget = await this.prisma.actionBudget.findUnique({
      where: { id: id.getValue() },
      include: { currency: true },
    });

    if (!actionBudget) {
      return null;
    }

    const currency = Currency.reconstitute({
      id: CurrencyId.fromString(actionBudget.currency.id),
      code: actionBudget.currency.code,
      name: actionBudget.currency.name,
      symbol: actionBudget.currency.symbol,
    });

    return ActionBudget.reconstitute({
      id: ActionBudgetId.fromString(actionBudget.id),
      actionId: GtdActionId.fromString(actionBudget.actionId),
      baseCapital: actionBudget.baseCapital,
      multiplier: actionBudget.multiplier,
      totalCapital: actionBudget.totalCapital,
      monthlyBudget: actionBudget.monthlyBudget,
      dailyBudget: actionBudget.dailyBudget,
      projectMonths: actionBudget.projectMonths,
      projectDays: actionBudget.projectDays,
      currencyId: CurrencyId.fromString(actionBudget.currencyId),
      currency,
      createdAt: actionBudget.createdAt,
      updatedAt: actionBudget.updatedAt,
    });
  }

  async findByActionId(actionId: GtdActionId): Promise<ActionBudget | null> {
    const actionBudget = await this.prisma.actionBudget.findUnique({
      where: { actionId: actionId.getValue() },
      include: { currency: true },
    });

    if (!actionBudget) {
      return null;
    }

    const currency = Currency.reconstitute({
      id: CurrencyId.fromString(actionBudget.currency.id),
      code: actionBudget.currency.code,
      name: actionBudget.currency.name,
      symbol: actionBudget.currency.symbol,
    });

    return ActionBudget.reconstitute({
      id: ActionBudgetId.fromString(actionBudget.id),
      actionId: GtdActionId.fromString(actionBudget.actionId),
      baseCapital: actionBudget.baseCapital,
      multiplier: actionBudget.multiplier,
      totalCapital: actionBudget.totalCapital,
      monthlyBudget: actionBudget.monthlyBudget,
      dailyBudget: actionBudget.dailyBudget,
      projectMonths: actionBudget.projectMonths,
      projectDays: actionBudget.projectDays,
      currencyId: CurrencyId.fromString(actionBudget.currencyId),
      currency,
      createdAt: actionBudget.createdAt,
      updatedAt: actionBudget.updatedAt,
    });
  }

  async findByUserId(userId: UserId): Promise<ActionBudget[]> {
    const actionBudgets = await this.prisma.actionBudget.findMany({
      where: {
        action: {
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
      },
      include: {
        currency: true,
        action: {
          include: {
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
        },
      },
    });

    return actionBudgets.map((ab) => {
      const currency = Currency.reconstitute({
        id: CurrencyId.fromString(ab.currency.id),
        code: ab.currency.code,
        name: ab.currency.name,
        symbol: ab.currency.symbol,
      });

      return ActionBudget.reconstitute({
        id: ActionBudgetId.fromString(ab.id),
        actionId: GtdActionId.fromString(ab.actionId),
        baseCapital: ab.baseCapital,
        multiplier: ab.multiplier,
        totalCapital: ab.totalCapital,
        monthlyBudget: ab.monthlyBudget,
        dailyBudget: ab.dailyBudget,
        projectMonths: ab.projectMonths,
        projectDays: ab.projectDays,
        currencyId: CurrencyId.fromString(ab.currencyId),
        currency,
        createdAt: ab.createdAt,
        updatedAt: ab.updatedAt,
      });
    });
  }

  async findByProjectId(projectId: string): Promise<ActionBudget[]> {
    const actionBudgets = await this.prisma.actionBudget.findMany({
      where: {
        action: {
          goal: {
            detail: {
              projectId: projectId,
            },
          },
        },
      },
      include: {
        currency: true,
      },
    });

    return actionBudgets.map((ab) => {
      const currency = Currency.reconstitute({
        id: CurrencyId.fromString(ab.currency.id),
        code: ab.currency.code,
        name: ab.currency.name,
        symbol: ab.currency.symbol,
      });

      return ActionBudget.reconstitute({
        id: ActionBudgetId.fromString(ab.id),
        actionId: GtdActionId.fromString(ab.actionId),
        baseCapital: ab.baseCapital,
        multiplier: ab.multiplier,
        totalCapital: ab.totalCapital,
        monthlyBudget: ab.monthlyBudget,
        dailyBudget: ab.dailyBudget,
        projectMonths: ab.projectMonths,
        projectDays: ab.projectDays,
        currencyId: CurrencyId.fromString(ab.currencyId),
        currency,
        createdAt: ab.createdAt,
        updatedAt: ab.updatedAt,
      });
    });
  }

  async update(actionBudget: ActionBudget): Promise<ActionBudget> {
    const data = {
      baseCapital: actionBudget.baseCapital,
      multiplier: actionBudget.multiplier,
      totalCapital: actionBudget.totalCapital,
      monthlyBudget: actionBudget.monthlyBudget,
      dailyBudget: actionBudget.dailyBudget,
      projectMonths: actionBudget.projectMonths,
      projectDays: actionBudget.projectDays,
      updatedAt: new Date(),
    };

    const updated = await this.prisma.actionBudget.update({
      where: { id: actionBudget.id.getValue() },
      data,
      include: { currency: true },
    });

    const currency = Currency.reconstitute({
      id: CurrencyId.fromString(updated.currency.id),
      code: updated.currency.code,
      name: updated.currency.name,
      symbol: updated.currency.symbol,
    });

    return ActionBudget.reconstitute({
      id: ActionBudgetId.fromString(updated.id),
      actionId: GtdActionId.fromString(updated.actionId),
      baseCapital: updated.baseCapital,
      multiplier: updated.multiplier,
      totalCapital: updated.totalCapital,
      monthlyBudget: updated.monthlyBudget,
      dailyBudget: updated.dailyBudget,
      projectMonths: updated.projectMonths,
      projectDays: updated.projectDays,
      currencyId: CurrencyId.fromString(updated.currencyId),
      currency,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: ActionBudgetId): Promise<void> {
    await this.prisma.actionBudget.delete({
      where: { id: id.getValue() },
    });
  }
}
