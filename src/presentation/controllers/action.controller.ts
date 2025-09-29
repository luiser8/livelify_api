import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateGtdActionUseCase } from '../../application/use-cases/action/create-gtd-action.use-case';
import { GetUserActionsUseCase } from '../../application/use-cases/action/get-user-actions.use-case';
import { CompleteActionUseCase } from '../../application/use-cases/action/complete-action.use-case';
import {
  CreateGtdActionDto,
  CreateGtdActionResponseDto,
} from '../dtos/action/create-gtd-action.dto';
import {
  GetUserActionsQueryDto,
  GetUserActionsResponseDto,
} from '../dtos/action/get-user-actions.dto';

@ApiTags('actions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('actions')
export class ActionController {
  constructor(
    private readonly createGtdActionUseCase: CreateGtdActionUseCase,
    private readonly getUserActionsUseCase: GetUserActionsUseCase,
    private readonly completeActionUseCase: CompleteActionUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create GTD action',
    description:
      'Creates a new action for a project goal with context assignment',
  })
  @ApiResponse({
    status: 201,
    description: 'Action created successfully',
    type: CreateGtdActionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Goal or context not found',
  })
  async createGtdAction(
    @CurrentUser('sub') userId: string,
    @Body() createActionDto: CreateGtdActionDto,
  ): Promise<CreateGtdActionResponseDto> {
    return await this.createGtdActionUseCase.execute({
      userId,
      ...createActionDto,
    });
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get user actions',
    description:
      'Retrieves all actions for the authenticated user with optional filtering',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['all', 'pending', 'completed', 'overdue'],
    description: 'Filter actions by status',
  })
  @ApiResponse({
    status: 200,
    description: 'User actions retrieved successfully',
    type: GetUserActionsResponseDto,
  })
  async getUserActions(
    @CurrentUser('sub') userId: string,
    @Query() query: GetUserActionsQueryDto,
  ): Promise<GetUserActionsResponseDto> {
    return await this.getUserActionsUseCase.execute({
      userId,
      filter: query.filter,
    });
  }

  @Put(':actionId/complete')
  @ApiOperation({
    summary: 'Complete action',
    description: 'Marks an action as completed',
  })
  @ApiParam({
    name: 'actionId',
    description: 'Action ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Action completed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Action not found',
  })
  async completeAction(
    @CurrentUser('sub') userId: string,
    @Param('actionId') actionId: string,
  ) {
    return await this.completeActionUseCase.execute({
      userId,
      actionId,
    });
  }
}
