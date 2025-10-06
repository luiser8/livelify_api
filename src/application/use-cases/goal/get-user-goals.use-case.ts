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

    // 2. Mapear los goals
    const goalsWithProjects: GoalWithProjectResponse[] = goals.map((goal) => ({
      id: goal.id.getValue(),
      projectDetailId: goal.detailId.getValue(),
      goalType: goal.goalType,
      content: goal.content,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    }));

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
