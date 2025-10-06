import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import type { LifeWheelRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel.repository.interface';
import type { ContextRepositoryInterface } from '../../../domain/repositories/context/context.repository.interface';
import type { GtdProjectRepositoryInterface } from '../../../domain/repositories/project/gtd-project.repository.interface';
import type { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import type { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import type { BudgetRepositoryInterface } from '../../../domain/repositories/budget/budget.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../ports/tokens';
import { LIFEWHEEL_REPOSITORY_TOKEN } from '../../ports/lifewheel';
import {
  CONTEXT_REPOSITORY_TOKEN,
  PROJECT_GOAL_REPOSITORY_TOKEN,
  GTD_ACTION_REPOSITORY_TOKEN,
} from '../../ports/goals-actions';
import { GTD_PROJECT_REPOSITORY_TOKEN } from '../../ports/projects';
import { BUDGET_REPOSITORY_TOKEN } from '../../ports/budget';
import { GetSubscriptionByUserIdUseCase } from '../subscription/get-subscription-by-user.use-case';

export interface GetUserCompleteProfileRequest {
  userId: string;
}

export interface UserCompleteProfileResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  };
  subscription?: {
    id: string;
    planName: string;
    price: number;
    isActive: boolean;
    startDate: Date;
    endDate?: Date;
  };
  contexts: Array<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  lifeWheel?: {
    id: string;
    globalScore: number;
    lifeAreas: Array<{
      id: string;
      areaId: string;
      areaName: string;
      score: number;
      projects: Array<{
        id: string;
        title: string;
        description?: string;
        status: string;
        budget?: {
          id: string;
          monthlyIncomeTarget?: number;
          dailyIncomeTarget?: number;
          currency: {
            code: string;
            name: string;
            symbol: string;
          };
        };
        goals: Array<{
          id: string;
          goalType: string;
          content: string;
          actions: Array<{
            id: string;
            title: string;
            contextName: string;
            energy: string;
            completed: boolean;
            dueDate?: Date;
            isOverdue: boolean;
          }>;
        }>;
      }>;
    }>;
  };
  summary: {
    totalProjects: number;
    totalGoals: number;
    totalActions: number;
    completedGoals: number;
    completedActions: number;
    overdueActions: number;
  };
}

@Injectable()
export class GetUserCompleteProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(LIFEWHEEL_REPOSITORY_TOKEN)
    private readonly lifeWheelRepository: LifeWheelRepositoryInterface,
    @Inject(CONTEXT_REPOSITORY_TOKEN)
    private readonly contextRepository: ContextRepositoryInterface,
    @Inject(GTD_PROJECT_REPOSITORY_TOKEN)
    private readonly gtdProjectRepository: GtdProjectRepositoryInterface,
    @Inject(PROJECT_GOAL_REPOSITORY_TOKEN)
    private readonly projectGoalRepository: ProjectGoalRepositoryInterface,
    @Inject(GTD_ACTION_REPOSITORY_TOKEN)
    private readonly gtdActionRepository: GtdActionRepositoryInterface,
    @Inject(BUDGET_REPOSITORY_TOKEN)
    private readonly budgetRepository: BudgetRepositoryInterface,
    private readonly getSubscriptionByUserIdUseCase: GetSubscriptionByUserIdUseCase,
  ) {}

  async execute(
    request: GetUserCompleteProfileRequest,
  ): Promise<UserCompleteProfileResponse> {
    const userId = UserId.fromString(request.userId);

    // 1. Get user basic info
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Get user subscription (optional)
    let subscription:
      | {
          id: string;
          planName: string;
          price: number;
          isActive: boolean;
          startDate: Date;
          endDate?: Date;
        }
      | undefined = undefined;
    try {
      const subscriptionData =
        await this.getSubscriptionByUserIdUseCase.execute({
          userId: request.userId,
        });
      if (subscriptionData) {
        subscription = {
          id: subscriptionData.id || '',
          planName: subscriptionData.plan?.name || '',
          price: Number(subscriptionData.plan?.price) || 0,
          isActive: subscriptionData.active || false,
          startDate: subscriptionData.startDate || new Date(),
          endDate: subscriptionData.renewalDate,
        };
      }
    } catch {
      // Subscription is optional, continue without it
    }

    // 3. Get user contexts
    const contexts = await this.contextRepository.findByUserId(userId);
    const formattedContexts = contexts.map((context) => ({
      id: context.id.getValue(),
      name: context.name,
      createdAt: context.createdAt,
      updatedAt: context.updatedAt,
    }));

    // 4. Get user LifeWheel with all related data
    let lifeWheel:
      | {
          id: string;
          globalScore: number;
          lifeAreas: Array<{
            id: string;
            areaId: string;
            areaName: string;
            score: number;
            projects: Array<{
              id: string;
              title: string;
              description?: string;
              status: string;
              budget?: {
                id: string;
                monthlyIncomeTarget?: number;
                dailyIncomeTarget?: number;
                currency: {
                  code: string;
                  name: string;
                  symbol: string;
                };
              };
              goals: Array<{
                id: string;
                goalType: string;
                content: string;
                cost?: number;
                saved?: number;
                progress: number;
                isCompleted: boolean;
                actions: Array<{
                  id: string;
                  title: string;
                  contextName: string;
                  energy: string;
                  completed: boolean;
                  dueDate?: Date;
                  isOverdue: boolean;
                }>;
              }>;
            }>;
          }>;
        }
      | undefined = undefined;
    let totalProjects = 0;
    let totalGoals = 0;
    let totalActions = 0;
    let completedGoals = 0;
    let completedActions = 0;
    let overdueActions = 0;

    try {
      const lifeWheelArray =
        await this.lifeWheelRepository.findByUserId(userId);
      if (lifeWheelArray && lifeWheelArray.length > 0) {
        const lifeWheelData = lifeWheelArray[0]; // Take the first (and likely only) LifeWheel
        // Get all projects for this user
        const allProjects =
          await this.gtdProjectRepository.findByUserId(userId);
        totalProjects = allProjects.length;

        // Get all goals for this user
        const allGoals = await this.projectGoalRepository.findByUserId(userId);
        totalGoals = allGoals.length;
        // Note: completedGoals count removed as it now depends on GoalBudget data
        completedGoals = 0; // TODO: Calculate based on GoalBudget if needed

        // Get all actions for this user
        const allActions = await this.gtdActionRepository.findByUserId(userId);
        totalActions = allActions.length;
        completedActions = allActions.filter(
          (action) => action.completed,
        ).length;
        overdueActions = allActions.filter(
          (action) => !action.completed && action.isOverdue(),
        ).length;

        // Build LifeWheel structure with projects, goals, and actions
        const lifeAreas = await Promise.all(
          lifeWheelData.lifeAreas.map(async (lifeWheelArea) => {
            // Get projects for this life wheel area
            const areaProjects =
              await this.gtdProjectRepository.findByLifeWheelAreaId(
                lifeWheelArea.id,
              );

            const formattedProjects = await Promise.all(
              areaProjects.map(async (project) => {
                // Get budget for this project (if exists)
                const projectBudget =
                  await this.budgetRepository.findByProjectId(project.id);
                // Get goals for this project
                const projectGoals =
                  await this.projectGoalRepository.findByProjectId(project.id);

                // Format goals with their respective actions
                const formattedGoals = await Promise.all(
                  projectGoals.map(async (goal) => {
                    // Get actions for this specific goal
                    const goalActions =
                      await this.gtdActionRepository.findByGoalId(goal.id);

                    const formattedActions = goalActions.map((action) => ({
                      id: action.id.getValue(),
                      title: action.title,
                      contextName: action.contextName,
                      energy: action.energy as string,
                      completed: action.completed,
                      dueDate: action.dueDate,
                      isOverdue: action.isOverdue(),
                    }));

                    return {
                      id: goal.id.getValue(),
                      goalType: goal.goalType as string,
                      content: goal.content,
                      actions: formattedActions,
                    };
                  }),
                );

                // Format budget if exists
                const formattedBudget = projectBudget
                  ? {
                      id: projectBudget.id.getValue(),
                      monthlyIncomeTarget: projectBudget.monthlyIncomeTarget,
                      dailyIncomeTarget: projectBudget.dailyIncomeTarget,
                      currency: {
                        code: projectBudget.currency?.code || 'USD',
                        name: projectBudget.currency?.name || 'US Dollar',
                        symbol: projectBudget.currency?.symbol || '$',
                      },
                    }
                  : undefined;

                return {
                  id: project.id.getValue(),
                  title: project.title,
                  description: project.description || undefined,
                  status: project.status as string,
                  budget: formattedBudget,
                  goals: formattedGoals,
                };
              }),
            );

            return {
              id: lifeWheelArea.id.getValue(),
              areaId: lifeWheelArea.areaId.getValue(),
              areaName: lifeWheelArea.area?.name || 'Unknown Area',
              score: lifeWheelArea.score,
              projects: formattedProjects,
            };
          }),
        );

        lifeWheel = {
          id: lifeWheelData.id.getValue(),
          globalScore: lifeWheelData.globalScore,
          lifeAreas: lifeAreas as any,
        };
      }
    } catch {
      // LifeWheel is optional, continue without it
    }

    // 5. Build response
    return {
      user: {
        id: user.id.getValue(),
        email: user.email.getValue(),
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone,
        address: user.profile?.address,
      },
      subscription,
      contexts: formattedContexts,
      lifeWheel,
      summary: {
        totalProjects,
        totalGoals,
        totalActions,
        completedGoals,
        completedActions,
        overdueActions,
      },
    };
  }
}
