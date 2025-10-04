/* eslint-disable no-useless-catch */
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';

// Guards and Decorators
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { DefaultThrottle } from '../decorators/throttle.decorator';
import * as currentUserDecorator from '../decorators/current-user.decorator';

// DTOs
import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
} from '../dtos/auth';
import { VerifyTokenResponseDto } from '../dtos/auth/verify-token.dto';

// Use Cases
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { VerifyTokenUseCase } from '../../application/use-cases/auth/verify-token.use-case';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly verifyTokenUseCase: VerifyTokenUseCase,
  ) {}

  @Post('login')
  @Public()
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user and get JWT tokens',
    description: 'Rate limited: 5 attempts per 15 minutes per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const result = await this.loginUseCase.execute({
        email: loginDto.email,
        password: loginDto.password,
      });

      return result;
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  @Post('refresh')
  @Public() // 🔓 Public endpoint - no access token required
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token using refresh token',
    description:
      'Only requires refresh token in request body. The user ID is extracted from the refresh token. Rate limited: 10 requests per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or expired refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    try {
      const result = await this.refreshTokenUseCase.execute({
        refresh_token: refreshTokenDto.refresh_token,
      });

      return result;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Invalid or expired refresh token'
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  @Post('logout')
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user and invalidate tokens',
    description: 'Rate limited: 10 requests per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async logout(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
  ): Promise<LogoutResponseDto> {
    try {
      const result = await this.logoutUseCase.execute({
        userId: user.sub,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('verify-token')
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify if the current access token is valid',
    description:
      'Checks if the access token in the Authorization header is still valid and not expired or revoked. Rate limited: 10 requests per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Token verification result',
    type: VerifyTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async verifyToken(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
    @Req() request: Request,
  ): Promise<VerifyTokenResponseDto> {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header is required');
      }

      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid authorization format');
      }

      const result = await this.verifyTokenUseCase.execute({
        userId: user.sub,
        token,
      });

      return result;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
