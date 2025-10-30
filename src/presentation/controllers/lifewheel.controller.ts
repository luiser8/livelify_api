import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  Post,
  Body,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Guards and Decorators
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
//import { PublicThrottle } from '../decorators/throttle.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

// DTOs
import { GetUserLifeWheelResponseDto } from '../dtos/lifewheel/get-user-lifewheel.dto';
import {
  UnlockLifeWheelAreasDto,
  UnlockLifeWheelAreasResponseDto,
} from '../dtos/lifewheel/unlock-lifewheel-areas.dto';

// Use Cases
import { GetUserLifeWheelUseCase } from '../../application/use-cases/lifewheel/get-user-lifewheel.use-case';
import { UnlockLifeWheelAreasUseCase } from '../../application/use-cases/lifewheel/unlock-lifewheel-areas.use-case';
import { DefaultThrottle } from '../decorators/throttle.decorator';
import {
  CreateUserSelectedAreasResponse,
  CreateUserSelectedAreasUseCase,
} from 'src/application/use-cases/user/create-select-user-areas.use-case';
import { CreateSelectUserAreasDto } from '../dtos/user/create-select-user-areas.dto';

@ApiTags('LifeWheel')
@Controller('lifewheel')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LifeWheelController {
  constructor(
    private readonly getUserLifeWheelUseCase: GetUserLifeWheelUseCase,
    private readonly unlockLifeWheelAreasUseCase: UnlockLifeWheelAreasUseCase,
    private readonly createUserSelectedAreasUseCase: CreateUserSelectedAreasUseCase,
  ) {}

  @Get('me')
  @DefaultThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current user LifeWheel with all areas and scores',
    description:
      'Retrieve the LifeWheel for the authenticated user, including all areas with their current scores.',
  })
  @ApiResponse({
    status: 200,
    description: 'LifeWheel retrieved successfully',
    type: GetUserLifeWheelResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'LifeWheel not found for user',
  })
  async getMyLifeWheel(
    @CurrentUser() user: { sub: string },
  ): Promise<GetUserLifeWheelResponseDto> {
    try {
      const result = await this.getUserLifeWheelUseCase.execute({
        userId: user.sub,
      });

      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post('add-lifewheel-areas')
  @DefaultThrottle()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Add a new area to the user's LifeWheel",
    description: 'Rate limited: 5 areas per 15 minutes per IP',
  })
  @ApiResponse({
    status: 201,
    description: 'Area added successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user area already exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async addAreaSelected(
    @CurrentUser() user: { sub: string },
    @Body() createSelectUserAreasDto: CreateSelectUserAreasDto,
  ): Promise<CreateUserSelectedAreasResponse> {
    try {
      const result = await this.createUserSelectedAreasUseCase.execute({
        userId: user.sub,
        lifeWheelId: createSelectUserAreasDto.lifeWheelId,
        areasIds: createSelectUserAreasDto.areaIds,
      });

      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post('unlock-areas')
  @DefaultThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unlock selected LifeWheel areas for project creation',
    description:
      'Unlock exactly 3 LifeWheelArea IDs to enable project creation for those areas. This is typically done after the user completes the questionnaire.',
  })
  @ApiResponse({
    status: 200,
    description: 'Areas unlocked successfully',
    type: UnlockLifeWheelAreasResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - must select exactly 3 areas or areas already unlocked',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - areas do not belong to your LifeWheel',
  })
  @ApiResponse({
    status: 404,
    description: 'One or more LifeWheelAreas not found',
  })
  async unlockAreas(
    @CurrentUser() user: { sub: string },
    @Body() unlockDto: UnlockLifeWheelAreasDto,
  ): Promise<UnlockLifeWheelAreasResponseDto> {
    try {
      return await this.unlockLifeWheelAreasUseCase.execute({
        userId: user.sub,
        lifeWheelAreaIds: unlockDto.lifeWheelAreaIds,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}
