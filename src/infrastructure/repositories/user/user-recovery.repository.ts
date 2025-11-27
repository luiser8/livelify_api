/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRecoveryRepositoryInterface } from '../../../domain/repositories/user/user-recovery.repository.interface';
import {
  UserRecovery,
  RecoveryType,
} from '../../../domain/entities/user/user-recovery.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';

@Injectable()
export class UserRecoveryRepository implements UserRecoveryRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(userRecovery: UserRecovery): Promise<UserRecovery> {
    const data = {
      id: userRecovery.id,
      userId: userRecovery.userId.getValue(),
      type: userRecovery.type,
      urlHash: userRecovery.urlHash,
      active: userRecovery.active,
      createdAt: userRecovery.createdAt,
      updatedAt: userRecovery.updatedAt,
    };

    const saved = await this.prisma.userRecovery.create({ data });

    return UserRecovery.reconstitute({
      id: saved.id,
      userId: new UserId(saved.userId),
      type: saved.type as RecoveryType,
      urlHash: saved.urlHash ?? undefined,
      active: saved.active,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }

  async create(data: any): Promise<UserRecovery> {
    const saved = await this.prisma.userRecovery.create({ 
      data: {
        id: data.id,
        userId: data.userId,
        type: data.type,
        urlHash: data.urlHash,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }
    });

    return UserRecovery.reconstitute({
      id: saved.id,
      userId: new UserId(saved.userId),
      type: saved.type as RecoveryType,
      urlHash: saved.urlHash ?? undefined,
      active: saved.active,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }

  async findByUrlHash(
    urlHash: string,
    type: RecoveryType,
  ): Promise<UserRecovery | null> {
    const found = await this.prisma.userRecovery.findFirst({
      where: {
        urlHash,
        type,
      },
    });

    if (!found) return null;

    return UserRecovery.reconstitute({
      id: found.id,
      userId: new UserId(found.userId),
      type: found.type as RecoveryType,
      urlHash: found.urlHash ?? undefined,
      active: found.active,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    });
  }

  async findByHashAndType(
    hash: string,
    type: RecoveryType,
  ): Promise<UserRecovery | null> {
    return this.findByUrlHash(hash, type);
  }

  async findByUserId(userId: UserId): Promise<UserRecovery[]> {
    const found = await this.prisma.userRecovery.findMany({
      where: { userId: userId.getValue() },
    });

    return found.map((item) =>
      UserRecovery.reconstitute({
        id: item.id,
        userId: new UserId(item.userId),
        type: item.type as RecoveryType,
        urlHash: item.urlHash ?? undefined,
        active: item.active,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }),
    );
  }

  async update(userRecovery: UserRecovery): Promise<UserRecovery> {
    const updated = await this.prisma.userRecovery.update({
      where: { id: userRecovery.id },
      data: {
        active: userRecovery.active,
        updatedAt: userRecovery.updatedAt,
      },
    });

    return UserRecovery.reconstitute({
      id: updated.id,
      userId: new UserId(updated.userId),
      type: updated.type as RecoveryType,
      urlHash: updated.urlHash ?? undefined,
      active: updated.active,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async deleteByUserId(userId: UserId): Promise<void> {
    await this.prisma.userRecovery.deleteMany({
      where: { userId: userId.getValue() },
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.userRecovery.update({
      where: { id },
      data: {
        active: false,
        updatedAt: new Date(),
      },
    });
  }
}
