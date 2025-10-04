import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { USER_TOKEN_REPOSITORY_TOKEN } from '../../ports/tokens';
import type { UserTokenRepositoryInterface } from '../../../domain/repositories/user/user-token.repository.interface';
import { CustomLoggerService } from '../../../infrastructure/config/logger.service';

export interface VerifyTokenRequest {
  userId: string;
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  userId?: string;
  email?: string;
  expiresAt?: Date;
  message: string;
}

@Injectable()
export class VerifyTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(USER_TOKEN_REPOSITORY_TOKEN)
    private readonly userTokenRepository: UserTokenRepositoryInterface,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('VerifyTokenUseCase');
  }

  async execute(request: VerifyTokenRequest): Promise<VerifyTokenResponse> {
    this.logger.log(`Verifying token for user: ${request.userId}`);

    try {
      // 1. Verify JWT signature and expiration
      const jwtSecret = this.configService.get<string>('APP_JWT_SECRET');
      if (!jwtSecret) {
        this.logger.error('JWT secret not configured');
        return {
          valid: false,
          message: 'Server configuration error',
        };
      }

      const payload = await this.jwtService.verifyAsync(request.token, {
        secret: jwtSecret,
      });

      this.logger.debug(`Token decoded successfully for user: ${payload.sub}`);

      // 2. Verify token type is access token
      if (payload.type !== 'access') {
        this.logger.warn(`Invalid token type: ${payload.type}`);
        return {
          valid: false,
          message: 'Invalid token type',
        };
      }

      // 3. Verify user ID matches
      if (payload.sub !== request.userId) {
        this.logger.warn('Token user ID does not match request user ID');
        return {
          valid: false,
          message: 'Token does not belong to this user',
        };
      }

      // 4. Verify token exists in database (not revoked/logged out)
      const storedToken =
        await this.userTokenRepository.findByAccessToken(request.token);
      
      if (!storedToken) {
        this.logger.warn('Token not found in database (revoked or expired)');
        return {
          valid: false,
          message: 'Token has been revoked or does not exist',
        };
      }

      // 5. Verify token is still valid (not expired in database)
      if (storedToken.isExpired()) {
        this.logger.warn('Token has expired in database');
        return {
          valid: false,
          message: 'Token has expired',
        };
      }

      // 6. Token is valid
      this.logger.log(`Token verified successfully for user: ${request.userId}`);
      
      return {
        valid: true,
        userId: payload.sub,
        email: payload.email,
        expiresAt: storedToken.getExpiresAt(),
        message: 'Token is valid',
      };
    } catch (error) {
      // JWT verification failed (expired, invalid signature, etc.)
      if (error instanceof Error) {
        this.logger.warn(`Token verification failed: ${error.message}`);
        
        if (error.message.includes('expired')) {
          return {
            valid: false,
            message: 'Token has expired',
          };
        }
        
        if (error.message.includes('invalid signature')) {
          return {
            valid: false,
            message: 'Invalid token signature',
          };
        }
      }

      return {
        valid: false,
        message: 'Token verification failed',
      };
    }
  }
}

