import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../../domain/entities/user/user.entity';
import { UserProfile } from '../../../domain/entities/user/user-profile.entity';
import { Email } from '../../../domain/value-objects/user/email.value-object';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import type { UserProfileRepositoryInterface } from '../../../domain/repositories/user/user-profile.repository.interface';
import type { CurrencyRepositoryInterface } from '../../../domain/repositories/currency/currency.repository.interface';
import { CreateLifeWheelWithAreasUseCase } from '../lifewheel/create-lifewheel-with-areas.use-case';
import {
  USER_REPOSITORY_TOKEN,
  USER_PROFILE_REPOSITORY_TOKEN,
} from '../../ports/tokens';
import { CURRENCY_REPOSITORY_TOKEN } from '../../ports/budget';

export interface CreateUserWithProfileRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  avatarUrl?: string;
  acceptTermsAndPolicies: boolean;
  currencyId?: string;
}

export interface CreateUserWithProfileResponse {
  id: string;
  email: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    address: string;
    phone: string;
    avatarUrl?: string;
    acceptTermsAndPolicies: boolean;
  };
  lifeWheel: {
    id: string;
    globalScore: number;
    lifeAreas: {
      id: string;
      areaId: string;
      areaName: string;
      score: number;
    }[];
  };
  createdAt: Date;
}

@Injectable()
export class CreateUserWithProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_PROFILE_REPOSITORY_TOKEN)
    private readonly userProfileRepository: UserProfileRepositoryInterface,
    @Inject(CURRENCY_REPOSITORY_TOKEN)
    private readonly currencyRepository: CurrencyRepositoryInterface,
    private readonly createLifeWheelWithAreasUseCase: CreateLifeWheelWithAreasUseCase,
  ) {}

  async execute(
    request: CreateUserWithProfileRequest,
  ): Promise<CreateUserWithProfileResponse> {
    // 1. Validate business rules
    const email = new Email(request.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // 2. Get or validate currency
    let currencyId = request.currencyId;
    if (!currencyId) {
      // Get USD currency by default
      const usdCurrency = await this.currencyRepository.findByCode('USD');
      if (!usdCurrency) {
        throw new Error('Default currency USD not found in database');
      }
      currencyId = usdCurrency.id.getValue();
    }

    // 3. Create domain entity
    const user = await User.create(request.email, request.password);
    user.updateCurrency(currencyId);

    // 4. Persist user
    const savedUser = await this.userRepository.save(user);

    // 5. Create user profile
    const profile = UserProfile.create({
      userId: savedUser.id,
      firstName: request.firstName,
      lastName: request.lastName,
      address: request.address,
      phone: request.phone,
      avatarUrl: request.avatarUrl,
      acceptTermsAndPolicies: request.acceptTermsAndPolicies,
    });

    // 6. Persist profile
    const savedProfile = await this.userProfileRepository.save(profile);

    // 7. Update user with profile
    savedUser.updateProfile(savedProfile);
    await this.userRepository.update(savedUser);

    // 8. Create LifeWheel with all predefined areas
    const lifeWheelResponse =
      await this.createLifeWheelWithAreasUseCase.execute({
        userId: savedUser.id.getValue(),
      });

    // 9. Return response
    return {
      id: savedUser.id.getValue(),
      email: savedUser.email.getValue(),
      profile: {
        id: savedProfile.id,
        firstName: savedProfile.firstName,
        lastName: savedProfile.lastName,
        fullName: savedProfile.fullName,
        address: savedProfile.address,
        phone: savedProfile.phone,
        avatarUrl: savedProfile.avatarUrl,
        acceptTermsAndPolicies: savedProfile.acceptTermsAndPolicies,
      },
      lifeWheel: {
        id: lifeWheelResponse.id,
        globalScore: lifeWheelResponse.globalScore,
        lifeAreas: lifeWheelResponse.lifeAreas,
      },
      createdAt: savedUser.createdAt,
    };
  }
}
