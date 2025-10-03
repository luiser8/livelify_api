import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Guards and Decorators
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DefaultThrottle } from '../decorators/throttle.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

// DTOs
import {
  CreateProjectFromLifeWheelAreaDto,
  CreateProjectFromLifeWheelAreaResponseDto,
} from '../dtos/project/create-project.dto';
import { GetUserProjectsResponseDto } from '../dtos/project/get-user-projects.dto';
import { GetProjectsByAreaQueryDto } from '../dtos/project/get-projects-by-area.dto';

// Use Cases
import { CreateProjectFromLifeWheelAreaUseCase } from '../../application/use-cases/project/create-project-from-lifewheel-area.use-case';
import { GetUserProjectsUseCase } from '../../application/use-cases/project/get-user-projects.use-case';
import { GetProjectsByAreaUseCase } from '../../application/use-cases/project/get-projects-by-area.use-case';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProjectController {
  constructor(
    private readonly createProjectFromLifeWheelAreaUseCase: CreateProjectFromLifeWheelAreaUseCase,
    private readonly getUserProjectsUseCase: GetUserProjectsUseCase,
    private readonly getProjectsByAreaUseCase: GetProjectsByAreaUseCase,
  ) {}

  @Post('from-lifewheel-area')
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a GTD project from a LifeWheelArea',
    description:
      'Creates a new GTD project and its detail from a specific LifeWheelArea. This allows users to create actionable projects based on their life areas.',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: CreateProjectFromLifeWheelAreaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid dates',
  })
  @ApiResponse({
    status: 404,
    description: 'LifeWheelArea not found',
  })
  async createProjectFromLifeWheelArea(
    @Body() createProjectDto: CreateProjectFromLifeWheelAreaDto,
    @CurrentUser() user: { sub: string },
  ): Promise<CreateProjectFromLifeWheelAreaResponseDto> {
    try {
      const result = await this.createProjectFromLifeWheelAreaUseCase.execute({
        userId: user.sub,
        lifeWheelAreaId: createProjectDto.lifeWheelAreaId,
        title: createProjectDto.title,
        description: createProjectDto.description,
        startDate: createProjectDto.startDate,
        endDate: createProjectDto.endDate,
      });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new NotFoundException(error.message);
        }
        if (
          error.message.includes('date') ||
          error.message.includes('before') ||
          error.message.includes('past')
        ) {
          throw new BadRequestException(error.message);
        }
      }
      throw error;
    }
  }

  @Get('me')
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all projects for the current user',
    description:
      'Retrieve all GTD projects created by the authenticated user, including their details and statistics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: GetUserProjectsResponseDto,
  })
  async getMyProjects(
    @CurrentUser() user: { sub: string },
  ): Promise<GetUserProjectsResponseDto> {
    try {
      const result = await this.getUserProjectsUseCase.execute({
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

  @Get('by-area')
  @DefaultThrottle() // 🌐 Rate limited
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get projects by LifeWheelArea',
    description:
      'Retrieve all GTD projects for a specific LifeWheelArea, including their details and statistics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: GetUserProjectsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid area ID',
  })
  async getProjectsByArea(
    @Query() query: GetProjectsByAreaQueryDto,
  ): Promise<GetUserProjectsResponseDto> {
    try {
      const result = await this.getProjectsByAreaUseCase.execute({
        lifeWheelAreaId: query.area,
      });

      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof Error && error.message.includes('Invalid')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
