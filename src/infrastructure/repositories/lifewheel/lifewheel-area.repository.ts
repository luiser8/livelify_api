import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LifeWheelAreaRepositoryInterface } from '../../../domain/repositories/lifewheel/lifewheel-area.repository.interface';
import { LifeWheelArea } from '../../../domain/entities/lifewheel/lifewheel-area.entity';
import { LifeWheelAreaId } from '../../../domain/value-objects/lifewheel/lifewheel-area-id.value-object';
import { LifeWheelId } from '../../../domain/value-objects/lifewheel/lifewheel-id.value-object';
import { AreaId } from '../../../domain/value-objects/area/area-id.value-object';
import { Area } from '../../../domain/entities/area/area.entity';

@Injectable()
export class LifeWheelAreaRepository
  implements LifeWheelAreaRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async save(lifeWheelArea: LifeWheelArea): Promise<LifeWheelArea> {
    const lifeWheelAreaData = lifeWheelArea.toPlainObject();

    const savedLifeWheelArea = await this.prisma.lifeWheelArea.create({
      data: {
        id: lifeWheelAreaData.id,
        lifeWheelId: lifeWheelAreaData.lifeWheelId,
        areaId: lifeWheelAreaData.areaId,
        score: lifeWheelAreaData.score,
        createdAt: lifeWheelAreaData.createdAt,
        updatedAt: lifeWheelAreaData.updatedAt,
      },
      include: {
        area: true,
      },
    });

    return this.toDomainEntity(savedLifeWheelArea);
  }

  async findById(id: LifeWheelAreaId): Promise<LifeWheelArea | null> {
    const lifeWheelArea = await this.prisma.lifeWheelArea.findUnique({
      where: { id: id.getValue() },
      include: {
        area: true,
      },
    });

    if (!lifeWheelArea) {
      return null;
    }

    return this.toDomainEntity(lifeWheelArea);
  }

  async findByLifeWheelId(lifeWheelId: LifeWheelId): Promise<LifeWheelArea[]> {
    const lifeWheelAreas = await this.prisma.lifeWheelArea.findMany({
      where: { lifeWheelId: lifeWheelId.getValue() },
      include: {
        area: true,
      },
    });

    return lifeWheelAreas.map((lwa) => this.toDomainEntity(lwa));
  }

  async update(lifeWheelArea: LifeWheelArea): Promise<LifeWheelArea> {
    const lifeWheelAreaData = lifeWheelArea.toPlainObject();

    const updatedLifeWheelArea = await this.prisma.lifeWheelArea.update({
      where: { id: lifeWheelAreaData.id },
      data: {
        score: lifeWheelAreaData.score,
        isBlocked: lifeWheelAreaData.isBlocked,
        updatedAt: lifeWheelAreaData.updatedAt,
      },
      include: {
        area: true,
      },
    });

    return this.toDomainEntity(updatedLifeWheelArea);
  }

  async unlockAreas(lifeWheelAreaIds: LifeWheelAreaId[]): Promise<number> {
    const ids = lifeWheelAreaIds.map((id) => id.getValue());

    const result = await this.prisma.lifeWheelArea.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        isBlocked: true,
        updatedAt: new Date(),
      },
    });

    return result.count;
  }

  async delete(id: LifeWheelAreaId): Promise<void> {
    await this.prisma.lifeWheelArea.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomainEntity(value: any): LifeWheelArea {
    // Reconstituir el área si está disponible
    let area: Area | undefined = undefined;
    if (value.area) {
      area = Area.reconstitute({
        id: AreaId.fromString(value.area.id),
        name: value.area.name,
        description: value.area.description,
        createdAt: value.area.createdAt,
        updatedAt: value.area.updatedAt,
      });
    }

    return LifeWheelArea.reconstitute({
      id: LifeWheelAreaId.fromString(value.id),
      lifeWheelId: LifeWheelId.fromString(value.lifeWheelId),
      areaId: AreaId.fromString(value.areaId),
      area: area,
      score: value.score,
      isBlocked: value.isBlocked,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
