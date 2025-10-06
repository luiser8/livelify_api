import { Injectable, Inject } from '@nestjs/common';
import { GtdProject } from '../../../domain/entities/project/gtd-project.entity';
import { GtdProjectDetail } from '../../../domain/entities/project/gtd-project-detail.entity';
import { Budget } from '../../../domain/entities/budget/budget.entity';
import { LifeWheelAreaId } from '../../../domain/value-objects/lifewheel/lifewheel-area-id.value-object';
import type { GtdProjectRepositoryInterface } from '../../../domain/repositories/project/gtd-project.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import type { LifeWheelAreaRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel-area.repository.interface';
import type { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import type { CurrencyRepositoryInterface } from '../../../domain/repositories/currency/currency.repository.interface';
import {
  GTD_PROJECT_REPOSITORY_TOKEN,
  GTD_PROJECT_DETAIL_REPOSITORY_TOKEN,
} from '../../ports/projects';
import { LIFEWHEEL_AREA_REPOSITORY_TOKEN } from '../../ports/lifewheel';
import {
  BUDGET_REPOSITORY_TOKEN,
  CURRENCY_REPOSITORY_TOKEN,
} from '../../ports/budget';

export interface CreateProjectFromLifeWheelAreaRequest {
  userId: string;
  lifeWheelAreaId: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface CreateProjectFromLifeWheelAreaResponse {
  project: {
    id: string;
    lifeWheelAreaId: string;
    title: string;
    description?: string;
    status: string;
    createdAt: Date;
  };
  detail: {
    id: string;
    projectId: string;
    lifeAreaId: string;
    status: string;
    startDate: Date;
    endDate: Date;
    completedActions: number;
    totalActions: number;
    progressPercentage: number;
    createdAt: Date;
  };
  budget: {
    id: string;
    monthlyIncomeTarget: number;
    dailyIncomeTarget: number;
    currencyCode: string;
    currencySymbol: string;
  };
}

@Injectable()
export class CreateProjectFromLifeWheelAreaUseCase {
  constructor(
    @Inject(GTD_PROJECT_REPOSITORY_TOKEN)
    private readonly gtdProjectRepository: GtdProjectRepositoryInterface,
    @Inject(GTD_PROJECT_DETAIL_REPOSITORY_TOKEN)
    private readonly gtdProjectDetailRepository: GtdProjectDetailRepositoryInterface,
    @Inject(LIFEWHEEL_AREA_REPOSITORY_TOKEN)
    private readonly lifeWheelAreaRepository: LifeWheelAreaRepositoryInterface,
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: BudgetRepositoryInterface,
    @Inject(CURRENCY_REPOSITORY_TOKEN)
    private readonly currencyRepository: CurrencyRepositoryInterface,
  ) {}

  async execute(
    request: CreateProjectFromLifeWheelAreaRequest,
  ): Promise<CreateProjectFromLifeWheelAreaResponse> {
    // 1. Validar que el LifeWheelArea existe y pertenece al usuario
    const lifeWheelAreaId = LifeWheelAreaId.fromString(request.lifeWheelAreaId);
    const lifeWheelArea =
      await this.lifeWheelAreaRepository.findById(lifeWheelAreaId);

    if (!lifeWheelArea) {
      throw new Error('LifeWheelArea not found');
    }

    // 2. Validar fechas
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    // 3. Crear el proyecto GTD
    const gtdProject = GtdProject.create(
      lifeWheelAreaId,
      request.title,
      request.description,
    );

    // 4. Guardar el proyecto
    const savedProject = await this.gtdProjectRepository.save(gtdProject);

    // 5. Crear el detalle del proyecto
    const gtdProjectDetail = GtdProjectDetail.create(
      savedProject.id,
      lifeWheelArea.areaId, // Usar el areaId del LifeWheelArea
      startDate,
      endDate,
    );

    // 6. Guardar el detalle del proyecto
    const savedProjectDetail =
      await this.gtdProjectDetailRepository.save(gtdProjectDetail);

    // 7. Crear Budget inicial con valores en 0
    // Buscar la moneda por defecto (USD)
    const defaultCurrency = await this.currencyRepository.findByCode('USD');
    if (!defaultCurrency) {
      throw new Error(
        'Default currency (USD) not found. Please seed currencies first.',
      );
    }

    // Crear budget con valores en 0 (se actualizará cuando se agreguen goals)
    const projectBudget = Budget.create(
      savedProject.id,
      defaultCurrency.id,
      0, // monthlyIncomeTarget inicial
      0, // dailyIncomeTarget inicial
      defaultCurrency,
    );

    // 8. Guardar el budget
    const savedBudget = await this.budgetRepository.save(projectBudget);

    // 9. Preparar la respuesta
    return {
      project: {
        id: savedProject.id.getValue(),
        lifeWheelAreaId: savedProject.lifeWheelAreaId.getValue(),
        title: savedProject.title,
        description: savedProject.description,
        status: savedProject.status,
        createdAt: savedProject.createdAt,
      },
      detail: {
        id: savedProjectDetail.id.getValue(),
        projectId: savedProjectDetail.projectId.getValue(),
        lifeAreaId: savedProjectDetail.lifeAreaId.getValue(),
        status: savedProjectDetail.status,
        startDate: savedProjectDetail.startDate,
        endDate: savedProjectDetail.endDate,
        completedActions: savedProjectDetail.completedActions,
        totalActions: savedProjectDetail.totalActions,
        progressPercentage: savedProjectDetail.progressPercentage,
        createdAt: savedProjectDetail.createdAt,
      },
      budget: {
        id: savedBudget.id.getValue(),
        monthlyIncomeTarget: savedBudget.monthlyIncomeTarget || 0,
        dailyIncomeTarget: savedBudget.dailyIncomeTarget || 0,
        currencyCode: savedBudget.currencyCode,
        currencySymbol: savedBudget.currencySymbol,
      },
    };
  }
}
