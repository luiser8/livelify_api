import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GtdProjectRepositoryInterface } from '../../../domain/repositories/project/gtd-project.repository.interface';
import {
  GtdProject,
  ProjectStatus,
} from '../../../domain/entities/project/gtd-project.entity';
import { GtdProjectId } from '../../../domain/value-objects/project/gtd-project-id.value-object';
import { LifeWheelAreaId } from '../../../domain/value-objects/lifewheel/lifewheel-area-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';

@Injectable()
export class GtdProjectRepository implements GtdProjectRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(project: GtdProject): Promise<GtdProject> {
    const projectData = project.toPlainObject();

    const savedProject = await this.prisma.gtdProject.create({
      data: {
        id: projectData.id,
        lifeWheelAreaId: projectData.lifeWheelAreaId,
        title: projectData.title,
        description: projectData.description,
        status: projectData.status as any,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt,
      },
      include: {
        detail: true,
        lifeWheelArea: {
          include: {
            area: true,
          },
        },
      },
    });

    return this.toDomainEntity(savedProject);
  }

  async findById(id: GtdProjectId): Promise<GtdProject | null> {
    const project = await this.prisma.gtdProject.findUnique({
      where: { id: id.getValue() },
      include: {
        detail: true,
        lifeWheelArea: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    return this.toDomainEntity(project);
  }

  async findByLifeWheelAreaId(
    lifeWheelAreaId: LifeWheelAreaId,
  ): Promise<GtdProject[]> {
    const projects = await this.prisma.gtdProject.findMany({
      where: { lifeWheelAreaId: lifeWheelAreaId.getValue() },
      include: {
        detail: true,
        lifeWheelArea: {
          include: {
            area: true,
          },
        },
      },
    });

    return projects.map((project) => this.toDomainEntity(project));
  }

  async findByUserId(userId: UserId): Promise<GtdProject[]> {
    const projects = await this.prisma.gtdProject.findMany({
      where: {
        lifeWheelArea: {
          lifeWheel: {
            userId: userId.getValue(),
          },
        },
      },
      include: {
        detail: true,
        lifeWheelArea: {
          include: {
            area: true,
          },
        },
      },
    });

    return projects.map((project) => this.toDomainEntity(project));
  }

  async update(project: GtdProject): Promise<GtdProject> {
    const projectData = project.toPlainObject();

    const updatedProject = await this.prisma.gtdProject.update({
      where: { id: projectData.id },
      data: {
        title: projectData.title,
        description: projectData.description,
        status: projectData.status as any,
        updatedAt: projectData.updatedAt,
      },
      include: {
        detail: true,
        lifeWheelArea: {
          include: {
            area: true,
          },
        },
      },
    });

    return this.toDomainEntity(updatedProject);
  }

  async delete(id: GtdProjectId): Promise<void> {
    await this.prisma.gtdProject.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomainEntity(value: any): GtdProject {
    return GtdProject.reconstitute({
      id: GtdProjectId.fromString(value.id),
      lifeWheelAreaId: LifeWheelAreaId.fromString(value.lifeWheelAreaId),
      title: value.title,
      description: value.description,
      status: value.status as ProjectStatus,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
