import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateBudgetForProjectUseCase } from '../../application/use-cases/budget/create-budget-for-project.use-case';
import { UpdateBudgetUseCase } from '../../application/use-cases/budget/update-budget.use-case';
import { GetUserBudgetsUseCase } from '../../application/use-cases/budget/get-user-budgets.use-case';
import {
  CreateBudgetForProjectDto,
  CreateBudgetForProjectResponseDto,
} from '../dtos/budget/create-budget.dto';
import {
  UpdateBudgetDto,
  UpdateBudgetResponseDto,
} from '../dtos/budget/update-budget.dto';
import { GetUserBudgetsResponseDto } from '../dtos/budget/get-user-budgets.dto';

@ApiTags('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('budgets')
export class BudgetController {
  constructor(
    private readonly createBudgetForProjectUseCase: CreateBudgetForProjectUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly getUserBudgetsUseCase: GetUserBudgetsUseCase,
  ) {}

  @Post('for-project')
  @ApiOperation({
    summary: 'Create budget for project',
    description: 'Creates a new budget for a specific GTD project',
  })
  @ApiResponse({
    status: 201,
    description: 'Budget created successfully',
    type: CreateBudgetForProjectResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found or currency not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Project already has a budget',
  })
  async createBudgetForProject(
    @CurrentUser('sub') userId: string,
    @Body() createBudgetDto: CreateBudgetForProjectDto,
  ): Promise<CreateBudgetForProjectResponseDto> {
    return await this.createBudgetForProjectUseCase.execute({
      userId,
      ...createBudgetDto,
    });
  }

  @Put(':budgetId')
  @ApiOperation({
    summary: 'Update budget',
    description: 'Updates an existing budget',
  })
  @ApiParam({
    name: 'budgetId',
    description: 'Budget ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Budget updated successfully',
    type: UpdateBudgetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async updateBudget(
    @CurrentUser('sub') userId: string,
    @Param('budgetId') budgetId: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ): Promise<UpdateBudgetResponseDto> {
    return await this.updateBudgetUseCase.execute({
      userId,
      budgetId,
      ...updateBudgetDto,
    });
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get user budgets',
    description: 'Retrieves all budgets for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User budgets retrieved successfully',
    type: GetUserBudgetsResponseDto,
  })
  async getUserBudgets(
    @CurrentUser('sub') userId: string,
  ): Promise<GetUserBudgetsResponseDto> {
    return await this.getUserBudgetsUseCase.execute({ userId });
  }
}
