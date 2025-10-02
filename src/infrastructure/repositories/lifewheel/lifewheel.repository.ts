import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LifeWheelRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel.repository.interface';
import { LifeWheel } from '../../../domain/entities/lifewheel/lifewheel.entity';
import { LifeWheelId } from '../../../domain/value-objects/lifewheel/lifewheel-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { LifeWheelArea } from '../../../domain/entities/lifewheel/lifewheel-area.entity';
import { LifeWheelAreaId } from '../../../domain/value-objects/lifewheel/lifewheel-area-id.value-object';
import { AreaId } from '../../../domain/value-objects/area/area-id.value-object';
import { Area } from '../../../domain/entities/area/area.entity';

@Injectable()
export class LifeWheelRepository implements LifeWheelRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(lifeWheel: LifeWheel): Promise<LifeWheel> {
    const lifeWheelData = lifeWheel.toPlainObject();

    const savedLifeWheel = await this.prisma.lifeWheel.create({
      data: {
        id: lifeWheelData.id,
        userId: lifeWheelData.userId,
        globalScore: lifeWheelData.globalScore,
        createdAt: lifeWheelData.createdAt,
        updatedAt: lifeWheelData.updatedAt,
      },
      include: {
        lifeAreas: {
          include: {
            area: true,
          },
        },
      },
    });

    return this.toDomainEntity(savedLifeWheel);
  }

  async findById(id: LifeWheelId): Promise<LifeWheel | null> {
    const lifeWheel = await this.prisma.lifeWheel.findUnique({
      where: { id: id.getValue() },
      include: {
        lifeAreas: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!lifeWheel) {
      return null;
    }

    return this.toDomainEntity(lifeWheel);
  }

  async findByUserId(userId: UserId): Promise<LifeWheel[]> {
    const lifeWheels = await this.prisma.lifeWheel.findMany({
      where: { userId: userId.getValue() },
      include: {
        lifeAreas: {
          include: {
            area: true,
          },
        },
      },
    });

    return lifeWheels.map((lw) => this.toDomainEntity(lw));
  }

  async update(lifeWheel: LifeWheel): Promise<LifeWheel> {
    const lifeWheelData = lifeWheel.toPlainObject();

    const updatedLifeWheel = await this.prisma.lifeWheel.update({
      where: { id: lifeWheelData.id },
      data: {
        globalScore: lifeWheelData.globalScore,
        updatedAt: lifeWheelData.updatedAt,
      },
      include: {
        lifeAreas: {
          include: {
            area: true,
          },
        },
      },
    });

    return this.toDomainEntity(updatedLifeWheel);
  }

  async delete(id: LifeWheelId): Promise<void> {
    await this.prisma.lifeWheel.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomainEntity(value: any): LifeWheel {
    const lifeAreas =
      value.lifeAreas?.map((la: any) => {
        // Reconstituir el área si está disponible
        let area: Area | undefined = undefined;
        if (la.area) {
          area = Area.reconstitute({
            id: AreaId.fromString(la.area.id),
            name: la.area.name,
            createdAt: la.area.createdAt,
            updatedAt: la.area.updatedAt,
            description: la.area.description,
          });
        }

        return LifeWheelArea.reconstitute({
          id: LifeWheelAreaId.fromString(la.id),
          lifeWheelId: LifeWheelId.fromString(la.lifeWheelId),
          areaId: AreaId.fromString(la.areaId),
          area: area,
          score: la.score,
          createdAt: la.createdAt,
          updatedAt: la.updatedAt,
        });
      }) || [];

    return LifeWheel.reconstitute({
      id: LifeWheelId.fromString(value.id),
      userId: UserId.fromString(value.userId),
      lifeAreas,
      globalScore: value.globalScore,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
