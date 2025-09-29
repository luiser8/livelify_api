import { Injectable } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { PrismaService } from '../../database/prisma.service';
import { UserContextRepositoryInterface } from 'src/domain/repositories/user/user-context.repository.interface';
import { Context } from 'src/domain/entities/user/context.entity';
import { ContextId } from 'src/domain/value-objects/context/context-id.value-object';

@Injectable()
export class UserContextRepository implements UserContextRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: UserId): Promise<Context[]> {
    const contexts = await this.prisma.context.findMany({
      where: { userId: userId.getValue() },
    });

    return contexts.map((c) => this.toDomainEntity(c));
  }

  async save(context: Context): Promise<Context> {
    const contextData = context.toPlainObject();

    const savedContext = await this.prisma.context.upsert({
      where: { id: contextData.id },
      create: {
        id: contextData.id,
        userId: contextData.userId,
        name: contextData.name,
      },
      update: {
        id: contextData.id,
        userId: contextData.userId,
        name: contextData.name,
      },
    });

    return this.toDomainEntity(savedContext);
  }

  private toDomainEntity(context: {
    id: string;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): Context {
    return Context.reconstitute({
      id: ContextId.fromString(context.id),
      userId: UserId.fromString(context.userId),
      name: context.name,
      createdAt: context.createdAt,
      updatedAt: context.updatedAt,
    });
  }
}
