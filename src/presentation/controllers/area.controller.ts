/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, UseGuards, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Guards and Decorators
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DefaultThrottle } from '../decorators/throttle.decorator';

// DTOs

// Use Cases
import { GetAllAreasUseCase } from 'src/application/use-cases/area/get-all-areas.use-case';
import { GetAllAreasResponseDto } from '../dtos/area/area-response.dto';

@ApiTags('Area')
@Controller('area')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AreaController {
  constructor(private readonly getAllAreaUseCase: GetAllAreasUseCase) {}

  @Get('all')
  @DefaultThrottle() // 🌐 Rate limited
  @ApiOperation({
    summary: 'Get all areas',
    description: 'Rate limited: 100 requests per minute per IP',
  })
  @ApiResponse({
    status: 200,
    description: 'Areas',
    type: GetAllAreasResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests - rate limit exceeded',
  })
  async all(): Promise<GetAllAreasResponseDto> {
    try {
      const areas = await this.getAllAreaUseCase.execute();
      
      // Format response
      const formattedAreas = areas.map((area, index) => ({
        id: area.id.getValue(), // Include ID
        name: area.name,
        description: '', // Area entity doesn't have description
        icon: undefined, // Area entity doesn't have icon
        order: index + 1, // Use array index as order
        isActive: true, // Default to true since Area entity doesn't have isActive
      }));

      return {
        areas: formattedAreas,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Areas not found') {
        throw new NotFoundException('Areas not found');
      }
      throw error;
    }
  }
}
