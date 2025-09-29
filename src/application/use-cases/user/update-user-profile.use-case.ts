import { Injectable, Inject } from '@nestjs/common';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { UserProfile } from '../../../domain/entities/user/user-profile.entity';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import type { UserProfileRepositoryInterface } from '../../../domain/repositories/user/user-profile.repository.interface';
import {
  USER_REPOSITORY_TOKEN,
  USER_PROFILE_REPOSITORY_TOKEN,
} from '../../ports/tokens';

export interface UpdateUserProfileRequest {
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  avatarUrl?: string;
}

export interface UpdateUserProfileResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  address: string;
  phone: string;
  avatarUrl?: string;
  updatedAt: Date;
}

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_PROFILE_REPOSITORY_TOKEN)
    private readonly userProfileRepository: UserProfileRepositoryInterface,
  ) {}

  async execute(
    request: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> {
    // 1. Validate user exists
    const userId = UserId.fromString(request.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Check if profile exists or create new one
    let profile = await this.userProfileRepository.findByUserId(userId);

    if (profile) {
      // Update existing profile
      profile.updatePersonalInfo(request.firstName, request.lastName);
      profile.updateContactInfo(request.address, request.phone);
      if (request.avatarUrl) {
        profile.updateAvatar(request.avatarUrl);
      }
    } else {
      // Create new profile
      profile = UserProfile.create({
        userId,
        firstName: request.firstName,
        lastName: request.lastName,
        address: request.address,
        phone: request.phone,
        avatarUrl: request.avatarUrl,
      });
    }

    // 3. Save profile
    const savedProfile = await this.userProfileRepository.save(profile);

    // 4. Update user entity with profile
    user.updateProfile(savedProfile);
    await this.userRepository.update(user);

    // 5. Return response
    return {
      id: savedProfile.id,
      userId: savedProfile.userId.getValue(),
      firstName: savedProfile.firstName,
      lastName: savedProfile.lastName,
      fullName: savedProfile.fullName,
      address: savedProfile.address,
      phone: savedProfile.phone,
      avatarUrl: savedProfile.avatarUrl,
      updatedAt: savedProfile.updatedAt,
    };
  }
}
