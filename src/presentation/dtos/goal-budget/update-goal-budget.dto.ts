import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { GoalBudgetResponseDto } from './create-goal-budget.dto';

export class UpdateGoalBudgetDto {
  @ApiProperty({
    description: 'Updated base capital',
    example: 3500,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseCapital?: number;

  @ApiProperty({
    description: 'Updated multiplier factor',
    example: 1.5,
    required: false,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  multiplier?: number;
}

export class UpdateGoalBudgetResponseDto {
  @ApiProperty({
    description: 'Updated goal budget information',
    type: GoalBudgetResponseDto,
  })
  goalBudget: GoalBudgetResponseDto;
}
