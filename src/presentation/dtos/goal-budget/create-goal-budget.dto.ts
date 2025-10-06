import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Length,
} from 'class-validator';

export class CreateGoalBudgetDto {
  @ApiProperty({
    description: 'ID of the goal to create budget for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  goalId: string;

  @ApiProperty({
    description: 'Base capital for the goal',
    example: 3000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  baseCapital: number;

  @ApiProperty({
    description: 'Multiplier factor (default: 1.3)',
    example: 1.3,
    required: false,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  multiplier?: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currencyCode: string;
}

export class GoalBudgetResponseDto {
  @ApiProperty({
    description: 'Goal Budget ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Goal ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  goalId: string;

  @ApiProperty({
    description: 'Base capital',
    example: 3000,
  })
  baseCapital: number;

  @ApiProperty({
    description: 'Multiplier factor',
    example: 1.3,
  })
  multiplier: number;

  @ApiProperty({
    description: 'Total capital (baseCapital * multiplier)',
    example: 3900,
  })
  totalCapital: number;

  @ApiProperty({
    description: 'Monthly budget (IMO)',
    example: 650,
  })
  monthlyBudget: number;

  @ApiProperty({
    description: 'Daily budget (IDO)',
    example: 21.66,
  })
  dailyBudget: number;

  @ApiProperty({
    description: 'Project duration in months',
    example: 6,
  })
  projectMonths: number;

  @ApiProperty({
    description: 'Project duration in days',
    example: 180,
  })
  projectDays: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currencyCode: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '$',
  })
  currencySymbol: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CreateGoalBudgetResponseDto {
  @ApiProperty({
    description: 'Created goal budget information',
    type: GoalBudgetResponseDto,
  })
  goalBudget: GoalBudgetResponseDto;
}
