import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProjectGoalRepositoryInterface } from '../../../domain/repositories/goal/project-goal.repository.interface';
import {
  ProjectGoal,
  GoalType,
} from '../../../domain/entities/goal/project-goal.entity';
import { ProjectGoalId } from '../../../domain/value-objects/goal/project-goal-id.value-object';
import { GtdProjectDetailId } from '../../../domain/value-objects/project/gtd-project-detail-id.value-object';
import { GtdProjectId } from '../../../domain/value-objects/project/gtd-project-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';

@Injectable()
export class ProjectGoalRepository implements ProjectGoalRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(goal: ProjectGoal): Promise<ProjectGoal> {
    const data = {
      id: goal.id.getValue(),
      detailId: goal.detailId.getValue(),
      goalType: goal.goalType,
      content: goal.content,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };

    const savedGoal = await this.prisma.projectGoal.create({ data });
    return this.toDomainEntity(savedGoal);
  }

  async findById(id: ProjectGoalId): Promise<ProjectGoal | null> {
    const goal = await this.prisma.projectGoal.findUnique({
      where: { id: id.getValue() },
    });

    return goal ? this.toDomainEntity(goal) : null;
  }

  async findByDetailId(detailId: GtdProjectDetailId): Promise<ProjectGoal[]> {
    const goals = await this.prisma.projectGoal.findMany({
      where: { detailId: detailId.getValue() },
      orderBy: { id: 'asc' },
    });

    return goals.map((goal) => this.toDomainEntity(goal));
  }

  async findByProjectId(projectId: GtdProjectId): Promise<ProjectGoal[]> {
    const goals = await this.prisma.projectGoal.findMany({
      where: {
        detail: {
          projectId: projectId.getValue(),
        },
      },
      orderBy: { id: 'asc' },
    });

    return goals.map((goal) => this.toDomainEntity(goal));
  }

  async findByUserId(userId: UserId): Promise<ProjectGoal[]> {
    const goals = await this.prisma.projectGoal.findMany({
      where: {
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
      orderBy: { id: 'desc' },
    });

    return goals.map((goal) => this.toDomainEntity(goal));
  }

  async update(goal: ProjectGoal): Promise<ProjectGoal> {
    const data = {
      goalType: goal.goalType,
      content: goal.content,
      updatedAt: goal.updatedAt,
    };

    const updatedGoal = await this.prisma.projectGoal.update({
      where: { id: goal.id.getValue() },
      data,
    });

    return this.toDomainEntity(updatedGoal);
  }

  async delete(id: ProjectGoalId): Promise<void> {
    await this.prisma.projectGoal.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomainEntity(value: any): ProjectGoal {
    return ProjectGoal.reconstitute({
      id: ProjectGoalId.fromString(value.id),
      detailId: GtdProjectDetailId.fromString(value.detailId),
      goalType: value.goalType as GoalType,
      content: value.content,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
