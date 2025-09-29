/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import type { UserTokenRepositoryInterface } from '../../../domain/repositories/user/user-token.repository.interface';
import type { UserProfileRepositoryInterface } from '../../../domain/repositories/user/user-profile.repository.interface';
import {
  USER_REPOSITORY_TOKEN,
  USER_TOKEN_REPOSITORY_TOKEN,
  USER_PROFILE_REPOSITORY_TOKEN,
} from '../../ports/tokens';

export interface RefreshTokenRequest {
  userId?: string; // Optional: user ID from access token for additional validation
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class RefreshTokenUseCase {
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

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      // 1. Verify refresh token
      const jwtSecret = this.configService.get<string>('APP_JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT secret not configured');
      }

      const decoded = await this.jwtService.verifyAsync(request.refresh_token, {
        secret: jwtSecret,
      });

      // 2. Check if it's a refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // 3. Additional validation: if userId provided, verify it matches the token
      if (request.userId && decoded.sub !== request.userId) {
        throw new Error('Access token and refresh token user mismatch');
      }

      // 4. Find the stored token in database
      const storedToken = await this.userTokenRepository.findByRefreshToken(
        request.refresh_token,
      );
      if (!storedToken) {
        throw new Error('Token not found or expired');
      }

      // 5. Verify user still exists
      const userId = UserId.fromString(decoded.sub);
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 6. Additional security: verify the stored token belongs to the same user
      if (!storedToken.getUserId().equals(userId)) {
        throw new Error('Token ownership mismatch');
      }

      // 7. Get user profile for personal data
      const userProfile = await this.userProfileRepository.findByUserId(
        user.id,
      );
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // 8. Generate new tokens with user claims including personal data
      const newAccessTokenPayload = {
        sub: user.id.getValue(),
        email: user.email.getValue(),
        firstName: userProfile.getFirstName(),
        lastName: userProfile.getLastName(),
        phone: userProfile.getPhone(),
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
      };

      const newRefreshTokenPayload = {
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
      const newAccessToken = await this.jwtService.signAsync(
        newAccessTokenPayload,
        {
          expiresIn: accessTokenExpiresIn,
        },
      );

      const refreshTokenExpiresIn = this.configService.get<string>(
        'APP_JWT_REFRESH_EXPIRE',
        '24h',
      );
      const newRefreshToken = await this.jwtService.signAsync(
        newRefreshTokenPayload,
        {
          expiresIn: refreshTokenExpiresIn,
        },
      );

      // 9. Calculate new expiration date
      const expiresAt = new Date();
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
        expiresAt.setHours(expiresAt.getHours() + 1);
      }

      // 10. Update stored tokens
      const updatedToken = storedToken.updateTokens(
        newAccessToken,
        newRefreshToken,
        expiresAt,
      );

      await this.userTokenRepository.save(updatedToken);

      // 11. Return new tokens
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
