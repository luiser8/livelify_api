import { Injectable, Inject } from '@nestjs/common';
import {
  ProjectGoal,
  GoalType,
} from '../../../domain/entities/goal/project-goal.entity';
import { GtdProjectDetailId } from '../../../domain/value-objects/project/gtd-project-detail-id.value-object';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import { PROJECT_GOAL_REPOSITORY_TOKEN } from '../../ports/goals-actions';
import { GTD_PROJECT_DETAIL_REPOSITORY_TOKEN } from '../../ports/projects';

export interface CreateProjectGoalRequest {
  userId: string;
  projectDetailId: string;
  goalType: 'BE' | 'DO' | 'HAVE';
  content: string;
}

export interface CreateProjectGoalResponse {
  goal: {
    id: string;
    projectDetailId: string;
    goalType: GoalType;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class CreateProjectGoalUseCase {
  constructor(
    @Inject(PROJECT_GOAL_REPOSITORY_TOKEN)
    private readonly projectGoalRepository: ProjectGoalRepositoryInterface,
    @Inject(GTD_PROJECT_DETAIL_REPOSITORY_TOKEN)
    private readonly gtdProjectDetailRepository: GtdProjectDetailRepositoryInterface,
  ) {}

  async execute(
    request: CreateProjectGoalRequest,
  ): Promise<CreateProjectGoalResponse> {
    // 1. Validar que el project detail existe
    const projectDetailId = GtdProjectDetailId.fromString(
      request.projectDetailId,
    );
    const projectDetail =
      await this.gtdProjectDetailRepository.findById(projectDetailId);

    if (!projectDetail) {
      throw new Error('Project detail not found');
    }

    // 2. Validar el tipo de goal
    const goalType = request.goalType as GoalType;
    if (!Object.values(GoalType).includes(goalType)) {
      throw new Error('Invalid goal type. Must be BE, DO, or HAVE');
    }

    // 3. Crear el goal
    const goal = ProjectGoal.create(projectDetailId, goalType, request.content);

    // 4. Guardar el goal
    const savedGoal = await this.projectGoalRepository.save(goal);

    // 5. Preparar la respuesta
    return {
      goal: {
        id: savedGoal.id.getValue(),
        projectDetailId: savedGoal.detailId.getValue(),
        goalType: savedGoal.goalType,
        content: savedGoal.content,
        createdAt: savedGoal.createdAt,
        updatedAt: savedGoal.updatedAt,
      },
    };
  }
}
