import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateProjectGoalUseCase } from '../../application/use-cases/goal/create-project-goal.use-case';
import { GetUserGoalsUseCase } from '../../application/use-cases/goal/get-user-goals.use-case';
import {
  CreateProjectGoalDto,
  CreateProjectGoalResponseDto,
} from '../dtos/goal/create-project-goal.dto';
import { GetUserGoalsResponseDto } from '../dtos/goal/get-user-goals.dto';

@ApiTags('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('goals')
export class GoalController {
  constructor(
    private readonly createProjectGoalUseCase: CreateProjectGoalUseCase,
    private readonly getUserGoalsUseCase: GetUserGoalsUseCase,
  ) {}

  @Post('add')
  @ApiOperation({
    summary: 'Create project goal',
    description:
      'Creates a new goal for a project detail with BE, DO, or HAVE type',
  })
  @ApiResponse({
    status: 201,
    description: 'Goal created successfully',
    type: CreateProjectGoalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Project detail not found',
  })
  async createProjectGoal(
    @CurrentUser('sub') userId: string,
    @Body() createGoalDto: CreateProjectGoalDto,
  ): Promise<CreateProjectGoalResponseDto> {
    return await this.createProjectGoalUseCase.execute({
      userId,
      ...createGoalDto,
    });
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get user goals',
    description:
      'Retrieves all goals for the authenticated user with statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'User goals retrieved successfully',
    type: GetUserGoalsResponseDto,
  })
  async getUserGoals(
    @CurrentUser('sub') userId: string,
  ): Promise<GetUserGoalsResponseDto> {
    return await this.getUserGoalsUseCase.execute({ userId });
  }
}
