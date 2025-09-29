import { Injectable, Inject } from '@nestjs/common';
import { Budget } from '../../../domain/entities/budget/budget.entity';
import { GtdProjectId } from '../../../domain/value-objects/project/gtd-project-id.value-object';
import type { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import type { CurrencyRepositoryInterface } from '../../../domain/repositories/currency/currency.repository.interface';
import type { GtdProjectRepositoryInterface } from '../../../domain/repositories/project/gtd-project.repository.interface';
import {
  BUDGET_REPOSITORY_TOKEN,
  CURRENCY_REPOSITORY_TOKEN,
} from '../../ports/budget';
import { GTD_PROJECT_REPOSITORY_TOKEN } from '../../ports/projects';

export interface CreateBudgetForProjectRequest {
  userId: string;
  projectId: string;
  currencyCode: string;
  monthlyIncomeTarget?: number;
  dailyIncomeTarget?: number;
}

export interface CreateBudgetForProjectResponse {
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
export class CreateBudgetForProjectUseCase {
  constructor(
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: BudgetRepositoryInterface,
    @Inject(CURRENCY_REPOSITORY_TOKEN)
    private readonly currencyRepository: CurrencyRepositoryInterface,
    @Inject(GTD_PROJECT_REPOSITORY_TOKEN)
    private readonly gtdProjectRepository: GtdProjectRepositoryInterface,
  ) {}

  async execute(
    request: CreateBudgetForProjectRequest,
  ): Promise<CreateBudgetForProjectResponse> {
    // 1. Validar que el proyecto existe y pertenece al usuario
    const projectId = GtdProjectId.fromString(request.projectId);
    const project = await this.gtdProjectRepository.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // 2. Verificar que el proyecto no tenga ya un presupuesto
    const existingBudget =
      await this.budgetRepository.findByProjectId(projectId);
    if (existingBudget) {
      throw new Error('Project already has a budget');
    }

    // 3. Validar que la moneda existe
    const currency = await this.currencyRepository.findByCode(
      request.currencyCode,
    );
    if (!currency) {
      throw new Error(`Currency with code ${request.currencyCode} not found`);
    }

    // 4. Validar los targets de ingresos
    if (
      request.monthlyIncomeTarget !== undefined &&
      request.monthlyIncomeTarget < 0
    ) {
      throw new Error('Monthly income target cannot be negative');
    }
    if (
      request.dailyIncomeTarget !== undefined &&
      request.dailyIncomeTarget < 0
    ) {
      throw new Error('Daily income target cannot be negative');
    }

    // 5. Crear el presupuesto
    const budget = Budget.create(
      projectId,
      currency.id,
      request.monthlyIncomeTarget,
      request.dailyIncomeTarget,
      currency,
    );

    // 6. Guardar el presupuesto
    const savedBudget = await this.budgetRepository.save(budget);

    // 7. Preparar la respuesta
    return {
      budget: {
        id: savedBudget.id.getValue(),
        projectId: savedBudget.projectId.getValue(),
        monthlyIncomeTarget: savedBudget.monthlyIncomeTarget,
        dailyIncomeTarget: savedBudget.dailyIncomeTarget,
        currencyCode: savedBudget.currencyCode,
        currencySymbol: savedBudget.currencySymbol,
        createdAt: savedBudget.createdAt,
        updatedAt: savedBudget.updatedAt,
      },
    };
  }
}
