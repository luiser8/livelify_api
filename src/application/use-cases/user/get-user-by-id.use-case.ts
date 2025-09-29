import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../ports/tokens';

export interface GetUserByIdRequest {
  id: string;
}

export interface GetUserByIdResponse {
  id: string;
  email: string;
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    address: string;
    phone: string;
    avatarUrl?: string;
  };
  plan?: {
    id: string;
    name: string;
    description: string;
    price: string;
    features: { actions: number; projects: number; analytics: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(request: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    // 1. Create value object
    const userId = UserId.fromString(request.id);

    // 2. Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 3. Return response
    return {
      id: user.id.getValue(),
      email: user.email.getValue(),
      profile: user.profile
        ? {
            id: user.profile.id,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            fullName: user.profile.fullName,
            address: user.profile.address,
            phone: user.profile.phone,
            avatarUrl: user.profile.avatarUrl,
          }
        : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
