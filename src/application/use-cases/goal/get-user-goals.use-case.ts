import { Injectable, Inject } from '@nestjs/common';
import { GoalType } from '../../../domain/entities/goal/project-goal.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import { PROJECT_GOAL_REPOSITORY_TOKEN } from '../../ports/goals-actions';

export interface GetUserGoalsRequest {
  userId: string;
}

export interface GoalWithProjectResponse {
  id: string;
  projectDetailId: string;
  goalType: GoalType;
  content: string;
  cost?: number;
  saved?: number;
  progress: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUserGoalsResponse {
  goals: GoalWithProjectResponse[];
  totalGoals: number;
  goalsByType: {
    BE: number;
    DO: number;
    HAVE: number;
  };
  completedGoals: number;
  totalCost: number;
  totalSaved: number;
  overallProgress: number;
}

@Injectable()
export class GetUserGoalsUseCase {
  constructor(
    @Inject(PROJECT_GOAL_REPOSITORY_TOKEN)
    private readonly projectGoalRepository: ProjectGoalRepositoryInterface,
  ) {}

  async execute(request: GetUserGoalsRequest): Promise<GetUserGoalsResponse> {
    // 1. Obtener todos los goals del usuario
    const userId = UserId.fromString(request.userId);
    const goals = await this.projectGoalRepository.findByUserId(userId);

    // 2. Mapear los goals con información adicional
    const goalsWithProjects: GoalWithProjectResponse[] = goals.map((goal) => ({
      id: goal.id.getValue(),
      projectDetailId: goal.detailId.getValue(),
      goalType: goal.goalType,
      content: goal.content,
      cost: goal.cost,
      saved: goal.saved,
      progress: goal.getProgress(),
      isCompleted: goal.isCompleted(),
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    }));

    // 3. Calcular estadísticas
    const totalGoals = goals.length;
    const completedGoals = goals.filter((goal) => goal.isCompleted()).length;

    // Contar por tipo
    const goalsByType = {
      BE: goals.filter((goal) => goal.goalType === GoalType.BE).length,
      DO: goals.filter((goal) => goal.goalType === GoalType.DO).length,
      HAVE: goals.filter((goal) => goal.goalType === GoalType.HAVE).length,
    };

    // Calcular totales financieros
    const totalCost = goals.reduce((sum, goal) => sum + (goal.cost || 0), 0);
    const totalSaved = goals.reduce((sum, goal) => sum + (goal.saved || 0), 0);

    // Calcular progreso general
    const overallProgress =
      totalGoals > 0
        ? goals.reduce((sum, goal) => sum + goal.getProgress(), 0) / totalGoals
        : 0;

    return {
      goals: goalsWithProjects,
      totalGoals,
      goalsByType,
      completedGoals,
      totalCost,
      totalSaved,
      overallProgress: Math.round(overallProgress * 100) / 100,
    };
  }
}
