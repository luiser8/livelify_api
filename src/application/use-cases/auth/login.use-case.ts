/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Email } from '../../../domain/value-objects/user/email.value-object';
import { UserToken } from '../../../domain/entities/user/user-token.entity';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import type { UserTokenRepositoryInterface } from '../../../domain/repositories/user/user-token.repository.interface';
import type { UserProfileRepositoryInterface } from '../../../domain/repositories/user/user-profile.repository.interface';
import {
  USER_REPOSITORY_TOKEN,
  USER_TOKEN_REPOSITORY_TOKEN,
  USER_PROFILE_REPOSITORY_TOKEN,
} from '../../ports/tokens';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(USER_TOKEN_REPOSITORY_TOKEN)
    private readonly userTokenRepository: UserTokenRepositoryInterface,
    @Inject(USER_PROFILE_REPOSITORY_TOKEN)
    private readonly userProfileRepository: UserProfileRepositoryInterface,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // 1. Create email value object
    const email = new Email(request.email);

    // 2. Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 3. Validate password
    const isPasswordValid = await user.validatePassword(request.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 4. Get user profile for personal data
    const userProfile = await this.userProfileRepository.findByUserId(user.id);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // 5. Generate JWT tokens with user claims including personal data
    const accessTokenPayload = {
      sub: user.id.getValue(),
      email: user.email.getValue(),
      firstName: userProfile.getFirstName(),
      lastName: userProfile.getLastName(),
      phone: userProfile.getPhone(),
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
    };

    const refreshTokenPayload = {
      sub: user.id.getValue(),
      email: user.email.getValue(),
      firstName: userProfile.getFirstName(),
      lastName: userProfile.getLastName(),
      phone: userProfile.getPhone(),
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    };

    const accessTokenExpiresIn = this.configService.get<string>(
      'APP_JWT_EXPIRE',
      '1h',
    );

    // Validate JWT secret is available
    const jwtSecret = this.configService.get<string>('APP_JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: accessTokenExpiresIn,
    });

    const refreshTokenExpiresIn = this.configService.get<string>(
      'APP_JWT_REFRESH_EXPIRE',
      '24h',
    );
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      expiresIn: refreshTokenExpiresIn, // Refresh token expires based on config
    });

    // 6. Calculate expiration date for access token
    const expiresAt = new Date();
    // Parse the expiration time (1h = 1 hour)
    const timeMatch = accessTokenExpiresIn.match(/^(\d+)([hdm])$/);
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2];
      switch (unit) {
        case 'h':
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case 'd':
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
        case 'm':
          expiresAt.setMinutes(expiresAt.getMinutes() + value);
          break;
      }
    } else {
      // Default to 1 hour if format is not recognized
      expiresAt.setHours(expiresAt.getHours() + 1);
    }

    // 7. Save tokens to database
    const userToken = UserToken.create(
      user.id,
      accessToken,
      refreshToken,
      expiresAt,
    );

    await this.userTokenRepository.save(userToken);

    // 8. Return response with tokens
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
