import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AreaRepositoryInterface } from 'src/domain/repositories/area/area.repository.interface';
import { Area } from 'src/domain/entities/area/area.entity';
import { AreaId } from 'src/domain/value-objects/area/area-id.value-object';

@Injectable()
export class AreaRepository implements AreaRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Area[]> {
    const areas = await this.prisma.area.findMany();

    return areas.map((a) => this.toDomainEntity(a));
  }

  private toDomainEntity(value: {
    id: string;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Area {
    return Area.reconstitute({
      id: AreaId.fromString(value.id),
      name: value.name,
      description: value.description,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
