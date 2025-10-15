import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user/user.entity';
import { UserProfile } from '../../../domain/entities/user/user-profile.entity';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { Email } from '../../../domain/value-objects/user/email.value-object';
import { Password } from '../../../domain/value-objects/user/password.value-object';
import { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import { PrismaService } from '../../database/prisma.service';
import { UserSubscriptionResponseDto } from 'src/presentation/dtos/subscription/user-subscription.dto';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const userData = user.toPlainObject();

    const savedUser = await this.prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        password: userData.password,
        currencyId: userData.currencyId,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      include: {
        profile: true,
      },
    });

    return this.toDomainEntity(savedUser);
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
      include: {
        profile: true,
      },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async findSubscriptionById(
    id: UserId,
  ): Promise<UserSubscriptionResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.getValue() }, // 🔑 convertir UserId a string
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!user || !user.subscription) return null;

    const subscription = user.subscription;

    return {
      id: subscription.id,
      currencyId: subscription.currencyId,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      renewalDate: subscription.renewalDate ?? undefined,
      active: subscription.active,
      autoRenew: subscription.autoRenew,
      amountPaid: subscription.amountPaid ?? undefined,
      paymentMethod: subscription.paymentMethod as any,
      paymentProvider: subscription.paymentProvider as any,
      plan: subscription.plan
        ? {
            id: subscription.plan.id,
            name: subscription.plan.name,
            description: subscription.plan.description ?? '',
            basePrice: subscription.plan.basePrice,
            pricePerMonth: subscription.plan.pricePerMonth,
            savings: subscription.plan.savings ?? undefined,
            discount: subscription.plan.discount ?? undefined,
            billingCycle: subscription.plan.billingCycle,
            bestFor: subscription.plan.bestFor,
            features: subscription.plan.features as Record<string, any>,
          }
        : undefined,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
      include: {
        profile: true,
      },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async update(user: User): Promise<User> {
    const userData = user.toPlainObject();

    const updatedUser = await this.prisma.user.update({
      where: { id: userData.id },
      data: {
        email: userData.email,
        password: userData.password,
        currencyId: userData.currencyId,
        updatedAt: userData.updatedAt,
      },
      include: {
        profile: true,
      },
    });

    return this.toDomainEntity(updatedUser);
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.getValue() },
    });
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: offset,
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => this.toDomainEntity(user));
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.getValue() },
    });
    return count > 0;
  }

  async existsById(id: UserId): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }

  async findUsersWithProfiles(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        profile: {
          isNot: null,
        },
      },
      include: {
        profile: true,
      },
    });

    return users.map((user) => this.toDomainEntity(user));
  }

  async findUsersByCreationDate(from: Date, to: Date): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      include: {
        profile: true,
      },
    });

    return users.map((user) => this.toDomainEntity(user));
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  private toDomainEntity(prismaUser: {
    id: string;
    email: string;
    password: string;
    currencyId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    profile?: {
      id: string;
      firstName: string;
      lastName: string;
      address: string;
      phone: string;
      avatarUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    plan?: {
      id: string;
      name: string;
      description: string;
      price: string;
      features: {
        actions: number;
        projects: number;
        analytics: string;
      };
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }): User {
    const userId = UserId.fromString(prismaUser.id);
    const email = new Email(prismaUser.email);
    const password = Password.fromHash(prismaUser.password);

    let profile: UserProfile | undefined;
    if (prismaUser.profile) {
      profile = UserProfile.reconstitute({
        id: prismaUser.profile.id,
        userId,
        firstName: prismaUser.profile.firstName,
        lastName: prismaUser.profile.lastName,
        address: prismaUser.profile.address,
        phone: prismaUser.profile.phone,
        avatarUrl: prismaUser.profile.avatarUrl ?? undefined,
        createdAt: prismaUser.profile.createdAt,
        updatedAt: prismaUser.profile.updatedAt,
      });
    }

    return User.reconstitute({
      id: userId,
      email,
      password,
      currencyId: prismaUser.currencyId ?? undefined,
      profile,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
