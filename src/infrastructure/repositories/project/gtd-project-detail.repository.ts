import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GtdProjectDetailRepositoryInterface } from '../../../domain/repositories/project/gtd-project-detail.repository.interface';
import {
  GtdProjectDetail,
  ProjectDetailStatus,
} from '../../../domain/entities/project/gtd-project-detail.entity';
import { GtdProjectDetailId } from '../../../domain/value-objects/project/gtd-project-detail-id.value-object';
import { GtdProjectId } from '../../../domain/value-objects/project/gtd-project-id.value-object';
import { AreaId } from '../../../domain/value-objects/area/area-id.value-object';

@Injectable()
export class GtdProjectDetailRepository
  implements GtdProjectDetailRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async save(projectDetail: GtdProjectDetail): Promise<GtdProjectDetail> {
    const projectDetailData = projectDetail.toPlainObject();

    const savedProjectDetail = await this.prisma.gtdProjectDetail.create({
      data: {
        id: projectDetailData.id,
        projectId: projectDetailData.projectId,
        lifeAreaId: projectDetailData.lifeAreaId,
        status: projectDetailData.status as any,
        startDate: projectDetailData.startDate,
        endDate: projectDetailData.endDate,
        completedActions: projectDetailData.completedActions,
        totalActions: projectDetailData.totalActions,
        progressPercentage: projectDetailData.progressPercentage,
        createdAt: projectDetailData.createdAt,
        updatedAt: projectDetailData.updatedAt,
      },
      include: {
        project: true,
        lifeArea: true,
      },
    });

    return this.toDomainEntity(savedProjectDetail);
  }

  async findById(id: GtdProjectDetailId): Promise<GtdProjectDetail | null> {
    const projectDetail = await this.prisma.gtdProjectDetail.findUnique({
      where: { id: id.getValue() },
      include: {
        project: true,
        lifeArea: true,
      },
    });

    if (!projectDetail) {
      return null;
    }

    return this.toDomainEntity(projectDetail);
  }

  async findByProjectId(
    projectId: GtdProjectId,
  ): Promise<GtdProjectDetail | null> {
    const projectDetail = await this.prisma.gtdProjectDetail.findUnique({
      where: { projectId: projectId.getValue() },
      include: {
        project: true,
        lifeArea: true,
      },
    });

    if (!projectDetail) {
      return null;
    }

    return this.toDomainEntity(projectDetail);
  }

  async findByLifeAreaId(lifeAreaId: AreaId): Promise<GtdProjectDetail[]> {
    const projectDetails = await this.prisma.gtdProjectDetail.findMany({
      where: { lifeAreaId: lifeAreaId.getValue() },
      include: {
        project: true,
        lifeArea: true,
      },
    });

    return projectDetails.map((detail) => this.toDomainEntity(detail));
  }

  async update(projectDetail: GtdProjectDetail): Promise<GtdProjectDetail> {
    const projectDetailData = projectDetail.toPlainObject();

    const updatedProjectDetail = await this.prisma.gtdProjectDetail.update({
      where: { id: projectDetailData.id },
      data: {
        status: projectDetailData.status as any,
        startDate: projectDetailData.startDate,
        endDate: projectDetailData.endDate,
        completedActions: projectDetailData.completedActions,
        totalActions: projectDetailData.totalActions,
        progressPercentage: projectDetailData.progressPercentage,
        updatedAt: projectDetailData.updatedAt,
      },
      include: {
        project: true,
        lifeArea: true,
      },
    });

    return this.toDomainEntity(updatedProjectDetail);
  }

  async delete(id: GtdProjectDetailId): Promise<void> {
    await this.prisma.gtdProjectDetail.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomainEntity(value: any): GtdProjectDetail {
    return GtdProjectDetail.reconstitute({
      id: GtdProjectDetailId.fromString(value.id),
      projectId: GtdProjectId.fromString(value.projectId),
      lifeAreaId: AreaId.fromString(value.lifeAreaId),
      status: value.status as ProjectDetailStatus,
      startDate: value.startDate,
      endDate: value.endDate,
      completedActions: value.completedActions,
      totalActions: value.totalActions,
      progressPercentage: value.progressPercentage,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
