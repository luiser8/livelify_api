/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserAreasSelectedRepositoryInterface } from '../../../domain/repositories/user/user-areas-selected-repository.interface';
import { UserAreasSelected } from '../../../domain/entities/user/user-selected-areas.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { LifeWheelId } from '../../../domain/value-objects/lifewheel/lifewheel-id.value-object';
import { AreaId } from '../../../domain/value-objects/area/area-id.value-object';

@Injectable()
export class UserAreasSelectedRepository
  implements UserAreasSelectedRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async save(userAreasSelected: UserAreasSelected): Promise<UserAreasSelected> {
    const userAreasSelectedData = userAreasSelected.toPlainObject();

    const savedUserAreasSelected = await this.prisma.userAreasSelected.upsert({
      where: { id: userAreasSelectedData.id },
      create: {
        id: userAreasSelectedData.id,
        userId: userAreasSelectedData.userId,
        lifeWheelId: userAreasSelectedData.lifeWheelId,
        areaId: userAreasSelectedData.areaId,
        score: userAreasSelectedData.score,
        createdAt: userAreasSelectedData.createdAt,
        updatedAt: userAreasSelectedData.updatedAt,
      },
      update: {
        score: userAreasSelectedData.score,
        updatedAt: userAreasSelectedData.updatedAt,
      },
    });

    return this.toDomainEntity(savedUserAreasSelected);
  }

  async saveMultiple(
    userAreasSelected: UserAreasSelected[],
  ): Promise<UserAreasSelected[]> {
    if (userAreasSelected.length === 0) {
      return [];
    }

    try {
      const userAreasSelectedData = userAreasSelected.map((area) =>
        area.toPlainObject(),
      );

      const userId = userAreasSelectedData[0].userId;
      const lifeWheelId = userAreasSelectedData[0].lifeWheelId;

      await this.prisma.userAreasSelected.deleteMany({
        where: {
          userId,
          lifeWheelId,
          areaId: {
            in: userAreasSelectedData.map((data) => data.areaId),
          },
        },
      });

      await this.prisma.userAreasSelected.createMany({
        data: userAreasSelectedData.map((data) => ({
          id: data.id,
          userId: data.userId,
          lifeWheelId: data.lifeWheelId,
          areaId: data.areaId,
          score: data.score,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        })),
        skipDuplicates: true,
      });

      const createdRecords = await this.prisma.userAreasSelected.findMany({
        where: {
          userId,
          lifeWheelId,
          areaId: {
            in: userAreasSelectedData.map((data) => data.areaId),
          },
        },
      });

      return createdRecords.map((area) => this.toDomainEntity(area));
    } catch (error) {
      console.error('Error en saveMultiple:', error);
      throw new Error(
        `No se pudieron guardar las áreas seleccionadas: ${error.message}`,
      );
    }
  }

  async findById(id: string): Promise<UserAreasSelected | null> {
    const userAreasSelected = await this.prisma.userAreasSelected.findUnique({
      where: { id },
    });

    if (!userAreasSelected) {
      return null;
    }

    return this.toDomainEntity(userAreasSelected);
  }

  async findByUserAndLifeWheel(
    userId: UserId,
    lifeWheelId: LifeWheelId,
  ): Promise<UserAreasSelected[]> {
    const userAreasSelected = await this.prisma.userAreasSelected.findMany({
      where: {
        userId: userId.getValue(),
        lifeWheelId: lifeWheelId.getValue(),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userAreasSelected.map((area) => this.toDomainEntity(area));
  }

  async findByUserId(userId: UserId): Promise<UserAreasSelected[]> {
    const userAreasSelected = await this.prisma.userAreasSelected.findMany({
      where: { userId: userId.getValue() },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userAreasSelected.map((area) => this.toDomainEntity(area));
  }

  async findByLifeWheelId(
    lifeWheelId: LifeWheelId,
  ): Promise<UserAreasSelected[]> {
    const userAreasSelected = await this.prisma.userAreasSelected.findMany({
      where: { lifeWheelId: lifeWheelId.getValue() },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userAreasSelected.map((area) => this.toDomainEntity(area));
  }

  async findByAreaId(areaId: AreaId): Promise<UserAreasSelected[]> {
    const userAreasSelected = await this.prisma.userAreasSelected.findMany({
      where: { areaId: areaId.getValue() },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userAreasSelected.map((area) => this.toDomainEntity(area));
  }

  async update(
    userAreasSelected: UserAreasSelected,
  ): Promise<UserAreasSelected> {
    // Reutilizamos el método save que ya hace upsert
    return this.save(userAreasSelected);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userAreasSelected.delete({
      where: { id },
    });
  }

  async deleteByUserAndLifeWheel(
    userId: UserId,
    lifeWheelId: LifeWheelId,
  ): Promise<void> {
    await this.prisma.userAreasSelected.deleteMany({
      where: {
        userId: userId.getValue(),
        lifeWheelId: lifeWheelId.getValue(),
      },
    });
  }

  private toDomainEntity(userAreasSelected: {
    id: string;
    userId: string;
    lifeWheelId: string;
    areaId: string;
    score: number;
    createdAt: Date;
    updatedAt: Date;
  }): UserAreasSelected {
    return UserAreasSelected.reconstitute({
      id: userAreasSelected.id,
      userId: UserId.fromString(userAreasSelected.userId),
      lifeWheelId: LifeWheelId.fromString(userAreasSelected.lifeWheelId),
      areaId: AreaId.fromString(userAreasSelected.areaId),
      score: userAreasSelected.score,
      createdAt: userAreasSelected.createdAt,
      updatedAt: userAreasSelected.updatedAt,
    });
  }
}
