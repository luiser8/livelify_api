import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ContextRepositoryInterface } from '../../../domain/repositories/context/context.repository.interface';
import { Context } from '../../../domain/entities/context/context.entity';
import { ContextId } from '../../../domain/value-objects/context/context-id.value-object';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';

@Injectable()
export class ContextRepository implements ContextRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(context: Context): Promise<Context> {
    const data = {
      id: context.id.getValue(),
      userId: context.userId.getValue(),
      name: context.name,
      createdAt: context.createdAt,
      updatedAt: context.updatedAt,
    };

    const savedContext = await this.prisma.context.create({ data });
    return this.toDomainEntity(savedContext);
  }

  async findById(id: ContextId): Promise<Context | null> {
    const context = await this.prisma.context.findUnique({
      where: { id: id.getValue() },
    });

    return context ? this.toDomainEntity(context) : null;
  }

  async findByUserId(userId: UserId): Promise<Context[]> {
    const contexts = await this.prisma.context.findMany({
      where: { userId: userId.getValue() },
      orderBy: { name: 'asc' },
    });

    return contexts.map((context) => this.toDomainEntity(context));
  }

  async findByUserIdAndName(
    userId: UserId,
    name: string,
  ): Promise<Context | null> {
    const context = await this.prisma.context.findUnique({
      where: {
        userId_name: {
          userId: userId.getValue(),
          name: name,
        },
      },
    });

    return context ? this.toDomainEntity(context) : null;
  }

  async update(context: Context): Promise<Context> {
    const data = {
      name: context.name,
      updatedAt: context.updatedAt,
    };

    const updatedContext = await this.prisma.context.update({
      where: { id: context.id.getValue() },
      data,
    });

    return this.toDomainEntity(updatedContext);
  }

  async delete(id: ContextId): Promise<void> {
    await this.prisma.context.delete({
      where: { id: id.getValue() },
    });
  }

  private toDomainEntity(value: any): Context {
    return Context.reconstitute({
      id: ContextId.fromString(value.id),
      userId: UserId.fromString(value.userId),
      name: value.name,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    });
  }
}
