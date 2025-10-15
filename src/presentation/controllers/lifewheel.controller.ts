/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  Post,
  Body,
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

// Use Cases
import { GetUserLifeWheelUseCase } from '../../application/use-cases/lifewheel/get-user-lifewheel.use-case';
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
}
