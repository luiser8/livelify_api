import { Injectable } from '@nestjs/common';
import { UserProfile } from '../../../domain/entities/user/user-profile.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { PrismaService } from '../../database/prisma.service';
import { UserProfileRepositoryInterface } from 'src/domain/repositories/user/user-profile.repository.interface';

@Injectable()
export class UserProfileRepository implements UserProfileRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(profile: UserProfile): Promise<UserProfile> {
    const profileData = profile.toPlainObject();

    const savedProfile = await this.prisma.userProfile.upsert({
      where: { userId: profileData.userId },
      create: {
        id: profileData.id,
        userId: profileData.userId,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        address: profileData.address,
        phone: profileData.phone,
        avatarUrl: profileData.avatarUrl,
        acceptTermsAndPolicies: profileData.acceptTermsAndPolicies,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      },
      update: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        address: profileData.address,
        phone: profileData.phone,
        avatarUrl: profileData.avatarUrl,
        acceptTermsAndPolicies: profileData.acceptTermsAndPolicies,
        updatedAt: profileData.updatedAt,
      },
    });

    return this.toDomainEntity(savedProfile);
  }

  async findById(id: string): Promise<UserProfile | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id },
    });

    return profile ? this.toDomainEntity(profile) : null;
  }

  async findByUserId(userId: UserId): Promise<UserProfile | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: userId.getValue() },
    });

    return profile ? this.toDomainEntity(profile) : null;
  }

  async update(profile: UserProfile): Promise<UserProfile> {
    const profileData = profile.toPlainObject();

    const updatedProfile = await this.prisma.userProfile.update({
      where: { id: profileData.id },
      data: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        address: profileData.address,
        phone: profileData.phone,
        avatarUrl: profileData.avatarUrl,
        acceptTermsAndPolicies: profileData.acceptTermsAndPolicies,
        updatedAt: profileData.updatedAt,
      },
    });

    return this.toDomainEntity(updatedProfile);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userProfile.delete({
      where: { id },
    });
  }

  async findAll(limit?: number, offset?: number): Promise<UserProfile[]> {
    const profiles = await this.prisma.userProfile.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return profiles.map((profile) => this.toDomainEntity(profile));
  }

  async existsByUserId(userId: UserId): Promise<boolean> {
    const count = await this.prisma.userProfile.count({
      where: { userId: userId.getValue() },
    });
    return count > 0;
  }

  async searchByName(name: string): Promise<UserProfile[]> {
    const profiles = await this.prisma.userProfile.findMany({
      where: {
        OR: [
          { firstName: { contains: name, mode: 'insensitive' } },
          { lastName: { contains: name, mode: 'insensitive' } },
        ],
      },
    });

    return profiles.map((profile) => this.toDomainEntity(profile));
  }

  async findProfilesWithAvatar(): Promise<UserProfile[]> {
    const profiles = await this.prisma.userProfile.findMany({
      where: {
        avatarUrl: {
          not: null,
        },
      },
    });

    return profiles.map((profile) => this.toDomainEntity(profile));
  }

  private toDomainEntity(prismaProfile: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    avatarUrl: string | null;
    acceptTermsAndPolicies: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfile {
    return UserProfile.reconstitute({
      id: prismaProfile.id,
      userId: UserId.fromString(prismaProfile.userId),
      firstName: prismaProfile.firstName,
      lastName: prismaProfile.lastName,
      address: prismaProfile.address,
      phone: prismaProfile.phone,
      avatarUrl: prismaProfile.avatarUrl ?? undefined,
      acceptTermsAndPolicies: prismaProfile.acceptTermsAndPolicies,
      createdAt: prismaProfile.createdAt,
      updatedAt: prismaProfile.updatedAt,
    });
  }
}
