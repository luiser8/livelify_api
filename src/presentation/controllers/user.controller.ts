import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Guards and Decorators
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { DefaultThrottle } from '../decorators/throttle.decorator';
import * as currentUserDecorator from '../decorators/current-user.decorator';

// DTOs
import {
  CreateUserWithProfileDto,
  UpdateUserProfileDto,
  CreateUserWithProfileResponseDto,
  UserProfileResponseDto,
} from '../dtos/user';
import {
  ActivateAccountDto,
  ActivateAccountResponseDto,
} from '../dtos/user/activate-account.dto';

// Use Cases
import { CreateUserWithProfileUseCase } from '../../application/use-cases/user/create-user-with-profile.use-case';
import { ActivateAccountUseCase } from '../../application/use-cases/user/activate-account.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id.use-case';
import { GetSubscriptionByUserIdUseCase } from '../../application/use-cases/subscription/get-subscription-by-user.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/user/update-user-profile.use-case';
import {
  CreateUserSubscriptionUseCase,
  CreateUserWithSubscriptionResponse,
} from '../../application/use-cases/subscription/create-user-with-subscription.use-case';
import {
  UpdateUserSubscriptionUseCase,
  UpdateUserWithSubscriptionResponse,
} from '../../application/use-cases/subscription/update-user-subscription.use-case';
import { CreateUserSubscriptionDto } from '../dtos/subscription/create-user-subscription.dto';
import { UserSubscriptionResponseDto } from '../dtos/subscription/user-subscription.dto';
import { CreateUserContextDto } from '../dtos/context/create-user-context.dto';
import { CreateUserContextResponseDto } from '../dtos/context/create-user-context-response.dto';
import {
  CreateUserWithContextResponse,
  CreateUserWithContextUseCase,
} from '../../application/use-cases/context/create-user-with-context.use-case';
import { GetContextByUserIdUseCase } from '../../application/use-cases/context/get-context-by-user.use-case';
import { GetUserContextsResponseDto } from '../dtos/context/context-response.dto';
import { DeleteUserContextUseCase } from '../../application/use-cases/context/delete-user-context.use-case';
import { DeleteUserContextResponseDto } from '../dtos/context/delete-user-context.dto';
import { GetUserCompleteProfileUseCase } from '../../application/use-cases/user/get-user-complete-profile.use-case';
import { UserCompleteProfileResponseDto } from '../dtos/user/user-complete-profile.dto';
import { UpdateUserSubscriptionDto } from '../dtos/subscription/update-user-subscription.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(
    private readonly createUserWithProfileUseCase: CreateUserWithProfileUseCase,
    private readonly activateAccountUseCase: ActivateAccountUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly createUserSubscriptionUseCase: CreateUserSubscriptionUseCase,
    private readonly getSubscriptionByUserIdUseCase: GetSubscriptionByUserIdUseCase,
    private readonly createUserWithContextUseCase: CreateUserWithContextUseCase,
    private readonly getContextByUserIdUseCase: GetContextByUserIdUseCase,
    private readonly deleteUserContextUseCase: DeleteUserContextUseCase,
    private readonly updateSubscriptionUseCase: UpdateUserSubscriptionUseCase,
    private readonly getUserCompleteProfileUseCase: GetUserCompleteProfileUseCase,
  ) {}

  @Post('register')
  @Public()
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user with complete profile',
    description: 'Rate limited: 5 registrations per 15 minutes per IP',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully with profile',
    type: CreateUserWithProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - user already exists' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async register(
    @Body() createUserDto: CreateUserWithProfileDto,
  ): Promise<CreateUserWithProfileResponseDto> {
    try {
      const result = await this.createUserWithProfileUseCase.execute({
        email: createUserDto.email,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        address: createUserDto.address,
        phone: createUserDto.phone,
        avatarUrl: createUserDto.avatarUrl,
        acceptTermsAndPolicies: createUserDto.acceptTermsAndPolicies,
        currencyId: createUserDto.currencyId,
        language: createUserDto.language as 'es' | 'en' | undefined,
      });

      return result;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === 'User with this email already exists'
      ) {
        throw new ConflictException('User with this email already exists');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during registration');
    }
  }

  @Post('activate')
  @Public()
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate user account',
    description:
      'Activates a user account using the hash sent via email. Rate limited: 5 attempts per 15 minutes per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Account activated successfully',
    type: ActivateAccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid or expired hash',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async activateAccount(
    @Body() activateAccountDto: ActivateAccountDto,
  ): Promise<ActivateAccountResponseDto> {
    try {
      const result = await this.activateAccountUseCase.execute({
        hash: activateAccountDto.hash,
      });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Put('update')
  @DefaultThrottle() // 🌐 Rate limited
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Rate limited: 10 updates per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async update(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    try {
      const result = await this.updateUserProfileUseCase.execute({
        userId: user.sub,
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        address: updateProfileDto.address,
        phone: updateProfileDto.phone,
        avatarUrl: updateProfileDto.avatarUrl,
        password: updateProfileDto.password,
      });

      return result;
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  @Post('add-subscription')
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a new subscription for the user',
    description: 'Rate limited: 5 subscriptions per 15 minutes per IP',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription added successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user subscription already exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async addSubscription(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
    @Body() createSubscriptionDto: CreateUserSubscriptionDto,
  ): Promise<CreateUserWithSubscriptionResponse> {
    try {
      const result = await this.createUserSubscriptionUseCase.execute({
        userId: user.sub,
        planId: createSubscriptionDto.planId,
        currencyId: createSubscriptionDto.currencyId,
        amountPaid: createSubscriptionDto.amountPaid,
        paymentMethod: createSubscriptionDto.paymentMethod,
        paymentProvider: createSubscriptionDto.paymentProvider,
      });

      if (result) {
        // Map the use case response to the expected DTO
        return result;
      }

      throw new Error('Failed to create subscription');
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'User with this subscription already exists'
      ) {
        throw new ConflictException(
          'User with this subscription already exists',
        );
      }
      throw error;
    }
  }

  @Put('update-subscription')
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a subscription for the user',
    description: 'Rate limited: 5 subscriptions per 15 minutes per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user subscription not exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async updateSubscription(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
    @Body() updateSubscriptionDto: UpdateUserSubscriptionDto,
  ): Promise<UpdateUserWithSubscriptionResponse> {
    try {
      const result = await this.updateSubscriptionUseCase.execute({
        id: updateSubscriptionDto.id,
        userId: user.sub,
        planId: updateSubscriptionDto.planId,
        currencyId: updateSubscriptionDto.currencyId,
        autoRenew: updateSubscriptionDto.autoRenew,
        amountPaid: updateSubscriptionDto.amountPaid,
        paymentMethod: updateSubscriptionDto.paymentMethod,
        paymentProvider: updateSubscriptionDto.paymentProvider,
      });

      if (result) {
        // Map the use case response to the expected DTO
        return result;
      }

      throw new Error('Failed to update subscription');
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'User with this subscription already exists'
      ) {
        throw new ConflictException(
          'User with this subscription already exists',
        );
      }
      throw error;
    }
  }

  @Get('my-subscription')
  @DefaultThrottle() // 🌐 Rate limited
  @ApiOperation({
    summary: 'Get current user subscription',
    description: 'Rate limited: 100 requests per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user subscription',
    type: UserSubscriptionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async mySubscription(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
  ): Promise<UserSubscriptionResponseDto> {
    try {
      const result = await this.getSubscriptionByUserIdUseCase.execute({
        userId: user.sub,
      });
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  @Post('add-context')
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a new context for the user',
    description: 'Rate limited: 5 contexts per 15 minutes per IP',
  })
  @ApiResponse({
    status: 201,
    description: 'Context added successfully',
    type: CreateUserContextResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user subscription already exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async addContext(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
    @Body() createUserContextDto: CreateUserContextDto,
  ): Promise<CreateUserWithContextResponse> {
    try {
      const result = await this.createUserWithContextUseCase.execute({
        userId: user.sub,
        name: createUserContextDto.name,
      });

      if (result) {
        // Map the use case response to the expected DTO
        return result;
      }

      throw new Error('Failed to create context');
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'User with this context already exists'
      ) {
        throw new ConflictException('User with this context already exists');
      }
      throw error;
    }
  }

  @Get('my-contexts')
  @DefaultThrottle() // 🌐 Rate limited
  @ApiOperation({
    summary: 'Get current user contexts',
    description: 'Rate limited: 100 requests per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user contexts',
    type: GetUserContextsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async myContexts(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
  ): Promise<GetUserContextsResponseDto> {
    try {
      const contexts = await this.getContextByUserIdUseCase.execute({
        userId: user.sub,
      });

      // Format response
      const formattedContexts =
        contexts?.map((context) => ({
          id: context.id,
          name: context.name,
          canDelete: context.canDelete,
          actionsCount: context.actionsCount,
          createdAt: context.createdAt,
          updatedAt: context.updatedAt,
        })) || [];

      return {
        contexts: formattedContexts,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  @Delete('delete-context/:contextId')
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a user context',
    description:
      'Allows a user to delete one of their own contexts. Rate limited: 100 requests per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Context deleted successfully',
    type: DeleteUserContextResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - context has associated actions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - context does not belong to user',
  })
  @ApiResponse({ status: 404, description: 'Context not found' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async deleteContext(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
    @Param('contextId') contextId: string,
  ): Promise<DeleteUserContextResponseDto> {
    try {
      const result = await this.deleteUserContextUseCase.execute({
        contextId,
        userId: user.sub,
      });

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw error;
    }
  }

  @Get('me')
  @DefaultThrottle() // 🌐 Rate limited
  @ApiOperation({
    summary: 'Get complete user profile',
    description:
      'Retrieves complete user profile including subscription, contexts, lifewheel, projects, goals, and actions',
  })
  @ApiResponse({
    status: 200,
    description: 'Complete user profile retrieved successfully',
    type: UserCompleteProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async getCompleteProfile(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.JwtPayload,
  ): Promise<UserCompleteProfileResponseDto> {
    try {
      const result = await this.getUserCompleteProfileUseCase.execute({
        userId: user.sub,
      });
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
