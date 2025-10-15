/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserId } from '../../../domain/value-objects/user/user-id.value-object';
import { CustomLoggerService } from '../../../infrastructure/config/logger.service';
import type * as ms from 'ms';
import type { UserRepositoryInterface } from '../../../domain/repositories/user/user.repository.interface';
import type { UserTokenRepositoryInterface } from '../../../domain/repositories/user/user-token.repository.interface';
import type { UserProfileRepositoryInterface } from '../../../domain/repositories/user/user-profile.repository.interface';
import {
  USER_REPOSITORY_TOKEN,
  USER_TOKEN_REPOSITORY_TOKEN,
  USER_PROFILE_REPOSITORY_TOKEN,
} from '../../ports/tokens';

export interface RefreshTokenRequest {
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
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('RefreshTokenUseCase');
  }

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const startTime = Date.now();
    this.logger.log('Token refresh attempt');

    try {
      // 1. Verify and decode refresh token
      this.logger.debug('Verifying refresh token');
      const jwtSecret = this.configService.get<string>('APP_JWT_SECRET');
      if (!jwtSecret) {
        this.logger.error('JWT secret not configured');
        throw new Error('JWT secret not configured');
      }

      const decoded = await this.jwtService.verifyAsync(request.refresh_token, {
        secret: jwtSecret,
      });

      this.logger.debug(`Token decoded for user: ${decoded.sub}`);

      // 2. Check if it's a refresh token
      if (decoded.type !== 'refresh') {
        this.logger.warn(`Invalid token type: ${decoded.type}`);
        throw new Error('Invalid token type');
      }

      // 3. Extract userId from the refresh token
      const userId = UserId.fromString(decoded.sub);
      this.logger.debug(`Extracted userId from token: ${userId.getValue()}`);

      // 4. Find the stored token in database
      const storedToken = await this.userTokenRepository.findByRefreshToken(
        request.refresh_token,
      );
      if (!storedToken) {
        this.logger.warn('Refresh token not found in database');
        throw new Error('Token not found or expired');
      }

      // 5. Verify the stored token belongs to the same user
      if (!storedToken.getUserId().equals(userId)) {
        this.logger.error('Token ownership mismatch');
        throw new Error('Token ownership mismatch');
      }

      // 6. Verify user still exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        this.logger.error(`User not found: ${userId.getValue()}`);
        throw new Error('User not found');
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
        currencyId: user.currencyId,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
      };

      const newRefreshTokenPayload = {
        sub: user.id.getValue(),
        email: user.email.getValue(),
        firstName: userProfile.getFirstName(),
        lastName: userProfile.getLastName(),
        phone: userProfile.getPhone(),
        currencyId: user.currencyId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
      };

      const accessTokenExpiresIn = (this.configService.get<string>(
        'APP_JWT_EXPIRE',
      ) || '1h') as ms.StringValue;
      const newAccessToken = await this.jwtService.signAsync(
        newAccessTokenPayload,
        {
          expiresIn: accessTokenExpiresIn,
        },
      );

      const refreshTokenExpiresIn = (this.configService.get<string>(
        'APP_JWT_REFRESH_EXPIRE',
      ) || '24h') as ms.StringValue;
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

      const duration = Date.now() - startTime;
      this.logger.log(
        `Token refresh successful for user ${decoded.sub} in ${duration}ms`,
      );

      // 11. Return new tokens
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Token refresh failed in ${duration}ms: ${error.message}`,
      );
      this.logger.logSecurityEvent('Refresh token validation failed', {
        error: error.message,
        duration,
      });
      throw new Error('Invalid or expired refresh token');
    }
  }
}
