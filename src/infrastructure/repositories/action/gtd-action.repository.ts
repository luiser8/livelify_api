import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GtdActionRepositoryInterface } from '../../../domain/repositories/action/gtd-action.repository.interface';
import {
  GtdAction,
  EnergyLevel,
} from '../../../domain/entities/action/gtd-action.entity';
import { Context } from '../../../domain/entities/context/context.entity';
import { GtdActionId } from '../../../domain/value-objects/action/gtd-action-id.value-object';
import { ProjectGoalId } from '../../../domain/value-objects/goal/project-goal-id.value-object';
import { ContextId } from '../../../domain/value-objects/context/context-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';

@Injectable()
export class GtdActionRepository implements GtdActionRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(action: GtdAction): Promise<GtdAction> {
    const data = {
      id: action.id.getValue(),
      goalId: action.goalId.getValue(),
      contextId: action.contextId?.getValue(),
      title: action.title,
      description: action.description,
      energy: action.energy,
      timeEstimate: action.timeEstimate,
      dueDate: action.dueDate,
      completed: action.completed,
      completedAt: action.completedAt,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
    };

    const savedAction = await this.prisma.gtdAction.create({
      data,
      include: {
        context: true,
      },
    });

    return this.toDomainEntity(savedAction);
  }

  async findById(id: GtdActionId): Promise<GtdAction | null> {
    const action = await this.prisma.gtdAction.findUnique({
      where: { id: id.getValue() },
      include: {
        context: true,
      },
    });

    return action ? this.toDomainEntity(action) : null;
  }

  async findByGoalId(goalId: ProjectGoalId): Promise<GtdAction[]> {
    const actions = await this.prisma.gtdAction.findMany({
      where: { goalId: goalId.getValue() },
      include: {
        context: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return actions.map((action) => this.toDomainEntity(action));
  }

  async findByContextId(contextId: ContextId): Promise<GtdAction[]> {
    const actions = await this.prisma.gtdAction.findMany({
      where: { contextId: contextId.getValue() },
      include: {
        context: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return actions.map((action) => this.toDomainEntity(action));
  }

  async findByUserId(userId: UserId): Promise<GtdAction[]> {
    const actions = await this.prisma.gtdAction.findMany({
      where: {
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
      include: {
        context: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return actions.map((action) => this.toDomainEntity(action));
  }

  async findPendingByUserId(userId: UserId): Promise<GtdAction[]> {
    const actions = await this.prisma.gtdAction.findMany({
      where: {
        completed: false,
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
      include: {
        context: true,
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });

    return actions.map((action) => this.toDomainEntity(action));
  }

  async findOverdueByUserId(userId: UserId): Promise<GtdAction[]> {
    const now = new Date();
    const actions = await this.prisma.gtdAction.findMany({
      where: {
        completed: false,
        dueDate: {
          lt: now,
        },
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
      include: {
        context: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return actions.map((action) => this.toDomainEntity(action));
  }

  async findByUserIdAndContext(
    userId: UserId,
    contextId: ContextId,
  ): Promise<GtdAction[]> {
    const actions = await this.prisma.gtdAction.findMany({
      where: {
        contextId: contextId.getValue(),
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
      include: {
        context: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return actions.map((action) => this.toDomainEntity(action));
  }

  async update(action: GtdAction): Promise<GtdAction> {
    const data = {
      contextId: action.contextId?.getValue(),
      title: action.title,
      description: action.description,
      energy: action.energy,
      timeEstimate: action.timeEstimate,
      dueDate: action.dueDate,
      completed: action.completed,
      completedAt: action.completedAt,
      updatedAt: action.updatedAt,
    };

    const updatedAction = await this.prisma.gtdAction.update({
      where: { id: action.id.getValue() },
      data,
      include: {
        context: true,
      },
    });

    return this.toDomainEntity(updatedAction);
  }

  async delete(id: GtdActionId): Promise<void> {
    await this.prisma.gtdAction.delete({
      where: { id: id.getValue() },
    });
  }

  async countCompletedByGoalId(goalId: ProjectGoalId): Promise<number> {
    return await this.prisma.gtdAction.count({
      where: {
        goalId: goalId.getValue(),
        completed: true,
      },
    });
  }

  async countTotalByGoalId(goalId: ProjectGoalId): Promise<number> {
    return await this.prisma.gtdAction.count({
      where: {
        goalId: goalId.getValue(),
      },
    });
  }

  private toDomainEntity(value: any): GtdAction {
    let context: Context | undefined = undefined;
    if (value.context) {
      context = Context.reconstitute({
        id: ContextId.fromString(value.context.id),
        userId: UserId.fromString(value.context.userId),
        name: value.context.name,
        createdAt: value.context.createdAt,
        updatedAt: value.context.updatedAt,
      });
    }

    return GtdAction.reconstitute({
      id: GtdActionId.fromString(value.id),
      goalId: ProjectGoalId.fromString(value.goalId),
      contextId: value.contextId
        ? ContextId.fromString(value.contextId)
        : undefined,
      context: context,
      title: value.title,
      description: value.description,
      energy: value.energy as EnergyLevel,
      timeEstimate: value.timeEstimate,
      dueDate: value.dueDate,
      completed: value.completed,
      completedAt: value.completedAt,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
