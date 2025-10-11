/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { USER_TOKEN_REPOSITORY_TOKEN } from '../../application/ports/tokens';
import type { UserTokenRepositoryInterface } from 'src/domain/repositories/user/user-token.repository.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    @Inject(USER_TOKEN_REPOSITORY_TOKEN)
    private readonly userTokenRepository: UserTokenRepositoryInterface,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const jwtSecret = this.configService.get<string>('APP_JWT_SECRET');
      if (!jwtSecret) {
        throw new UnauthorizedException('JWT secret not configured');
      }

      // 1. Verify JWT signature and expiration
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });

      // 2. Verify token exists in database (not revoked/logged out)
      const storedToken =
        await this.userTokenRepository.findByAccessToken(token);
      if (!storedToken) {
        throw new UnauthorizedException('Token has been revoked or expired');
      }

      // 3. Verify token is still valid (not expired in database)
      if (storedToken.isExpired()) {
        throw new UnauthorizedException('Token has expired');
      }

      // 4. Verify token type is access token
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Attach user payload to request
      request['user'] = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
