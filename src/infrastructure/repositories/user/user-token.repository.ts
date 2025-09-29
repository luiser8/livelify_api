import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserToken } from '../../../domain/entities/user/user-token.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { UserToken as PrismaUserToken } from '@prisma/client';
import { UserTokenRepositoryInterface } from 'src/domain/repositories/user/user-token.repository.interface';

@Injectable()
export class UserTokenRepository implements UserTokenRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  private toDomainEntity(prismaUserToken: PrismaUserToken): UserToken {
    return UserToken.reconstitute(
      prismaUserToken.id,
      UserId.fromString(prismaUserToken.userId),
      prismaUserToken.accessToken,
      prismaUserToken.refreshToken, // Keep as string | null to match entity
      prismaUserToken.expiresAt,
      prismaUserToken.createdAt,
      prismaUserToken.updatedAt,
    );
  }

  async save(userToken: UserToken): Promise<UserToken> {
    const data = {
      userId: userToken.getUserId().getValue(),
      accessToken: userToken.getAccessToken(),
      refreshToken: userToken.getRefreshToken(),
      expiresAt: userToken.getExpiresAt(),
    };

    const savedToken = await this.prisma.userToken.upsert({
      where: {
        userId: userToken.getUserId().getValue(), // ✅ Usar userId como clave única
      },
      update: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        updatedAt: new Date(),
      },
      create: {
        id: userToken.getId(), // ✅ Incluir ID al crear
        ...data,
      },
    });

    return this.toDomainEntity(savedToken);
  }

  async findByUserId(userId: UserId): Promise<UserToken | null> {
    const userToken = await this.prisma.userToken.findUnique({
      where: {
        userId: userId.getValue(), // ✅ userId es único, usar findUnique
      },
    });

    // ✅ Verificar expiración en el código (más flexible)
    if (userToken && userToken.expiresAt > new Date()) {
      return this.toDomainEntity(userToken);
    }

    return null;
  }

  async findByAccessToken(accessToken: string): Promise<UserToken | null> {
    const userToken = await this.prisma.userToken.findFirst({
      where: {
        accessToken,
        expiresAt: {
          gt: new Date(), // Only return non-expired tokens
        },
      },
    });

    return userToken ? this.toDomainEntity(userToken) : null;
  }

  async findByRefreshToken(refreshToken: string): Promise<UserToken | null> {
    const userToken = await this.prisma.userToken.findFirst({
      where: {
        refreshToken,
        expiresAt: {
          gt: new Date(), // Only return non-expired tokens
        },
      },
    });

    return userToken ? this.toDomainEntity(userToken) : null;
  }

  async deleteByUserId(userId: UserId): Promise<void> {
    await this.prisma.userToken.deleteMany({
      where: { userId: userId.getValue() },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.prisma.userToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
