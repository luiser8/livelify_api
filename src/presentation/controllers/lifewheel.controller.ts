import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Guards and Decorators
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PublicThrottle } from '../decorators/throttle.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

// DTOs
import { GetUserLifeWheelResponseDto } from '../dtos/lifewheel/get-user-lifewheel.dto';

// Use Cases
import { GetUserLifeWheelUseCase } from '../../application/use-cases/lifewheel/get-user-lifewheel.use-case';

@ApiTags('LifeWheel')
@Controller('lifewheel')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LifeWheelController {
  constructor(
    private readonly getUserLifeWheelUseCase: GetUserLifeWheelUseCase,
  ) {}

  @Get('me')
  @PublicThrottle() // 100 requests per minute
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
}
