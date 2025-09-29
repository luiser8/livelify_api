import { Injectable, Inject } from '@nestjs/common';
import { BudgetId } from '../../../domain/value-objects/budget/budget-id.value-object';
import type { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import type { CurrencyRepositoryInterface } from '../../../domain/repositories/currency/currency.repository.interface';
import {
  BUDGET_REPOSITORY_TOKEN,
  CURRENCY_REPOSITORY_TOKEN,
} from '../../ports/budget';

export interface UpdateBudgetRequest {
  userId: string;
  budgetId: string;
  currencyCode?: string;
  monthlyIncomeTarget?: number;
  dailyIncomeTarget?: number;
}

export interface UpdateBudgetResponse {
  budget: {
    id: string;
    projectId: string;
    monthlyIncomeTarget?: number;
    dailyIncomeTarget?: number;
    currencyCode: string;
    currencySymbol: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class UpdateBudgetUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: BudgetRepositoryInterface,
    @Inject(CURRENCY_REPOSITORY_TOKEN)
    private readonly currencyRepository: CurrencyRepositoryInterface,
  ) {}

  async execute(request: UpdateBudgetRequest): Promise<UpdateBudgetResponse> {
    // 1. Buscar el presupuesto
    const budgetId = BudgetId.fromString(request.budgetId);
    const budget = await this.budgetRepository.findById(budgetId);

    if (!budget) {
      throw new Error('Budget not found');
    }

    // 2. Si se especifica una nueva moneda, validarla
    if (request.currencyCode) {
      const currency = await this.currencyRepository.findByCode(
        request.currencyCode,
      );
      if (!currency) {
        throw new Error(`Currency with code ${request.currencyCode} not found`);
      }
    }

    // 3. Actualizar los targets según lo que se proporcione
    if (
      request.monthlyIncomeTarget !== undefined &&
      request.dailyIncomeTarget !== undefined
    ) {
      // Actualizar ambos targets
      budget.updateBothTargets(
        request.monthlyIncomeTarget,
        request.dailyIncomeTarget,
      );
    } else if (request.monthlyIncomeTarget !== undefined) {
      // Solo actualizar el target mensual
      budget.updateMonthlyIncomeTarget(request.monthlyIncomeTarget);
    } else if (request.dailyIncomeTarget !== undefined) {
      // Solo actualizar el target diario
      budget.updateDailyIncomeTarget(request.dailyIncomeTarget);
    }

    // 4. Guardar los cambios
    const updatedBudget = await this.budgetRepository.update(budget);

    // 5. Preparar la respuesta
    return {
      budget: {
        id: updatedBudget.id.getValue(),
        projectId: updatedBudget.projectId.getValue(),
        monthlyIncomeTarget: updatedBudget.monthlyIncomeTarget,
        dailyIncomeTarget: updatedBudget.dailyIncomeTarget,
        currencyCode: updatedBudget.currencyCode,
        currencySymbol: updatedBudget.currencySymbol,
        createdAt: updatedBudget.createdAt,
        updatedAt: updatedBudget.updatedAt,
      },
    };
  }
}
