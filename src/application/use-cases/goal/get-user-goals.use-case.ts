import { Injectable, Inject } from '@nestjs/common';
import { GoalType } from '../../../domain/entities/goal/project-goal.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { ProjectGoalId } from '../../../domain/value-objects/goal/project-goal-id.value-object';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import type { ActionBudgetRepositoryInterface } from '../../../domain/repositories/action-budget/action-budget.repository.interface';
import { PROJECT_GOAL_REPOSITORY_TOKEN, GTD_ACTION_REPOSITORY_TOKEN } from '../../ports/goals-actions';
import { ACTION_BUDGET_REPOSITORY_TOKEN } from '../../ports/action-budgets';

export interface GetUserGoalsRequest {
  userId: string;
}

export interface GoalWithProjectResponse {
  id: string;
  projectDetailId: string;
  goalType: GoalType;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  totalMonthlyBudget: number | null; // Suma de monthlyBudget de todas las acciones (null si no hay acciones)
  totalDailyBudget: number | null; // Suma de dailyBudget de todas las acciones (null si no hay acciones)
}

export interface GetUserGoalsResponse {
  goals: GoalWithProjectResponse[];
  totalGoals: number;
  goalsByType: {
    BE: number;
    DO: number;
    HAVE: number;
  };
}

@Injectable()
export class GetUserGoalsUseCase {
  constructor(
    @Inject(PROJECT_GOAL_REPOSITORY_TOKEN)
    private readonly projectGoalRepository: ProjectGoalRepositoryInterface,
    @Inject(GTD_ACTION_REPOSITORY_TOKEN)
    private readonly gtdActionRepository: GtdActionRepositoryInterface,
    @Inject(ACTION_BUDGET_REPOSITORY_TOKEN)
    private readonly actionBudgetRepository: ActionBudgetRepositoryInterface,
  ) {}

  async execute(request: GetUserGoalsRequest): Promise<GetUserGoalsResponse> {
    // 1. Obtener todos los goals del usuario
    const userId = UserId.fromString(request.userId);
    const goals = await this.projectGoalRepository.findByUserId(userId);

    // 2. Mapear los goals y calcular presupuestos
    const goalsWithProjects: GoalWithProjectResponse[] = await Promise.all(
      goals.map(async (goal) => {
        // 2.1. Obtener todas las acciones de este goal
        const goalId = ProjectGoalId.fromString(goal.id.getValue());
        const actions = await this.gtdActionRepository.findByGoalId(goalId);

        // 2.2. Si no hay acciones, retornar null para los presupuestos
        let totalMonthlyBudget: number | null = null;
        let totalDailyBudget: number | null = null;

        if (actions.length > 0) {
          // 2.3. Obtener los budgets de todas las acciones
          let monthlySum = 0;
          let dailySum = 0;

          for (const action of actions) {
            const actionBudget =
              await this.actionBudgetRepository.findByActionId(action.id);

            if (actionBudget) {
              monthlySum += actionBudget.monthlyBudget ?? 0;
              dailySum += actionBudget.dailyBudget ?? 0;
            }
          }

          // Redondear a 2 decimales
          totalMonthlyBudget = Math.round(monthlySum * 100) / 100;
          totalDailyBudget = Math.round(dailySum * 100) / 100;
        }

        return {
          id: goal.id.getValue(),
          projectDetailId: goal.detailId.getValue(),
          goalType: goal.goalType,
          content: goal.content,
          createdAt: goal.createdAt,
          updatedAt: goal.updatedAt,
          totalMonthlyBudget,
          totalDailyBudget,
        };
      }),
    );

    // 3. Calcular estadísticas
    const totalGoals = goals.length;

    // Contar por tipo
    const goalsByType = {
      BE: goals.filter((goal) => goal.goalType === GoalType.BE).length,
      DO: goals.filter((goal) => goal.goalType === GoalType.DO).length,
      HAVE: goals.filter((goal) => goal.goalType === GoalType.HAVE).length,
    };

    return {
      goals: goalsWithProjects,
      totalGoals,
      goalsByType,
    };
  }
}
